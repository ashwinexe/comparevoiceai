import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type { BlogPost } from "../shared/blog-types";
import { pricingCatalog } from "../shared/pricing-catalog";
import type { PricingRecordBase } from "../shared/providers";

const projectRoot = path.resolve(import.meta.dirname, "..");
const postsDirectory = path.join(projectRoot, "blog", "posts");
const blogAssetsDirectory = path.join(projectRoot, "blog", "assets");
const generatedDirectory = path.join(projectRoot, "client", "src", "generated");
const publicBlogAssetsDirectory = path.join(projectRoot, "client", "public", "blog", "assets");
const publicDataDirectory = path.join(projectRoot, "client", "public", "data");

interface PricingCatalogShape {
  llm: readonly PricingRecordBase[];
  stt: readonly PricingRecordBase[];
  tts: readonly PricingRecordBase[];
}

export function assertNoExpiredCalculatorPricing(
  catalog: PricingCatalogShape,
  asOfDate = new Date().toISOString().slice(0, 10),
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOfDate) || !Number.isFinite(Date.parse(`${asOfDate}T00:00:00Z`))) {
    throw new Error(`Pricing validation date must be a valid YYYY-MM-DD value; received ${asOfDate}`);
  }

  const expired = [...catalog.llm, ...catalog.stt, ...catalog.tts].filter(
    (record) =>
      record.calculatorEligible &&
      record.effectiveUntil !== undefined &&
      record.effectiveUntil < asOfDate,
  );

  if (expired.length > 0) {
    const details = expired
      .map((record) => `${record.id} (expired ${record.effectiveUntil})`)
      .join(", ");
    throw new Error(
      `Calculator pricing is stale as of ${asOfDate}: ${details}. Refresh the rate or make the expired row ineligible before generating static content.`,
    );
  }
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function plainTextExcerpt(markdown: string): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~|\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= 155) return text;
  const candidate = text.slice(0, 152).trimEnd();
  const lastWordBoundary = candidate.lastIndexOf(" ");
  const shortened = lastWordBoundary >= 110 ? candidate.slice(0, lastWordBoundary) : candidate;
  return `${shortened}...`;
}

function parseTags(value: string | undefined): string[] {
  if (!value) return [];
  return unquote(value)
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((tag) => unquote(tag).trim().toLowerCase())
    .filter(Boolean);
}

function parsePost(slug: string, source: string): BlogPost {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Missing front matter in blog post: ${slug}`);
  }

  const [, frontMatter, content] = match;
  const field = (name: string) => {
    const valueMatch = frontMatter.match(new RegExp(`^${name}\\s*:\\s*(.+)$`, "m"));
    return valueMatch ? unquote(valueMatch[1]) : undefined;
  };
  const nestedAuthorField = (name: string) => {
    const authorBlock = frontMatter.match(/^author\s*:\s*\n((?:^[ \t]+.*\n?)*)/m)?.[1] ?? "";
    const valueMatch = authorBlock.match(new RegExp(`^[ \\t]+${name}\\s*:\\s*(.+)$`, "m"));
    return valueMatch ? unquote(valueMatch[1]) : undefined;
  };

  const title = field("title");
  const date = field("date");
  const updated = field("updated");
  const description = field("description");
  if (!title || !date || !updated || !description) {
    throw new Error(`Blog post ${slug} must include title, date, updated, and description front matter`);
  }

  return {
    slug,
    title,
    date,
    updated,
    description,
    tags: parseTags(field("tags")),
    author: {
      name: nestedAuthorField("name") ?? "Nikhil R.",
      bio: nestedAuthorField("bio"),
      avatar: nestedAuthorField("avatar"),
    },
    excerpt: plainTextExcerpt(content),
    content: content.trim(),
    coverImage: field("coverImage"),
  };
}

export async function generateStaticContent() {
  assertNoExpiredCalculatorPricing(pricingCatalog);

  const fileNames = (await readdir(postsDirectory))
    .filter((fileName) => fileName.endsWith(".md"))
    .sort();

  const posts = await Promise.all(
    fileNames.map(async (fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const source = await readFile(path.join(postsDirectory, fileName), "utf8");
      return parsePost(slug, source);
    }),
  );

  posts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  await mkdir(generatedDirectory, { recursive: true });
  await writeFile(
    path.join(generatedDirectory, "blog-posts.json"),
    `${JSON.stringify(posts, null, 2)}\n`,
    "utf8",
  );

  await mkdir(publicBlogAssetsDirectory, { recursive: true });
  await cp(blogAssetsDirectory, publicBlogAssetsDirectory, {
    recursive: true,
    force: true,
  });

  await mkdir(publicDataDirectory, { recursive: true });
  await writeFile(
    path.join(publicDataDirectory, "pricing-catalog.json"),
    `${JSON.stringify(pricingCatalog, null, 2)}\n`,
    "utf8",
  );

  console.log(`Generated ${posts.length} static blog posts and the public pricing catalog.`);
}

const entryPoint = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (entryPoint === import.meta.url) {
  await generateStaticContent();
}
