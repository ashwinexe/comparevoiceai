import { chmod, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { BlogPost } from "../shared/blog-types";
import { pricingCatalog } from "../shared/pricing-catalog";
import {
  comparisonContent,
  pricingDatasetSchema,
  siteContent,
} from "../shared/site-content";
import {
  comparisonGuideLinks,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_URL,
  DEFAULT_OG_IMAGE_WIDTH,
  faqPageSchema,
  pricingLinksForTags,
  PRICING_CATALOG_PATH,
  publisherOrganization,
  SITE_URL,
  voiceAIFAQs,
  type PricingCategory,
  type SiteLink,
} from "../shared/site-core";

type PageDefinition = {
  route: string;
  title: string;
  description: string;
  body: string;
  type?: "website" | "article";
  image?: string;
  robots?: string;
  schemas?: object[];
  lastModified?: string;
  publishedTime?: string;
  modifiedTime?: string;
};

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(projectRoot, "dist");
const templatePath = path.join(distRoot, "index.html");
const postsPath = path.join(projectRoot, "client", "src", "generated", "blog-posts.json");
const baseUrl = SITE_URL;
const defaultImage = DEFAULT_OG_IMAGE_URL;
const verifiedAt = pricingCatalog.verifiedAt;

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeJsonForHtml(value: object): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function absoluteUrl(route: string): string {
  if (route === "/") return `${baseUrl}/`;
  if (/\.[a-z0-9]+$/i.test(route)) return `${baseUrl}${route}`;
  return `${baseUrl}${route.replace(/\/$/, "")}/`;
}

function safeUrl(value: string): string {
  const trimmed = value.trim();
  if (/^(https?:\/\/|\/|#)/i.test(trimmed)) return escapeHtml(trimmed);
  return "#";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "section";
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(date);
}

function number(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(value);
}

function money(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 0.01 ? 4 : 2,
    maximumFractionDigits: value < 0.01 ? 6 : 2,
  }).format(value);
}

function inlineMarkdown(source: string): string {
  const tokens: string[] = [];
  const token = (html: string) => {
    const marker = `\u0000${tokens.length}\u0000`;
    tokens.push(html);
    return marker;
  };

  let text = source
    .replace(/!\[([^\]]*)\]\(((?:[^()]|\([^)]*\))+)\)/g, (_match, alt: string, url: string) =>
      token(`<img src="${safeUrl(url)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">`),
    )
    .replace(/\[([^\]]+)\]\(((?:[^()]|\([^)]*\))+)\)/g, (_match, label: string, url: string) =>
      token(`<a href="${safeUrl(url)}">${escapeHtml(label)}</a>`),
    )
    .replace(/`([^`]+)`/g, (_match, code: string) => token(`<code>${escapeHtml(code)}</code>`));

  text = escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/(^|[^_])_([^_]+)_/g, "$1<em>$2</em>");

  return text.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => tokens[Number(index)] ?? "");
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const output: string[] = [];
  let paragraph: string[] = [];
  let list: "ul" | "ol" | null = null;
  let inCode = false;
  let codeLanguage = "";
  let code: string[] = [];

  const closeParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${inlineMarkdown(paragraph.join(" ").trim())}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (list) output.push(`</${list}>`);
    list = null;
  };
  const closeFlow = () => {
    closeParagraph();
    closeList();
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    const fence = line.match(/^```\s*([^\s]*)/);
    if (fence) {
      if (inCode) {
        output.push(`<pre><code${codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : ""}>${escapeHtml(code.join("\n"))}</code></pre>`);
        inCode = false;
        codeLanguage = "";
        code = [];
      } else {
        closeFlow();
        inCode = true;
        codeLanguage = fence[1] ?? "";
      }
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }

    if (!line.trim()) {
      closeFlow();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      closeFlow();
      const level = Math.max(2, heading[1].length);
      const headingText = heading[2].replace(/\s+#+$/, "");
      output.push(`<h${level} id="${slugify(headingText)}">${inlineMarkdown(headingText)}</h${level}>`);
      continue;
    }

    if (/^\s*\|/.test(line) && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1])) {
      closeFlow();
      const rows: string[][] = [];
      const splitRow = (row: string) => row.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
      const headers = splitRow(line);
      index += 2;
      while (index < lines.length && /^\s*\|/.test(lines[index])) {
        rows.push(splitRow(lines[index]));
        index += 1;
      }
      index -= 1;
      output.push("<div class=\"table-scroll\"><table><thead><tr>");
      output.push(headers.map((cell) => `<th scope="col">${inlineMarkdown(cell)}</th>`).join(""));
      output.push("</tr></thead><tbody>");
      for (const row of rows) {
        output.push(`<tr>${headers.map((_header, cellIndex) => `<td>${inlineMarkdown(row[cellIndex] ?? "")}</td>`).join("")}</tr>`);
      }
      output.push("</tbody></table></div>");
      continue;
    }

    const unordered = line.match(/^\s*[-+*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      closeParagraph();
      const nextList = ordered ? "ol" : "ul";
      if (list !== nextList) {
        closeList();
        list = nextList;
        output.push(`<${list}>`);
      }
      output.push(`<li>${inlineMarkdown((unordered ?? ordered)?.[1] ?? "")}</li>`);
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      closeFlow();
      output.push(`<blockquote><p>${inlineMarkdown(quote[1])}</p></blockquote>`);
      continue;
    }

    if (/^\s*(---+|___+|\*\*\*+)\s*$/.test(line)) {
      closeFlow();
      output.push("<hr>");
      continue;
    }

    paragraph.push(line.trim());
  }

  if (inCode) output.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  closeFlow();
  return output.join("\n");
}

