import { pricingCatalog } from "./pricing-catalog";
import {
  PRICING_CATALOG_PATH,
  SITE_URL,
  publisherOrganization,
  siteCoreContent,
  type SiteRouteContent,
} from "./site-core";

const verifiedAt = pricingCatalog.verifiedAt;
const totalCatalogEntries = pricingCatalog.llm.length + pricingCatalog.stt.length + pricingCatalog.tts.length;
const providerCount = new Set(
  [...pricingCatalog.llm, ...pricingCatalog.stt, ...pricingCatalog.tts].map((record) => record.provider),
).size;

export const siteContent = {
  home: {
    path: "/",
    title: "Voice AI Cost Calculator | STT, LLM & TTS Pricing",
    description: `Estimate voice-agent costs with ${totalCatalogEntries} source-linked STT, LLM, and TTS catalog entries verified ${verifiedAt}. Compare models, edit assumptions, and export results.`,
    h1: "VOICE AGENT PRICING CALCULATOR",
    lead: `Compare source-linked STT, LLM, and TTS pricing verified ${verifiedAt}.`,
    breadcrumbLabel: "Calculator",
    lastModified: verifiedAt,
  },
  stt: {
    path: "/stt/",
    title: "Speech-to-Text Pricing Comparison | Current STT Models",
    description: `Compare ${pricingCatalog.stt.length} speech-to-text models by provider, mode, billing unit, and current public price. Sources verified ${verifiedAt}.`,
    h1: "Speech-to-Text Pricing Comparison",
    lead: `Compare transcription pricing, modes, and billing terms verified ${verifiedAt}.`,
    breadcrumbLabel: "Speech-to-Text Pricing",
    lastModified: verifiedAt,
  },
  tts: {
    path: "/tts/",
    title: "Text-to-Speech Pricing Comparison | Current TTS Models",
    description: `Compare ${pricingCatalog.tts.length} text-to-speech models by provider, billing model, status, and current public price. Sources verified ${verifiedAt}.`,
    h1: "Text-to-Speech Pricing Comparison",
    lead: `Compare synthesis pricing and billing models verified ${verifiedAt}.`,
    breadcrumbLabel: "Text-to-Speech Pricing",
    lastModified: verifiedAt,
  },
  llm: {
    path: "/llm/",
    title: "LLM API Pricing Comparison | Current Language Models",
    description: `Compare ${pricingCatalog.llm.length} language models by input, output, cached-input, and long-context pricing. Sources verified ${verifiedAt}.`,
    h1: "LLM API Pricing Comparison",
    lead: `Compare input and output token pricing verified ${verifiedAt}.`,
    breadcrumbLabel: "LLM API Pricing",
    lastModified: verifiedAt,
  },
  providers: {
    path: "/providers/",
    title: "Voice AI Provider Directory | LLM, STT & TTS Models",
    description: `Browse ${providerCount} source-linked providers and pricing hosts across language models, speech-to-text, and text-to-speech. Catalog verified ${verifiedAt}.`,
    h1: "Voice AI Provider Directory",
    lead: `Explore ${providerCount} providers and pricing hosts represented in the current catalog.`,
    breadcrumbLabel: "Providers",
    lastModified: verifiedAt,
  },
  ...siteCoreContent,
} as const satisfies Record<string, SiteRouteContent>;

export const comparisonContent = {
  llm: { ...siteContent.llm, short: "LLM" },
  stt: { ...siteContent.stt, short: "STT" },
  tts: { ...siteContent.tts, short: "TTS" },
} as const;

export const pricingDatasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "CompareVoiceAI source-linked voice AI pricing catalog",
  description: `A dated catalog of ${totalCatalogEntries} public STT, LLM, and TTS pricing records with billing units, lifecycle status, verification dates, and provider source URLs.`,
  url: `${SITE_URL}${siteContent.providers.path}`,
  version: verifiedAt,
  dateModified: verifiedAt,
  isAccessibleForFree: true,
  creator: publisherOrganization,
  distribution: {
    "@type": "DataDownload",
    contentUrl: `${SITE_URL}${PRICING_CATALOG_PATH}`,
    encodingFormat: "application/json",
  },
} as const;
