import { Bot, FileText, GraduationCap, Headphones } from "lucide-react";
import { calculateResults, DEFAULT_STATE } from "@/lib/calculator";
import { llmProviders, sttCatalog, sttProviders, ttsCatalog, ttsProviders } from "@shared/pricing-catalog";
import { PRICING_VERIFIED_DATE } from "@shared/providers";

function requireProvider<T extends { id: string }>(providers: T[], id: string) {
  const provider = providers.find((candidate) => candidate.id === id);
  if (!provider) throw new Error(`Missing pricing provider: ${id}`);
  return provider;
}

function voiceStackEstimate(
  monthlyMinutes: number,
  averageCallMinutes: number,
  ids: { llm: string; stt: string; tts: string },
) {
  const llm = requireProvider(llmProviders, ids.llm);
  const stt = requireProvider(sttProviders, ids.stt);
  const tts = requireProvider(ttsProviders, ids.tts);
  if (stt.costPerMinute === null) throw new Error(`STT row is not calculator eligible: ${stt.id}`);

  const perCall = calculateResults({
    ...DEFAULT_STATE,
    conversationLength: averageCallMinutes,
    llmInputCost: llm.inputCost,
    llmOutputCost: llm.outputCost,
    llmContextThresholdTokens: llm.contextThresholdTokens ?? null,
    llmLongContextInputCost: llm.longContextInputCostPerMillion !== undefined ? llm.longContextInputCostPerMillion / 1_000_000 : null,
    llmLongContextOutputCost: llm.longContextOutputCostPerMillion !== undefined ? llm.longContextOutputCostPerMillion / 1_000_000 : null,
    transcriptionCost: stt.costPerMinute,
    transcriptionMinimumBillableSeconds: stt.minimumBillableSeconds ?? 0,
    transcriptionRoundingSeconds: stt.roundingSeconds ?? 0,
    voiceCost: tts.costPerCharacter,
  });

  return {
    label: `${stt.name} + ${llm.name} + ${tts.name}`,
    monthlyCost: perCall.totalCost * (monthlyMinutes / averageCallMinutes),
  };
}

function transcriptionEstimate(monthlyMinutes: number, id: string) {
  const record = requireProvider(sttCatalog, id);
  if (record.costPerMinute === null || record.currency !== "USD") {
    throw new Error(`STT row has no fixed USD minute price: ${record.id}`);
  }
  return { label: record.name, monthlyCost: monthlyMinutes * record.costPerMinute };
}

function synthesisEstimate(characters: number, id: string) {
  const record = requireProvider(ttsCatalog, id);
  if (record.costPerMillionCharacters === null || record.currency !== "USD") {
    throw new Error(`TTS row has no fixed USD character price: ${record.id}`);
  }
  return {
    label: record.name,
    monthlyCost: characters * record.costPerMillionCharacters / 1_000_000,
  };
}

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const realtimeSupport = [
  voiceStackEstimate(50_000, 5, {
    llm: "mistral_small_4",
    stt: "deepgram_nova_3_mono_streaming",
    tts: "amazon_polly_standard",
  }),
  voiceStackEstimate(50_000, 5, {
    llm: "openai_gpt_5_6_luna",
    stt: "deepgram_flux_english",
    tts: "deepgram_aura_2_payg",
  }),
];

const mobileAssistant = [
  voiceStackEstimate(6_000_000, 2, {
    llm: "google_gemini_3_5_flash_lite",
    stt: "elevenlabs_scribe_v2_realtime",
    tts: "elevenlabs_flash_v2_5",
  }),
  voiceStackEstimate(6_000_000, 2, {
    llm: "anthropic_claude_haiku_4_5",
    stt: "aws_transcribe_streaming_us_east_1",
    tts: "amazon_polly_neural",
  }),
];

const examples = [
  {
    icon: Headphones,
    title: "Realtime support",
    usage: "50,000 minutes/month · 5-minute calls",
    description: "Two illustrative voice-agent stacks using the same 130 words/minute, 50% assistant-speech, and four-turns/minute assumptions as the calculator.",
    options: realtimeSupport,
  },
  {
    icon: Bot,
    title: "Mobile voice assistant",
    usage: "6,000,000 minutes/month · 2-minute sessions",
    description: "Short sessions accumulate less per-call LLM context than one continuous monthly conversation; each session is calculated independently.",
    options: mobileAssistant,
  },
  {
    icon: FileText,
    title: "Narration",
    usage: "300,000 generated characters/month",
    description: "A TTS-only comparison. It excludes subscription minimums, unused plan credits, taxes, and add-ons.",
    options: [
      synthesisEstimate(300_000, "amazon_polly_standard"),
      synthesisEstimate(300_000, "elevenlabs_multilingual_v2"),
    ],
  },
  {
    icon: GraduationCap,
    title: "Asynchronous transcription",
    usage: "120,000 audio minutes/month",
    description: "A pre-recorded or batch STT-only comparison. Realtime and dynamic-batch modes are not interchangeable operationally.",
    options: [
      transcriptionEstimate(120_000, "google_chirp_3_dynamic_batch"),
      transcriptionEstimate(120_000, "deepgram_nova_3_mono_prerecorded"),
    ],
  },
];

export default function UseCasesSection() {
  return (
    <section className="mb-8 mt-12" aria-labelledby="examples-heading">
      <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0)] p-6">
        <h2 id="examples-heading" className="font-mono text-2xl md:text-3xl font-bold text-center uppercase tracking-tight mb-3">
          Current cost examples
        </h2>
        <p className="text-sm text-center max-w-4xl mx-auto mb-6">
          Reproducible scenarios derived from the same catalog and formulas as the calculator. They illustrate list-price arithmetic, not provider quality or an invoice quote.
          Voice-stack examples use 130 words/minute, 1.3 tokens/word, 6 billable characters/word, 50% assistant speech, 4 turns/minute, zero fixed or extra-output tokens, zero hosting cost, and the selected rows' published context and STT billing rules.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {examples.map(({ icon: Icon, title, usage, description, options }) => (
            <article key={title} className="border-4 border-black bg-gray-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center" aria-hidden="true">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-mono text-lg font-bold uppercase tracking-tight">{title}</h3>
              </div>
              <p className="text-sm mb-3 leading-relaxed">{description}</p>
              <p className="font-mono text-xs font-bold border-2 border-black bg-white p-2 mb-3">USAGE: {usage}</p>
              <div className="space-y-2">
                {options.map((option) => (
                  <div key={option.label} className="border-2 border-black bg-white p-3">
                    <div className="text-xs mb-1">{option.label}</div>
                    <div className="font-mono text-sm font-bold">{money.format(option.monthlyCost)}/month</div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 border-4 border-black bg-yellow-100 p-4">
          <p className="font-mono text-xs text-center">
            Rates checked {PRICING_VERIFIED_DATE}. Free tiers, minimum billable durations, cache behavior, regions, taxes, currency conversion, negotiated discounts, and optional features can change actual spend. Open the linked source on each comparison page before purchasing.
          </p>
        </div>
      </div>
    </section>
  );
}