function nav(): string {
  return `<a class="skip-link" href="#main-content">Skip to content</a>
  <nav class="static-nav" aria-label="Primary">
    <a href="/">Calculator</a><a href="/stt/">STT</a><a href="/tts/">TTS</a><a href="/llm/">LLM</a><a href="/providers/">Providers</a><a href="/blog/">Blog</a>
  </nav>`;
}

function footer(): string {
  return `<footer class="static-footer"><p>Prices are estimates based on public provider information verified ${escapeHtml(verifiedAt)}. Confirm purchase-critical pricing with the linked provider.</p><p><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/sitemap.xml">Sitemap</a></p></footer>`;
}

function layout(title: string, lead: string, content: string, options?: { breadcrumb?: string; notice?: string }): string {
  return `${nav()}<main id="main-content" class="static-page">
    ${options?.breadcrumb ?? ""}
    <header class="static-hero"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(lead)}</p></header>
    ${options?.notice ? `<aside class="static-notice">${escapeHtml(options.notice)}</aside>` : ""}
    ${content}
  </main>${footer()}`;
}

function breadcrumb(items: Array<{ name: string; route?: string }>): string {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items.map((item, index) => {
    const last = index === items.length - 1;
    return `<li>${last || !item.route ? `<span aria-current="page">${escapeHtml(item.name)}</span>` : `<a href="${safeUrl(item.route)}">${escapeHtml(item.name)}</a>`}</li>`;
  }).join("")}</ol></nav>`;
}

function breadcrumbSchema(items: Array<{ name: string; route: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.route),
    })),
  };
}

function guideLinks(title: string, links: readonly SiteLink[]): string {
  if (links.length === 0) return "";
  return `<section class="guide-links"><h2>${escapeHtml(title)}</h2><div class="article-grid">${links.map((link) => `<article class="article-card"><h3><a href="${safeUrl(link.href)}">${escapeHtml(link.title)}</a></h3><p>${escapeHtml(link.description)}</p></article>`).join("")}</div></section>`;
}

function faqSection(): string {
  return `<section aria-labelledby="voice-ai-faq-heading"><h2 id="voice-ai-faq-heading">Voice AI pricing questions</h2>${voiceAIFAQs.map((faq) => `<article class="faq-item"><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></article>`).join("")}</section>`;
}

function sourceLink(url: string, label: string): string {
  return `<a href="${safeUrl(url)}">Verify ${escapeHtml(label)} pricing</a>`;
}

function llmTable(limit?: number): string {
  const records = limit ? pricingCatalog.llm.slice(0, limit) : pricingCatalog.llm;
  return `<div class="table-scroll"><table><caption>Language-model API pricing per one million tokens</caption><thead><tr><th scope="col">Provider</th><th scope="col">Model</th><th scope="col">Status</th><th scope="col">Input</th><th scope="col">Output</th><th scope="col">Source</th></tr></thead><tbody>${records.map((record) => `<tr><td>${escapeHtml(record.provider)}</td><td>${escapeHtml(record.name)}</td><td>${escapeHtml(record.status)}</td><td>${record.inputCostPerMillion === null ? "Host-dependent" : money(record.inputCostPerMillion)}</td><td>${record.outputCostPerMillion === null ? "Host-dependent" : money(record.outputCostPerMillion)}</td><td>${sourceLink(record.sourceUrl, record.name)}</td></tr>`).join("")}</tbody></table></div>`;
}

function sttPrice(record: (typeof pricingCatalog.stt)[number]): string {
  if (record.costPerMinute !== null) {
    const unit = record.billingMetric === "session_minute" ? "session min" : "audio min";
    return `${money(record.costPerMinute)}/${unit}`;
  }
  if (record.nativeRate !== undefined && record.nativeUnit) return `${number(record.nativeRate)} ${record.nativeUnit}`;
  return record.billingMetric === "audio_tokens" ? "Token-billed" : "See source";
}

function sttTable(limit?: number): string {
  const records = limit ? pricingCatalog.stt.slice(0, limit) : pricingCatalog.stt;
  return `<div class="table-scroll"><table><caption>Speech-to-text public pricing</caption><thead><tr><th scope="col">Provider</th><th scope="col">Model</th><th scope="col">Mode</th><th scope="col">Status</th><th scope="col">Price</th><th scope="col">Source</th></tr></thead><tbody>${records.map((record) => `<tr><td>${escapeHtml(record.provider)}</td><td>${escapeHtml(record.name)}</td><td>${escapeHtml(record.mode)}</td><td>${escapeHtml(record.status)}</td><td>${escapeHtml(sttPrice(record))}</td><td>${sourceLink(record.sourceUrl, record.name)}</td></tr>`).join("")}</tbody></table></div>`;
}

function ttsPrice(record: (typeof pricingCatalog.tts)[number]): string {
  if (
    record.billingMetric === "tokens_and_audio" &&
    record.inputTextCostPerMillionTokens !== undefined &&
    record.outputAudioCostPerMillionTokens !== undefined
  ) {
    return `${money(record.inputTextCostPerMillionTokens)}/1M text tokens + ${money(record.outputAudioCostPerMillionTokens)}/1M audio tokens`;
  }
  if (record.costPerMillionCharacters !== null) {
    const base = `${money(record.costPerMillionCharacters)}/1M chars`;
    if (record.priceQualifier === "starting_at") return `Starting at ${base}`;
    if (record.monthlyCommitment === undefined) return base;
    if (record.includedCharacters !== undefined) {
      return `${base} effective when the ${money(record.monthlyCommitment)}/mo plan's ${number(record.includedCharacters)} included characters are fully used`;
    }
    return `${base} marginal overage after the ${money(record.monthlyCommitment)}/mo plan`;
  }
  if (record.nativeRate !== undefined && record.nativeUnit) return `${number(record.nativeRate)} ${record.nativeUnit}`;
  return record.billingMetric === "runtime" ? "Runtime-billed" : "See source";
}

