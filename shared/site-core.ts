export const SITE_NAME = "CompareVoiceAI";
export const SITE_URL = "https://comparevoiceai.com";
export const PRICING_CATALOG_PATH = "/data/pricing-catalog.json";
export const DEFAULT_OG_IMAGE_PATH = "/og/comparevoiceai-pricing.png";
export const DEFAULT_OG_IMAGE_URL = `${SITE_URL}${DEFAULT_OG_IMAGE_PATH}`;
export const DEFAULT_OG_IMAGE_ALT = "CompareVoiceAI voice AI pricing calculator for STT, LLM, and TTS";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

export interface SiteRouteContent {
  path: string;
  title: string;
  description: string;
  h1: string;
  lead: string;
  breadcrumbLabel: string;
  lastModified: string;
}

export const siteCoreContent = {
  blog: {
    path: "/blog/",
    title: "Voice AI Blog: Pricing, Latency & Provider Guides",
    description: "Practical voice AI engineering guides covering pricing, latency, speech recognition, language models, text-to-speech, and production architecture.",
    h1: "Voice AI Engineering Blog",
    lead: "Guides to voice AI pricing, latency, model selection, integrations, and production architecture.",
    breadcrumbLabel: "Blog",
    lastModified: "2026-07-22",
  },
  privacy: {
    path: "/privacy/",
    title: "Privacy Policy | Voice AI Pricing Calculator",
    description: "How this static calculator processes inputs in your browser, encodes optional shared URLs, and relies on ordinary hosting request logs.",
    h1: "Privacy Policy",
    lead: "How CompareVoiceAI handles calculator inputs, shared URLs, and ordinary hosting requests.",
    breadcrumbLabel: "Privacy Policy",
    lastModified: "2026-07-22",
  },
  terms: {
    path: "/terms/",
    title: "Terms of Service | Voice AI Pricing Calculator",
    description: "Terms of service for Voice AI Pricing Calculator. Learn about usage terms and conditions for our free calculator tool.",
    h1: "Terms of Service",
    lead: "Terms for using the CompareVoiceAI pricing calculator and comparison content.",
    breadcrumbLabel: "Terms of Service",
    lastModified: "2026-07-22",
  },
} as const satisfies Record<string, SiteRouteContent>;

export type PricingCategory = "llm" | "stt" | "tts";

export const routeLabelsBySegment: Record<string, string> = {
  blog: siteCoreContent.blog.breadcrumbLabel,
  llm: "LLM API Pricing",
  privacy: siteCoreContent.privacy.breadcrumbLabel,
  providers: "Providers",
  stt: "Speech-to-Text Pricing",
  terms: siteCoreContent.terms.breadcrumbLabel,
  tts: "Text-to-Speech Pricing",
};

export interface FAQItem {
  question: string;
  answer: string;
}

export const voiceAIFAQs: readonly FAQItem[] = [
  {
    question: "How accurate are the voice AI cost calculations?",
    answer: "The calculator uses a static, source-linked catalog verified on July 22, 2026. It produces an estimate from your assumptions; it is not a quote and does not claim a fixed accuracy percentage. Taxes, negotiated rates, free tiers, add-ons, caching, regional differences, and request minimums may change the invoice.",
  },
  {
    question: "Which voice AI providers are supported in the calculator?",
    answer: "The catalog covers the providers shown on the LLM, STT, and TTS comparison pages. Entries that cannot be normalized honestly—such as token-billed transcription, runtime-priced community models, or native-currency rates—remain visible in the catalog but are excluded from deterministic calculator totals.",
  },
  {
    question: "Can I compare different AI models for the same task?",
    answer: "Yes. Keep conversation assumptions fixed, switch one component at a time, and compare the breakdown. Only rank rows with compatible modes, units, regions, and tiers; a batch STT price is not a realtime substitute.",
  },
  {
    question: "What factors affect voice AI conversation costs?",
    answer: "Key inputs include conversation length, speech share, words and turns per minute, accumulated LLM context, model prices, and optional hosting cost. Taxes, free tiers, cache hits, regional pricing, minimum billing increments, and add-ons must be checked separately.",
  },
  {
    question: "Is the calculator free to use?",
    answer: "Yes. The voice AI cost calculator is free to use without registration. You can run calculations, export results, and create share links without a site account.",
  },
  {
    question: "How often are the pricing rates updated?",
    answer: "Every catalog row shows its verification date and official source. The current release was checked on July 22, 2026. Always open the source link before making a purchase because providers can change pricing between site releases.",
  },
  {
    question: "Can I export my cost calculations?",
    answer: "Yes. CSV exports include provider IDs, official source URLs, catalog date, assumptions, and unrounded results. Share links preserve the calculation state in a read-only view.",
  },
  {
    question: "What about latency considerations in voice AI systems?",
    answer: "The latency panel is an editable budget, not a live provider benchmark. Enter measurements from your own client, regions, network path, STT, LLM, TTS, and audio buffers to estimate end-to-end response time.",
  },
  {
    question: "What are the best cost optimization strategies for voice AI agents?",
    answer: "Start with context management, measure actual input and output tokens, test smaller current models, use caching only when your prompt pattern earns cache hits, and compare the correct STT mode and TTS plan. The calculator deliberately keeps input and output token prices separate.",
  },
  {
    question: "How can I optimize latency in my voice AI system?",
    answer: "Measure endpointing, network transit, LLM time to first token, sentence aggregation, TTS time to first audio, and client audio buffers separately. Co-locate services where possible, stream partial results, and validate with production traces rather than generic benchmark numbers.",
  },
  {
    question: "How do I balance cost and latency in voice AI applications?",
    answer: "The trade-off is workload-specific. Use the latency panel to enter measurements from your own regions and providers, then compare the resulting estimate with actual invoices. Avoid universal cost or latency targets that are not tied to a measured workload.",
  },
] as const;

