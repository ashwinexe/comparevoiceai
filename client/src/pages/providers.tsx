import { Link } from "wouter";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import JsonLd from "@/components/seo/JsonLd";
import SEOHead from "@/components/seo/SEOHead";
import Footer from "@/components/Footer";
import { llmCatalog, sttCatalog, ttsCatalog } from "@shared/pricing-catalog";
import { PRICING_VERIFIED_DATE, type PricingRecordBase } from "@shared/providers";
import { PRICING_CATALOG_PATH } from "@shared/site-core";
import { pricingDatasetSchema, siteContent } from "@shared/site-content";

type Category = "LLM" | "STT" | "TTS";

interface ProviderSummary {
  provider: string;
  categories: Map<Category, PricingRecordBase[]>;
}

const summaries = new Map<string, ProviderSummary>();
for (const [category, records] of [
  ["LLM", llmCatalog],
  ["STT", sttCatalog],
  ["TTS", ttsCatalog],
] as const) {
  for (const record of records) {
    const summary = summaries.get(record.provider) ?? { provider: record.provider, categories: new Map() };
    summary.categories.set(category, [...(summary.categories.get(category) ?? []), record]);
    summaries.set(record.provider, summary);
  }
}

const providerRows = Array.from(summaries.values()).sort((a, b) => a.provider.localeCompare(b.provider));

function categorySummary(records: PricingRecordBase[] | undefined) {
  if (!records?.length) return "—";
  const current = records.filter((record) => record.status === "active" || record.status === "preview");
  const display = (current.length ? current : records).slice(0, 3).map((record) => record.name).join(", ");
  return records.length > 3 ? `${display} +${records.length - 3}` : display;
}

export default function ProvidersPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: siteContent.providers.h1,
    description: siteContent.providers.description,
    url: `https://comparevoiceai.com${siteContent.providers.path}`,
    dateModified: siteContent.providers.lastModified,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: providerRows.length,
      itemListElement: providerRows.map((row, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: row.provider,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans">
      <SEOHead
        title={siteContent.providers.title}
        description={siteContent.providers.description}
        canonicalUrl={`https://comparevoiceai.com${siteContent.providers.path}`}
      />
      <JsonLd id="provider-directory" data={schema} />
      <JsonLd id="pricing-dataset" data={pricingDatasetSchema} />

      <main className="container mx-auto px-4 py-8">
        <BreadcrumbNav currentLabel={siteContent.providers.breadcrumbLabel} />
        <header className="border-4 border-black p-6 md:p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0)] mb-8">
          <p className="font-mono text-sm font-bold uppercase text-[#5E17EB] mb-2">Catalog verified {PRICING_VERIFIED_DATE}</p>
          <h1 className="font-mono text-3xl md:text-5xl font-bold uppercase tracking-tight mb-4">{siteContent.providers.h1}</h1>
          <p className="text-lg max-w-4xl">A provider can create a model without selling a universal hosted API price. This directory separates model providers from pricing hosts and only calls a rate comparable when its mode, tier, unit, currency, and lifecycle are explicit.</p>
          <a href={PRICING_CATALOG_PATH} className="inline-block mt-5 underline font-mono font-bold">Download the source-linked pricing catalog (JSON) →</a>
        </header>

        <section aria-labelledby="categories-heading" className="grid md:grid-cols-3 gap-6 mb-8">
          <h2 id="categories-heading" className="sr-only">Pricing categories</h2>
          {[
            ["/stt/", "Speech-to-text", `${sttCatalog.length} model and mode rows`],
            ["/tts/", "Text-to-speech", `${ttsCatalog.length} model and plan rows`],
            ["/llm/", "Language models", `${llmCatalog.length} model and host rows`],
          ].map(([href, title, subtitle]) => (
            <Link key={href} href={href} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition-all">
              <h2 className="font-mono text-xl font-bold uppercase mb-2">{title}</h2>
              <p className="text-sm">{subtitle}</p>
              <div className="font-mono text-sm font-bold mt-4">View comparison →</div>
            </Link>
          ))}
        </section>

        <section aria-labelledby="directory-heading" className="border-4 border-black bg-white p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0)]">
          <h2 id="directory-heading" className="font-mono text-2xl font-bold uppercase mb-4">Provider coverage</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left border-collapse">
              <thead><tr className="border-y-4 border-black font-mono text-xs uppercase"><th className="p-3">Provider / creator</th><th className="p-3">LLM</th><th className="p-3">STT</th><th className="p-3">TTS</th></tr></thead>
              <tbody>
                {providerRows.map((row) => (
                  <tr key={row.provider} className="border-b-2 border-black align-top">
                    <th scope="row" className="p-3 font-bold">{row.provider}</th>
                    <td className="p-3 text-sm">{categorySummary(row.categories.get("LLM"))}</td>
                    <td className="p-3 text-sm">{categorySummary(row.categories.get("STT"))}</td>
                    <td className="p-3 text-sm">{categorySummary(row.categories.get("TTS"))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-4 border-black bg-yellow-50 p-5 mt-8">
          <h2 className="font-mono font-bold uppercase mb-2">Why some familiar names are not in the calculator</h2>
          <p className="text-sm">Meta-hosted Llama requires a named inference host; OpenAI's current GPT transcription models are token-billed; Replicate Kokoro is runtime-priced; Sarvam publishes INR; and discontinued models such as PlayAI Dialog remain documented but cannot produce a truthful fixed-USD calculator total.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