function ttsTable(limit?: number): string {
  const records = limit ? pricingCatalog.tts.slice(0, limit) : pricingCatalog.tts;
  return `<div class="table-scroll"><table><caption>Text-to-speech public pricing</caption><thead><tr><th scope="col">Provider</th><th scope="col">Model</th><th scope="col">Billing</th><th scope="col">Status</th><th scope="col">Price</th><th scope="col">Source</th></tr></thead><tbody>${records.map((record) => `<tr><td>${escapeHtml(record.provider)}</td><td>${escapeHtml(record.name)}</td><td>${escapeHtml(record.billingMetric)}</td><td>${escapeHtml(record.status)}</td><td>${escapeHtml(ttsPrice(record))}</td><td>${sourceLink(record.sourceUrl, record.name)}</td></tr>`).join("")}</tbody></table></div>`;
}

function providerSummary(): Array<{ provider: string; llm: number; stt: number; tts: number; models: string[] }> {
  const providers = new Map<string, { provider: string; llm: number; stt: number; tts: number; models: string[] }>();
  const add = (provider: string, category: "llm" | "stt" | "tts", model: string) => {
    const current = providers.get(provider) ?? { provider, llm: 0, stt: 0, tts: 0, models: [] };
    current[category] += 1;
    current.models.push(model);
    providers.set(provider, current);
  };
  for (const record of pricingCatalog.llm) add(record.provider, "llm", record.name);
  for (const record of pricingCatalog.stt) add(record.provider, "stt", record.name);
  for (const record of pricingCatalog.tts) add(record.provider, "tts", record.name);
  return [...providers.values()].sort((a, b) => a.provider.localeCompare(b.provider));
}

