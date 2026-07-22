import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import GuideLinks from "@/components/seo/GuideLinks";
import JsonLd from "@/components/seo/JsonLd";
import SEOHead from "@/components/seo/SEOHead";
import Footer from "@/components/Footer";
import { llmCatalog, llmProviders, sttCatalog, sttProviders, ttsCatalog, ttsProviders } from "@shared/pricing-catalog";
import { PRICING_VERIFIED_DATE, type LLMCatalogRecord, type PricingRecordBase, type STTCatalogRecord, type TTSCatalogRecord } from "@shared/providers";
import { comparisonGuideLinks, SITE_URL, type PricingCategory } from "@shared/site-core";
import { comparisonContent } from "@shared/site-content";

export type { PricingCategory } from "@shared/site-core";

const statusOrder: Record<PricingRecordBase["status"], number> = {
  active: 0,
  preview: 1,
  legacy: 2,
  variable: 3,
  deprecated: 4,
  discontinued: 5,
};

function formatRate(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(value);
}

function rateCell(category: PricingCategory, record: LLMCatalogRecord | STTCatalogRecord | TTSCatalogRecord) {
  if (category === "llm") {
    const item = record as LLMCatalogRecord;
    if (item.inputCostPerMillion === null || item.outputCostPerMillion === null) return "Not directly priced";
    return `$${formatRate(item.inputCostPerMillion)} input / $${formatRate(item.outputCostPerMillion)} output per 1M tokens`;
  }
  if (category === "stt") {
    const item = record as STTCatalogRecord;
    if (item.costPerMinute !== null) return `$${formatRate(item.costPerMinute)} per ${item.billingMetric === "session_minute" ? "session" : "audio"} minute`;
    if (item.nativeRate !== undefined) return `${item.currency} ${formatRate(item.nativeRate)} per ${item.nativeUnit?.split("/")[1] ?? "published unit"}`;
    return "Token/variable billing — no fixed minute rate";
  }
  const item = record as TTSCatalogRecord;
  if (
    item.billingMetric === "tokens_and_audio" &&
    item.inputTextCostPerMillionTokens !== undefined &&
    item.outputAudioCostPerMillionTokens !== undefined
  ) {
    return `$${formatRate(item.inputTextCostPerMillionTokens)} text / $${formatRate(item.outputAudioCostPerMillionTokens)} audio per 1M tokens${item.outputAudioCostPerMinute !== undefined ? ` (~$${formatRate(item.outputAudioCostPerMinute)} audio/min + text)` : ""}`;
  }
  if (item.costPerMillionCharacters !== null) {
    const base = `$${formatRate(item.costPerMillionCharacters)} per 1M characters`;
    if (item.priceQualifier === "starting_at") return `Starting at ${base}`;
    if (item.monthlyCommitment === undefined) return base;
    if (item.includedCharacters !== undefined) {
      return `${base} effective at full use · $${formatRate(item.monthlyCommitment)}/mo includes ${formatRate(item.includedCharacters)} characters`;
    }
    return `${base} marginal overage · $${formatRate(item.monthlyCommitment)}/mo plan required`;
  }
  if (item.nativeRate !== undefined) return `${item.currency} ${formatRate(item.nativeRate)} per ${item.nativeUnit?.split("/")[1] ?? "published unit"}`;
  return "Compound or variable billing — no fixed character rate";
}

function qualifierLabel(record: PricingRecordBase) {
  return record.priceQualifier.replace(/_/g, " ");
}

