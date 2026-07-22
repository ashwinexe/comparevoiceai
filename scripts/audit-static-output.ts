import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { BlogPost } from "../shared/blog-types";
import { pricingCatalog } from "../shared/pricing-catalog";
import { DEFAULT_OG_IMAGE_HEIGHT, DEFAULT_OG_IMAGE_WIDTH, voiceAIFAQs } from "../shared/site-core";
import { siteContent } from "../shared/site-content";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(projectRoot, "dist");
const generatedPostsPath = path.join(projectRoot, "client", "src", "generated", "blog-posts.json");
const blogSourceRoot = path.join(projectRoot, "blog", "posts");
const baseUrl = "https://comparevoiceai.com";

function occurrences(source: string, pattern: RegExp): number {
  return [...source.matchAll(pattern)].length;
}

function decodeHtml(value: string): string {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function extractOne(html: string, pattern: RegExp, label: string): string {
  const match = html.match(pattern);
  assert.ok(match?.[1], `missing ${label}`);
  return decodeHtml(match[1].trim());
}

function outputPath(route: string): string {
  if (route === "/") return path.join(distRoot, "index.html");
  return path.join(distRoot, route.replace(/^\//, ""), "index.html");
}

function canonicalUrl(route: string): string {
  return route === "/" ? `${baseUrl}/` : `${baseUrl}${route.replace(/\/$/, "")}/`;
}

function localTargetPath(reference: string, route: string): string | null {
  const url = new URL(reference, canonicalUrl(route));
  if (url.origin !== baseUrl) return null;
  const pathname = decodeURIComponent(url.pathname);
  const target = pathname === "/"
    ? path.join(distRoot, "index.html")
    : /\.[a-z0-9]+$/i.test(pathname)
      ? path.join(distRoot, pathname.replace(/^\//, ""))
      : path.join(distRoot, pathname.replace(/^\//, "").replace(/\/$/, ""), "index.html");
  const relative = path.relative(distRoot, target);
  assert.ok(!relative.startsWith("..") && !path.isAbsolute(relative), `${reference} escapes the static root`);
  return target;
}

function jsonLdBlocks(html: string): object[] {
  return [...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]) as object);
}

async function assertFile(filePath: string): Promise<void> {
  await access(filePath);
  assert.ok((await stat(filePath)).size > 0, `${filePath} must not be empty`);
}

async function assertLocalReference(reference: string, route: string): Promise<void> {
  if (!reference || reference.startsWith("#")) return;
  const target = localTargetPath(reference, route);
  if (target) await assertFile(target);
}

async function main(): Promise<void> {
  const posts = JSON.parse(await readFile(generatedPostsPath, "utf8")) as BlogPost[];
  const routes = [
    "/",
    "/stt",
    "/tts",
    "/llm",
    "/providers",
    "/blog",
    ...posts.map((post) => `/blog/${post.slug}`),
    "/privacy",
    "/terms",
  ];
  const fixedCopyByRoute = new Map<string, { title: string; description: string; h1: string }>([
    ["/", siteContent.home],
    ["/stt", siteContent.stt],
    ["/tts", siteContent.tts],
    ["/llm", siteContent.llm],
    ["/providers", siteContent.providers],
    ["/blog", siteContent.blog],
    ["/privacy", siteContent.privacy],
    ["/terms", siteContent.terms],
  ]);
  for (const post of posts) {
    fixedCopyByRoute.set(`/blog/${post.slug}`, {
      title: post.title,
      description: post.description,
      h1: post.title,
    });

    const source = await readFile(path.join(blogSourceRoot, `${post.slug}.md`), "utf8");
    const frontMatter = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    assert.ok(frontMatter, `${post.slug} source is missing front matter`);
    assert.equal(post.content, frontMatter[2].trim(), `${post.slug} generated content is stale`);
    for (const [field, expected] of [
      ["title", post.title],
      ["date", post.date],
      ["updated", post.updated],
      ["description", post.description],
    ] as const) {
      const frontMatterValue: string | undefined = frontMatter[1].match(new RegExp(`^${field}\\s*:\\s*["']?(.+?)["']?\\s*$`, "m"))?.[1];
      assert.equal(frontMatterValue, expected, `${post.slug} generated ${field} is stale`);
    }
  }

  const htmlByRoute = new Map<string, string>();
  for (const route of routes) {
    const html = await readFile(outputPath(route), "utf8");
    htmlByRoute.set(route, html);
    assert.match(html, /<main\b/i, `${route} must contain extractable main content`);
    assert.match(html, /<h1\b[^>]*>[^<]+<\/h1>/i, `${route} must contain a visible H1`);
    assert.equal(occurrences(html, /<title>/gi), 1, `${route} must contain exactly one title`);
    assert.equal(occurrences(html, /<meta\s+name=["']description["']/gi), 1, `${route} must contain exactly one description`);
    assert.equal(occurrences(html, /<link\s+rel=["']canonical["']/gi), 1, `${route} must contain exactly one canonical`);
    assert.match(html, new RegExp(`<meta\\s+property=["']og:image:width["']\\s+content=["']${DEFAULT_OG_IMAGE_WIDTH}["']`, "i"), `${route} must declare the social-image width`);
    assert.match(html, new RegExp(`<meta\\s+property=["']og:image:height["']\\s+content=["']${DEFAULT_OG_IMAGE_HEIGHT}["']`, "i"), `${route} must declare the social-image height`);
    assert.match(
      html,
      new RegExp(`<link\\s+rel=["']canonical["']\\s+href=["']${canonicalUrl(route).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "i"),
      `${route} canonical must identify that exact route`,
    );
    assert.ok(jsonLdBlocks(html).length > 0, `${route} must contain valid JSON-LD`);
    const schemaIds = [...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*data-json-ld=["']([^"']+)["']/gi)].map((match) => match[1]);
    assert.equal(new Set(schemaIds).size, schemaIds.length, `${route} must not contain duplicate JSON-LD IDs`);
    assert.doesNotMatch(html, /replit-dev-banner|localhost:|127\.0\.0\.1:/i, `${route} contains development-only markup`);

    const copy = fixedCopyByRoute.get(route);
    assert.ok(copy, `missing shared copy expectation for ${route}`);
    assert.equal(extractOne(html, /<title>([\s\S]*?)<\/title>/i, `${route} title`), copy.title, `${route} title drifted from shared copy`);
    assert.equal(
      extractOne(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i, `${route} description`),
      copy.description,
      `${route} description drifted from shared copy`,
    );
    assert.equal(
      extractOne(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i, `${route} H1`).replace(/<[^>]+>/g, ""),
      copy.h1,
      `${route} H1 drifted from shared copy`,
    );

    for (const match of html.matchAll(/\shref=["']([^"'#]+)["']/gi)) {
      await assertLocalReference(match[1], route);
    }
    for (const match of html.matchAll(/\s(?:src|poster)=["']([^"']+)["']/gi)) {
      await assertLocalReference(match[1], route);
    }
    for (const match of html.matchAll(/\ssrcset=["']([^"']+)["']/gi)) {
      for (const candidate of match[1].split(",")) {
        await assertLocalReference(candidate.trim().split(/\s+/)[0] ?? "", route);
      }
    }
  }

  const homeHtml = htmlByRoute.get("/")!;
  const homeTypes = jsonLdBlocks(homeHtml).map((schema) => (schema as { "@type"?: string })["@type"]);
  assert.ok(homeTypes.includes("WebApplication"), "home must describe the calculator application");
  assert.ok(homeTypes.includes("FAQPage"), "home must expose the same visible FAQ content as FAQPage data");
  assert.equal(occurrences(homeHtml, /<article\s+class=["']faq-item["']/gi), voiceAIFAQs.length, "home must render every FAQ in static HTML");
  for (const faq of voiceAIFAQs) assert.ok(homeHtml.includes(faq.question), `home is missing the visible FAQ question: ${faq.question}`);

  const providerCount = new Set(
    [...pricingCatalog.llm, ...pricingCatalog.stt, ...pricingCatalog.tts].map((record) => record.provider),
  ).size;
  const expectedItemCounts: Record<string, number> = {
    "/stt": pricingCatalog.stt.filter((record) => record.status === "active" || record.status === "preview").length,
    "/tts": pricingCatalog.tts.filter((record) => record.status === "active" || record.status === "preview").length,
    "/llm": pricingCatalog.llm.filter((record) => record.status === "active" || record.status === "preview").length,
    "/providers": providerCount,
  };
  for (const route of Object.keys(expectedItemCounts)) {
    const collection = jsonLdBlocks(htmlByRoute.get(route)!).find(
      (schema) => (schema as { "@type"?: string })["@type"] === "CollectionPage",
    ) as { mainEntity?: { "@type"?: string; numberOfItems?: number } } | undefined;
    assert.equal(collection?.mainEntity?.["@type"], "ItemList", `${route} must contain a static ItemList`);
    assert.equal(collection?.mainEntity?.numberOfItems, expectedItemCounts[route], `${route} ItemList count drifted`);
  }

  const dataset = jsonLdBlocks(htmlByRoute.get("/providers")!).find(
    (schema) => (schema as { "@type"?: string })["@type"] === "Dataset",
  ) as {
    url?: string;
    dateModified?: string;
    distribution?: { contentUrl?: string; encodingFormat?: string };
  } | undefined;
  assert.equal(dataset?.url, `${baseUrl}/providers/`, "Dataset must use the visible provider catalog as its landing page");
  assert.equal(dataset?.dateModified, pricingCatalog.verifiedAt);
  assert.equal(dataset?.distribution?.contentUrl, `${baseUrl}/data/pricing-catalog.json`);
  assert.equal(dataset?.distribution?.encodingFormat, "application/json");
  assert.match(htmlByRoute.get("/providers")!, /href=["']\/data\/pricing-catalog\.json["']/i, "Dataset landing page must link to its JSON download");

  for (const post of posts) {
    const route = `/blog/${post.slug}`;
    const article = jsonLdBlocks(htmlByRoute.get(route)!).find(
      (schema) => (schema as { "@type"?: string })["@type"] === "BlogPosting",
    ) as {
      dateModified?: string;
      image?: unknown;
      publisher?: { logo?: unknown };
    } | undefined;
    assert.equal(article?.dateModified, post.updated ?? post.date, `${route} has a stale dateModified`);
    assert.ok(article?.image, `${route} must include an article image`);
    assert.ok(article?.publisher?.logo, `${route} publisher must include a logo`);
    assert.match(htmlByRoute.get(route)!, new RegExp(`<meta\\s+property=["']article:published_time["']\\s+content=["']${post.date}["']`, "i"), `${route} is missing article:published_time`);
    assert.match(htmlByRoute.get(route)!, new RegExp(`<meta\\s+property=["']article:modified_time["']\\s+content=["']${post.updated}["']`, "i"), `${route} is missing article:modified_time`);
  }

  const notFound = await readFile(path.join(distRoot, "404.html"), "utf8");
  assert.match(notFound, /name=["']robots["'][^>]+noindex/i, "404.html must be noindex");

  const sitemap = await readFile(path.join(distRoot, "sitemap.xml"), "utf8");
  const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(
    new Set(sitemapLocations),
    new Set(routes.map(canonicalUrl)),
    "sitemap URL set drifted from the generated route set",
  );
  assert.equal(sitemapLocations.length, routes.length, "sitemap must not contain duplicate URLs");
  assert.equal(occurrences(sitemap, /<lastmod>/g), routes.length, "every sitemap URL must have a lastmod");

  const robots = await readFile(path.join(distRoot, "robots.txt"), "utf8");
  assert.match(robots, new RegExp(`Sitemap: ${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/sitemap\\.xml`));
  await assertFile(path.join(distRoot, "llms.txt"));

  const publishedCatalog = JSON.parse(
    await readFile(path.join(distRoot, "data", "pricing-catalog.json"), "utf8"),
  ) as unknown;
  assert.deepEqual(publishedCatalog, pricingCatalog, "published pricing catalog drifted from the source");

  console.log(`Audited ${routes.length} indexable static routes, 404.html, discovery files, links, schemas, and pricing data.`);
}

await main();