function homePage(): PageDefinition {
  const copy = siteContent.home;
  const schemas = [{
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Voice AI Cost Calculator",
    url: `${baseUrl}/`,
    description: copy.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any web browser",
    isAccessibleForFree: true,
    dateModified: copy.lastModified,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  }, {
    "@context": "https://schema.org",
    ...publisherOrganization,
  }, faqPageSchema()];
  const content = `<section><h2>Compare the full voice-agent stack</h2><p>The calculator combines speech-to-text, language-model, text-to-speech, and infrastructure assumptions. Rates are normalized where defensible; records with host-dependent, token-billed, native-currency, or runtime pricing remain visible but are excluded from incompatible calculator totals.</p><ul><li><a href="/stt/">${pricingCatalog.stt.length} speech-to-text catalog entries</a></li><li><a href="/llm/">${pricingCatalog.llm.length} language-model catalog entries</a></li><li><a href="/tts/">${pricingCatalog.tts.length} text-to-speech catalog entries</a></li></ul></section><section><h2>Current LLM sample</h2>${llmTable(5)}</section><section><h2>Current STT sample</h2>${sttTable(5)}</section><section><h2>Current TTS sample</h2>${ttsTable(5)}</section><section><h2>How to use the estimate</h2><p>Select one compatible model for each layer, enter conversation behavior and infrastructure assumptions, then review total and per-minute estimates. Fixed system/tool input and non-spoken output tokens default to zero because they are workload-specific. Public list pricing can exclude taxes, regional differences, commitments, free tiers, add-ons, cache writes, and negotiated contracts.</p></section>${faqSection()}`;
  return {
    route: copy.path,
    title: copy.title,
    description: copy.description,
    body: layout(copy.h1, copy.lead, content),
    schemas,
    lastModified: copy.lastModified,
  };
}