export default function PricingComparisonPage({ category }: { category: PricingCategory }) {
  const copy = comparisonContent[category];
  const sourceRecords = category === "llm" ? llmCatalog : category === "stt" ? sttCatalog : ttsCatalog;
  const records = [...sourceRecords].sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name));
  const currentRecords = records.filter((record) => record.status === "active" || record.status === "preview");
  const providerCount = new Set(records.map((record) => record.provider)).size;
  const calculatorCount = category === "llm" ? llmProviders.length : category === "stt" ? sttProviders.length : ttsProviders.length;
  const canonicalUrl = `${SITE_URL}${copy.path}`;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: copy.h1,
    description: copy.description,
    url: canonicalUrl,
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
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans bg-[radial-gradient(#5E17EB_1px,transparent_1px),radial-gradient(#5E17EB_1px,transparent_1px)] bg-[length:40px_40px] bg-fixed">
      <SEOHead title={copy.title} description={copy.description} canonicalUrl={canonicalUrl} />
      <JsonLd id={`${category}-catalog`} data={itemListSchema} />

      <main className="container mx-auto px-4 py-8">
        <BreadcrumbNav currentLabel={copy.breadcrumbLabel} />
        <header className="border-4 border-black p-6 md:p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0)] mb-8">
          <p className="font-mono text-sm font-bold uppercase text-[#5E17EB] mb-2">Verified {PRICING_VERIFIED_DATE}</p>
          <h1 className="font-mono text-3xl md:text-5xl font-bold uppercase tracking-tight mb-4">{copy.h1}</h1>
          <p className="text-lg max-w-4xl leading-relaxed">{copy.description}</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/" className="px-5 py-3 bg-[#5E17EB] text-white font-mono font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0)]">Use the calculator</Link>
            <Link href="/providers/" className="px-5 py-3 bg-white font-mono font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0)]">All providers</Link>
          </div>
        </header>

        <section aria-labelledby="summary-heading" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <h2 id="summary-heading" className="sr-only">Catalog summary</h2>
          {[
            [records.length, "catalog entries"],
            [providerCount, "providers / hosts"],
            [currentRecords.length, "active or preview"],
            [calculatorCount, category === "stt" ? "included in voice calculator" : "included in calculator"],
          ].map(([value, label]) => (
            <div key={label} className="border-4 border-black bg-white p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
              <div className="font-mono text-3xl font-bold">{value}</div>
              <div className="font-mono text-xs uppercase">{label}</div>
            </div>
          ))}
        </section>

        <section aria-labelledby="rates-heading" className="border-4 border-black bg-white p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0)] mb-8">
          <div className="mb-5">
            <h2 id="rates-heading" className="font-mono text-2xl font-bold uppercase">Current catalog and lifecycle</h2>
            <p className="mt-2 text-sm text-gray-700">Rows use the ordinary public tier shown. Free allowances, taxes, negotiated contracts, add-ons, batch discounts, cache writes, currency conversion, and regional differences are excluded unless a row says otherwise.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="border-y-4 border-black font-mono text-xs uppercase">
                  <th className="p-3">Provider / host</th>
                  <th className="p-3">Model / mode</th>
                  <th className="p-3">Published basis</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Scope and caveats</th>
                  <th className="p-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b-2 border-black align-top">
                    <td className="p-3">
                      <div className="font-bold">{record.provider}</div>
                      <div className="text-xs text-gray-600">{record.pricingHost}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold">{record.name}</div>
                      {record.modelId && <code className="text-xs break-all">{record.modelId}</code>}
                      {category === "stt" && <div className="text-xs mt-1 uppercase">{(record as STTCatalogRecord).mode}</div>}
                    </td>
                    <td className="p-3">
                      <div className="font-mono font-bold text-sm">{rateCell(category, record)}</div>
                      <div className="text-xs mt-1 capitalize">{qualifierLabel(record)} · {record.tier}</div>
                    </td>
                    <td className="p-3"><span className="inline-block border-2 border-black px-2 py-1 text-xs font-mono uppercase bg-gray-50">{record.status}</span></td>
                    <td className="p-3 text-sm max-w-md">
                      <p>{record.description}</p>
                      {record.notes.length > 0 && <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-700">{record.notes.map((note) => <li key={note}>{note}</li>)}</ul>}
                    </td>
                    <td className="p-3">
                      <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline font-bold text-sm">Verify {record.name} pricing <ExternalLink className="w-3 h-3" /></a>
                      <div className="text-xs text-gray-600 mt-1">Checked {record.lastVerified}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="method-heading" className="grid md:grid-cols-3 gap-5 mb-8">
          <h2 id="method-heading" className="sr-only">How to interpret this comparison</h2>
          <div className="border-4 border-black bg-white p-5"><h3 className="font-mono font-bold uppercase mb-2">What is comparable?</h3><p className="text-sm">Only rows with the same billing unit, mode, tier, and currency should be ranked directly. The calculator excludes rows without a defensible fixed USD unit rate.</p></div>
          <div className="border-4 border-black bg-white p-5"><h3 className="font-mono font-bold uppercase mb-2">Why can invoices differ?</h3><p className="text-sm">Minimum request duration, channels, context thresholds, prompt caching, subscription utilization, region, add-ons, taxes, and negotiated discounts can change the total.</p></div>
          <div className="border-4 border-black bg-white p-5"><h3 className="font-mono font-bold uppercase mb-2">How fresh is this?</h3><p className="text-sm">Every row was checked against the linked provider source on July 22, 2026. Prices are a dated snapshot, not a promise of future pricing.</p></div>
        </section>

        <GuideLinks links={comparisonGuideLinks[category]} title={`${copy.short} buyer guides`} />
      </main>
      <Footer />
    </div>
  );
}