export interface SiteLink {
  title: string;
  description: string;
  href: string;
}

export const comparisonGuideLinks: Record<PricingCategory, readonly SiteLink[]> = {
  stt: [
    { title: "How to choose a speech-to-text provider", description: "Evaluate mode, accuracy, endpointing, latency, billing units, and request minimums.", href: "/blog/how-to-choose-stt-voice-ai-model/" },
    { title: "Turn detection and interruption handling", description: "Design endpointing and barge-in behavior for conversational audio.", href: "/blog/handle-interruption-detection-voice-ai-agent/" },
    { title: "How to optimize voice AI latency", description: "Measure the complete end-of-speech to audible-response path.", href: "/blog/latency-optimisation-voice-agent/" },
  ],
  llm: [
    { title: "How to choose an LLM for voice AI", description: "Compare token pricing, context policy, tool use, quality, and time to first token.", href: "/blog/which-llm-choose-voice-ai-agents/" },
    { title: "How to optimize voice AI costs", description: "Reduce repeated context and compare models against the same workload.", href: "/blog/cost-optimisation-voice-agent/" },
    { title: "Voice AI API integration tutorial", description: "Review pipeline and realtime integration patterns before implementation.", href: "/blog/voice-ai-api-integration-tutorial-examples/" },
  ],
  tts: [
    { title: "How to choose a text-to-speech provider", description: "Evaluate voices, languages, streaming, time to first audio, and billing terms.", href: "/blog/how-to-choose-tts-voice-ai-model/" },
    { title: "How to optimize voice AI latency", description: "Measure synthesis and playback as part of the full conversational path.", href: "/blog/latency-optimisation-voice-agent/" },
    { title: "How to optimize voice AI costs", description: "Compare character, token, plan, and runtime billing without mixing units.", href: "/blog/cost-optimisation-voice-agent/" },
  ],
};

export const pricingCategoryLinks: Record<PricingCategory, SiteLink> = {
  stt: { title: "Compare current speech-to-text pricing", description: "Review source-linked STT modes, billing units, and public prices.", href: "/stt/" },
  llm: { title: "Compare current LLM API pricing", description: "Review source-linked input, output, cache, and long-context rates.", href: "/llm/" },
  tts: { title: "Compare current text-to-speech pricing", description: "Review source-linked TTS billing models and public prices.", href: "/tts/" },
};

export function pricingLinksForTags(tags: readonly string[]): SiteLink[] {
  const normalized = new Set(tags.map((tag) => tag.toLowerCase()));
  return (["stt", "llm", "tts"] as const)
    .filter((category) => normalized.has(category))
    .map((category) => pricingCategoryLinks[category]);
}

export const publisherOrganization = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/favicon.svg`,
  },
  founder: { "@type": "Person", name: "Nikhil R.", url: "https://rnikhil.com" },
} as const;

export function faqPageSchema(faqs: readonly FAQItem[] = voiceAIFAQs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