function comparisonPage(category: PricingCategory): PageDefinition {
  const copy = comparisonContent[category];
  const labels = {
    stt: { table: sttTable(), explanation: "Streaming, pre-recorded, and dynamic-batch rates are not interchangeable. Minimum duration, channel count, add-ons, and session-idle billing can change effective cost." },
    tts: { table: ttsTable(), explanation: "Character, credit, token/audio, commitment, and runtime billing are not interchangeable. The table retains records that need plan or usage context instead of inventing a character rate." },
    llm: { table: llmTable(), explanation: "Displayed values are standard public rates per one million tokens. Cached input, cache writes, batch modes, long-context thresholds, thinking tokens, regions, and third-party hosting can change effective cost." },
  }[category];
  const records = pricingCatalog[category];
  const currentRecords = records.filter((record) => record.status === "active" || record.status === "preview");
  const route = copy.path;
  const schemas = [{
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: copy.h1,
    url: absoluteUrl(route),
    description: copy.description,
    dateModified: copy.lastModified,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: currentRecords.length,
      itemListElement: currentRecords.map((record, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${record.provider} ${record.name}`,
        url: record.sourceUrl,
      })),
    },
  }, breadcrumbSchema([{ name: "Home", route: "/" }, { name: copy.breadcrumbLabel, route }])];
  const content = `<section><h2>Comparison methodology</h2><p>${escapeHtml(labels.explanation)}</p><p>Every row links to the official source used for verification. Confirm purchase-critical rates directly with the provider.</p></section><section><h2>Current catalog</h2>${labels.table}</section>${guideLinks(`${copy.short} buyer guides`, comparisonGuideLinks[category])}`;
  return {
    route,
    title: copy.title,
    description: copy.description,
    body: layout(copy.h1, copy.lead, content, { breadcrumb: breadcrumb([{ name: "Home", route: "/" }, { name: copy.breadcrumbLabel }]) }),
    schemas,
    lastModified: copy.lastModified,
  };
}

function providersPage(): PageDefinition {
  const copy = siteContent.providers;
  const providers = providerSummary();
  const cards = providers.map((item) => `<article class="provider-card"><h2>${escapeHtml(item.provider)}</h2><p><strong>${item.llm}</strong> LLM · <strong>${item.stt}</strong> STT · <strong>${item.tts}</strong> TTS entries</p><p>${escapeHtml(item.models.slice(0, 6).join(", "))}${item.models.length > 6 ? ` and ${item.models.length - 6} more` : ""}</p></article>`).join("");
  const route = copy.path;
  const schemas = [{
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: copy.h1,
    url: absoluteUrl(route),
    description: copy.description,
    dateModified: copy.lastModified,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: providers.length,
      itemListElement: providers.map((provider, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: provider.provider,
      })),
    },
  }, pricingDatasetSchema, breadcrumbSchema([{ name: "Home", route: "/" }, { name: copy.breadcrumbLabel, route }])];
  return {
    route,
    title: copy.title,
    description: copy.description,
    body: layout(copy.h1, copy.lead, `<section><h2>Provider coverage</h2><p>Counts describe catalog records, not a claim that every provider offers every modality. Open-weight models without one universal host are labeled host-dependent.</p><p><a href="${safeUrl(PRICING_CATALOG_PATH)}">Download the source-linked pricing catalog (JSON)</a>.</p><div class="provider-grid">${cards}</div></section>`, { breadcrumb: breadcrumb([{ name: "Home", route: "/" }, { name: copy.breadcrumbLabel }]) }),
    schemas,
    lastModified: copy.lastModified,
  };
}

function blogIndexPage(posts: BlogPost[]): PageDefinition {
  const copy = siteContent.blog;
  const route = copy.path;
  const lastModified = posts.reduce<string>((latest, post) => post.updated > latest ? post.updated : latest, copy.lastModified);
  const articleCards = posts.map((post) => `<article class="article-card"><h2><a href="/blog/${escapeHtml(post.slug)}/">${escapeHtml(post.title)}</a></h2><p>Published <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time> · Updated <time datetime="${escapeHtml(post.updated)}">${escapeHtml(formatDate(post.updated))}</time> · ${escapeHtml(post.author.name)}</p><p>${escapeHtml(post.description)}</p></article>`).join("");
  const schemas = [{
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "CompareVoiceAI Voice AI Engineering Blog",
    url: absoluteUrl(route),
    description: copy.description,
    publisher: publisherOrganization,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: post.date,
      dateModified: post.updated,
      author: { "@type": "Person", name: post.author.name },
      publisher: publisherOrganization,
      image: post.coverImage ? absoluteUrl(post.coverImage) : defaultImage,
    })),
  }, breadcrumbSchema([{ name: "Home", route: "/" }, { name: copy.breadcrumbLabel, route }])];
  return {
    route,
    title: copy.title,
    description: copy.description,
    body: layout(copy.h1, copy.lead, `<section><h2>All articles</h2><div class="article-grid">${articleCards}</div></section>`, { breadcrumb: breadcrumb([{ name: "Home", route: "/" }, { name: copy.breadcrumbLabel }]) }),
    schemas,
    lastModified,
  };
}

function blogPostPage(post: BlogPost, posts: BlogPost[]): PageDefinition {
  const route = `/blog/${post.slug}`;
  const canonical = absoluteUrl(route);
  const image = post.coverImage ? absoluteUrl(post.coverImage) : defaultImage;
  const relatedPosts = posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({ candidate, score: candidate.tags.filter((tag) => post.tags.includes(tag)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.updated.localeCompare(a.candidate.updated))
    .slice(0, 3)
    .map(({ candidate }) => ({ title: candidate.title, description: candidate.description, href: `/blog/${candidate.slug}/` }));
  const schemas = [{
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: canonical,
    mainEntityOfPage: canonical,
    datePublished: post.date,
    dateModified: post.updated,
    author: { "@type": "Person", name: post.author.name, url: "https://rnikhil.com" },
    publisher: publisherOrganization,
    keywords: post.tags.join(", "),
    image,
  }, breadcrumbSchema([{ name: "Home", route: "/" }, { name: "Blog", route: "/blog" }, { name: post.title, route }])];
  const article = `<article class="static-article"><p class="byline">Published <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time> · Updated <time datetime="${escapeHtml(post.updated)}">${escapeHtml(formatDate(post.updated))}</time> · ${escapeHtml(post.author.name)}</p><div class="article-content">${markdownToHtml(post.content)}</div></article>${guideLinks("Current pricing comparisons", pricingLinksForTags(post.tags))}${guideLinks("Related voice AI guides", relatedPosts)}`;
  return {
    route,
    title: post.title,
    description: post.description,
    type: "article",
    image,
    body: layout(post.title, post.description, article, {
      breadcrumb: breadcrumb([{ name: "Home", route: "/" }, { name: "Blog", route: "/blog/" }, { name: post.title }]),
      notice: "Provider catalogs and prices change frequently. Use the current comparison pages for rates verified July 22, 2026, and confirm the linked provider source.",
    }),
    schemas,
    lastModified: post.updated,
    publishedTime: post.date,
    modifiedTime: post.updated,
  };
}

function privacyPage(): PageDefinition {
  const copy = siteContent.privacy;
  const route = copy.path;
  const content = `<section><h2>Browser-side calculations</h2><p>Calculator inputs and estimates are processed in your browser. Shared-result URLs can contain encoded calculator parameters when you choose to create one.</p></section><section><h2>No site analytics</h2><p>The shipped site has no accounts, database, analytics scripts, advertising trackers, or server API. Your chosen hosting or CDN provider may independently process standard request information such as IP address, user agent, path, and timestamp under its own policy.</p></section><section><h2>Contact</h2><p>Questions about this policy can be sent to <a href="mailto:contact@rnikhil.com">contact@rnikhil.com</a>.</p></section>`;
  return { route, title: copy.title, description: copy.description, body: layout(copy.h1, copy.lead, content, { breadcrumb: breadcrumb([{ name: "Home", route: "/" }, { name: copy.breadcrumbLabel }]) }), schemas: [breadcrumbSchema([{ name: "Home", route: "/" }, { name: copy.breadcrumbLabel, route }])], lastModified: copy.lastModified };
}

function termsPage(): PageDefinition {
  const copy = siteContent.terms;
  const route = copy.path;
  const content = `<section><h2>Educational estimates</h2><p>CompareVoiceAI is a free planning and comparison tool. Results are estimates, not quotes or guarantees. Provider prices, models, billing units, regions, discounts, and availability can change without notice.</p></section><section><h2>Verify before purchasing</h2><p>Confirm purchase-critical costs and terms with the linked provider. You are responsible for decisions made using the estimates.</p></section><section><h2>Acceptable use</h2><p>Use the service lawfully and do not attempt to disrupt, damage, or overload it.</p></section>`;
  return { route, title: copy.title, description: copy.description, body: layout(copy.h1, copy.lead, content, { breadcrumb: breadcrumb([{ name: "Home", route: "/" }, { name: copy.breadcrumbLabel }]) }), schemas: [breadcrumbSchema([{ name: "Home", route: "/" }, { name: copy.breadcrumbLabel, route }])], lastModified: copy.lastModified };
}

const staticStyles = `<style id="static-prerender-styles">
  :root{font-family:Inter,system-ui,sans-serif;color:#111;background:#f7f7f7}body{margin:0}.skip-link{position:absolute;left:-9999px}.skip-link:focus{left:1rem;top:1rem;background:#fff;padding:.75rem;z-index:20}.static-nav{display:flex;gap:.75rem;flex-wrap:wrap;padding:1rem max(1rem,calc((100vw - 1120px)/2));background:#fff;border-bottom:3px solid #111}.static-nav a,.static-footer a,.static-page a{color:#3f0ca3}.static-page{max-width:1120px;margin:0 auto;padding:1.5rem 1rem 3rem}.static-hero{background:#fff;border:4px solid #111;padding:clamp(1.25rem,4vw,2.5rem);box-shadow:8px 8px 0 #111;margin:1rem 0 2rem}.static-hero h1{font-size:clamp(2rem,6vw,4rem);line-height:1.05;margin:0 0 1rem}.static-page section,.static-article{background:#fff;border:3px solid #111;padding:1.25rem;margin:1.5rem 0}.static-notice{border:3px solid #111;background:#fff4bf;padding:1rem;margin:1.5rem 0}.breadcrumbs ol{display:flex;gap:.5rem;list-style:none;padding:0;flex-wrap:wrap}.breadcrumbs li+li:before{content:'›';margin-right:.5rem}.table-scroll{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:.9rem}caption{text-align:left;font-weight:700;padding:.5rem 0}th,td{border:1px solid #777;padding:.55rem;text-align:left;vertical-align:top}th{background:#eee}.provider-grid,.article-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem}.provider-card,.article-card{border:2px solid #111;padding:1rem}.article-card h2,.provider-card h2{font-size:1.15rem}.static-article{max-width:850px;margin:1.5rem auto}.article-content{line-height:1.65}.article-content h2,.article-content h3{line-height:1.2;margin-top:2rem}.article-content img{max-width:100%;height:auto}.article-content table{display:block;max-width:100%;overflow-x:auto}.article-content pre{max-width:100%;overflow:auto;background:#171717;color:#f7f7f7;padding:1rem}.article-content code{font-family:ui-monospace,monospace}.article-content blockquote{border-left:4px solid #5e17eb;margin-left:0;padding-left:1rem}.static-footer{border-top:4px solid #111;background:#fff;padding:1.5rem max(1rem,calc((100vw - 1120px)/2))}.byline{color:#555}@media(max-width:600px){th,td{padding:.4rem}.static-page{padding-top:.5rem}}
</style>`;

function injectHead(template: string, page: PageDefinition): string {
  const canonical = absoluteUrl(page.route);
  const image = page.image ?? defaultImage;
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/\s*<meta\s+(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, "")
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, "")
    .replace(/\s*<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/\s*<style\s+id=["']static-prerender-styles["'][^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\s*<!--[^>]*replit[^>]*-->\s*/gi, "")
    .replace(/\s*<script[^>]+replit-dev-banner\.js[^>]*><\/script>/gi, "");

  const head = `
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}">
    <meta name="robots" content="${escapeHtml(page.robots ?? "index, follow, max-image-preview:large")}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:title" content="${escapeHtml(page.title)}">
    <meta property="og:description" content="${escapeHtml(page.description)}">
    <meta property="og:type" content="${escapeHtml(page.type ?? "website")}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta property="og:image:alt" content="${escapeHtml(DEFAULT_OG_IMAGE_ALT)}">
    <meta property="og:image:width" content="${DEFAULT_OG_IMAGE_WIDTH}">
    <meta property="og:image:height" content="${DEFAULT_OG_IMAGE_HEIGHT}">
    ${page.publishedTime ? `<meta property="article:published_time" content="${escapeHtml(page.publishedTime)}">` : ""}
    ${page.modifiedTime ? `<meta property="article:modified_time" content="${escapeHtml(page.modifiedTime)}">` : ""}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(page.title)}">
    <meta name="twitter:description" content="${escapeHtml(page.description)}">
    <meta name="twitter:image" content="${escapeHtml(image)}">
    ${(page.schemas ?? []).map((schema, index) => {
      const schemaType = String((schema as { "@type"?: string })["@type"] ?? "");
      const id = schemaType === "BreadcrumbList" ? "breadcrumbs"
        : schemaType === "WebApplication" ? "voice-calculator-app"
        : schemaType === "Organization" ? "organization"
        : schemaType === "FAQPage" ? "faq"
        : schemaType === "Dataset" ? "pricing-dataset"
        : schemaType === "BlogPosting" ? "article"
        : schemaType === "Blog" ? "blog"
        : page.route.replace(/\/$/, "") === "/providers" ? "provider-directory"
        : /^\/(stt|tts|llm)\/?$/.test(page.route) ? `${page.route.replaceAll("/", "")}-catalog`
        : `static-schema-${index}`;
      return `<script type="application/ld+json" data-json-ld="${escapeHtml(id)}">${escapeJsonForHtml(schema)}</script>`;
    }).join("\n    ")}
    ${staticStyles}
  `;
  html = html.replace(/<\/head>/i, `${head}</head>`);
  return html;
}

function injectBody(template: string, body: string): string {
  const replacement = `<div id="root">${body}</div>`;
  if (!/<div\s+id=["']root["'][^>]*>[\s\S]*?<\/div>/i.test(template)) {
    throw new Error("Built template does not contain a replaceable #root element");
  }
  return template.replace(/<div\s+id=["']root["'][^>]*>[\s\S]*?<\/div>/i, replacement);
}

function renderDocument(template: string, page: PageDefinition): string {
  return injectBody(injectHead(template, page), page.body);
}

function pageOutputPath(route: string): string {
  if (route === "/") return templatePath;
  return path.join(distRoot, route.replace(/^\//, ""), "index.html");
}

async function writePage(template: string, page: PageDefinition): Promise<void> {
  const outputPath = pageOutputPath(page.route);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderDocument(template, page), "utf8");
}

function sitemap(pages: PageDefinition[]): string {
  const indexable = pages.filter((page) => !page.robots?.includes("noindex"));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((page) => `  <url>\n    <loc>${escapeHtml(absoluteUrl(page.route))}</loc>${page.lastModified ? `\n    <lastmod>${escapeHtml(page.lastModified)}</lastmod>` : ""}\n  </url>`).join("\n")}\n</urlset>\n`;
}

function llmsText(posts: BlogPost[]): string {
  return `# CompareVoiceAI

> A free voice AI pricing calculator and source-linked comparison catalog for speech-to-text, language models, and text-to-speech.

Pricing is time-sensitive. The current catalog was verified ${verifiedAt}; confirm purchase-critical rates with each linked provider source. Google Search does not use this file as a ranking signal.

## Pricing tools and comparisons

- [Voice AI pricing calculator](${baseUrl}/): Interactive estimator and current catalog overview
- [Speech-to-text pricing](${baseUrl}/stt/): STT models, modes, units, prices, and official sources
- [Language-model pricing](${baseUrl}/llm/): Input and output token pricing with official sources
- [Text-to-speech pricing](${baseUrl}/tts/): TTS billing models and public prices
- [Provider comparison](${baseUrl}/providers/): Provider coverage across the voice stack
- [Machine-readable pricing catalog](${baseUrl}/data/pricing-catalog.json): Full source-linked catalog verified ${verifiedAt}

## Editorial content

- [Voice AI engineering blog](${baseUrl}/blog/): All technical guides
${posts.map((post) => `- [${post.title}](${baseUrl}/blog/${post.slug}/): Published ${post.date}; updated ${post.updated}`).join("\n")}

## Policies

- [Privacy](${baseUrl}/privacy/)
- [Terms](${baseUrl}/terms/)
`;
}

async function normalizeStaticOutput(directory: string): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await chmod(entryPath, 0o755);
      await normalizeStaticOutput(entryPath);
      continue;
    }
    if (!entry.isFile()) continue;
    if ((await stat(entryPath)).size === 0) {
      await rm(entryPath);
      continue;
    }
    await chmod(entryPath, 0o644);
  }
}

async function main(): Promise<void> {
  let template: string;
  try {
    template = await readFile(templatePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(`Skipping prerender: ${templatePath} does not exist. Build the client into dist/ first.`);
      return;
    }
    throw error;
  }

  const posts = JSON.parse(await readFile(postsPath, "utf8")) as BlogPost[];
  if (!Array.isArray(posts) || posts.some((post) => !post.slug || !post.title || !post.content)) {
    throw new Error(`Invalid generated blog data at ${postsPath}`);
  }

  const pages: PageDefinition[] = [
    homePage(),
    comparisonPage("stt"),
    comparisonPage("tts"),
    comparisonPage("llm"),
    providersPage(),
    blogIndexPage(posts),
    ...posts.map((post) => blogPostPage(post, posts)),
    privacyPage(),
    termsPage(),
  ];

  for (const page of pages) await writePage(template, page);

  const notFound: PageDefinition = {
    route: "/404.html",
    title: "Page Not Found | CompareVoiceAI",
    description: "The requested CompareVoiceAI page could not be found.",
    robots: "noindex, follow",
    body: layout("Page not found", "The requested page does not exist or may have moved.", `<section><h2>Continue exploring</h2><p><a href="/">Open the voice AI pricing calculator</a>, browse the <a href="/providers/">provider catalog</a>, or read the <a href="/blog/">voice AI engineering blog</a>.</p></section>`),
  };
  await writeFile(path.join(distRoot, "404.html"), renderDocument(template, notFound), "utf8");

  await writeFile(path.join(distRoot, "sitemap.xml"), sitemap(pages), "utf8");
  await writeFile(path.join(distRoot, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`, "utf8");
  await writeFile(path.join(distRoot, "llms.txt"), llmsText(posts), "utf8");

  await normalizeStaticOutput(distRoot);

  console.log(`Prerendered ${pages.length} indexable routes plus 404.html into ${distRoot}.`);
}

await main();
