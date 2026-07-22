import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateLatencySegments,
  calculateResults,
  DEFAULT_STATE,
  normalizeCalculatorState,
  type CalculatorState,
} from "../client/src/lib/calculator.ts";
import { createShareableUrl } from "../client/src/lib/utils.ts";
import {
  initialState,
  normalizeSharedCatalogVerifiedAt,
  type SharedPayload,
} from "../client/src/hooks/useCalculator.ts";
import { llmProviders, sttProviders, ttsProviders } from "../shared/pricing-catalog.ts";
import { PRICING_VERIFIED_DATE } from "../shared/providers.ts";

const zeroLatency = {
  micInputLatency: 0,
  opusEncodingLatency: 0,
  networkLatency: 0,
  packetHandlingLatency: 0,
  jitterBufferLatency: 0,
  opusDecodingLatency: 0,
  transcriptionLatency: 0,
  llmLatency: 0,
  sentenceAggregationLatency: 0,
  ttsLatency: 0,
  speakerOutputLatency: 0,
};

function state(overrides: Partial<CalculatorState>): CalculatorState {
  return { ...DEFAULT_STATE, ...zeroLatency, ...overrides };
}

function assertClose(actual: number, expected: number, label: string) {
  const tolerance = Math.max(1e-12, Math.abs(expected) * 1e-12);
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected}, received ${actual}`,
  );
}

test("calculator independently prices STT, accumulated LLM context, TTS, and hosting", () => {
  const results = calculateResults(state({
    transcriptionCost: 0.01,
    llmInputCost: 0.001,
    llmOutputCost: 0.002,
    voiceCost: 0.003,
    vcpuCost: 0.5,
    wordsPerMinute: 100,
    tokensPerWord: 1.5,
    charsPerWord: 5,
    turnsPerMinute: 4,
    llmSpeechRatio: 0.4,
    conversationLength: 1,
    agentsPerVcpu: 2,
  }));

  // 40 assistant words => 60 output tokens; 60 user words => 90 user tokens.
  // Four requests accumulate 2.5x the user tokens and 1.5x prior outputs.
  assert.equal(results.llmOutputTokens, 60);
  assert.equal(results.llmInputTokens, 315);
  assertClose(results.transcriptionTotal, 0.01, "transcription total");
  assertClose(results.llmTotal, 0.435, "LLM total");
  assertClose(results.voiceTotal, 0.6, "voice total");
  assertClose(results.hostingTotal, 0.25, "hosting total");
  assertClose(results.totalCost, 1.295, "total cost");
  assertClose(results.costPerMinute, 1.295, "cost per minute");
  assert.equal(results.totalLatency, 0);
});

test("default latency and shared latency segments remain pinned", () => {
  const segments = calculateLatencySegments(DEFAULT_STATE);
  const results = calculateResults(DEFAULT_STATE);

  assert.deepEqual(segments, {
    input: 114,
    processing: 790,
    output: 89,
    total: 993,
  });
  assert.equal(results.totalLatency, 993);
});

test("zero cost and latency inputs remain finite", () => {
  const zero = state({
    transcriptionCost: 0,
    llmInputCost: 0,
    llmOutputCost: 0,
    llmContextThresholdTokens: null,
    llmLongContextInputCost: null,
    llmLongContextOutputCost: null,
    voiceCost: 0,
    vcpuCost: 0,
  });
  const results = calculateResults(zero);

  assert.equal(results.totalCost, 0);
  assert.equal(results.costPerMinute, 0);
  assert.equal(results.totalLatency, 0);
  assert.deepEqual(calculateLatencySegments(zero), { input: 0, processing: 0, output: 0, total: 0 });
  for (const value of Object.values(results)) assert.ok(Number.isFinite(value));
});

test("cost per minute divides by a non-unit conversation length", () => {
  const results = calculateResults(state({
    transcriptionCost: 0.01,
    llmInputCost: 0,
    llmOutputCost: 0,
    llmContextThresholdTokens: null,
    llmLongContextInputCost: null,
    llmLongContextOutputCost: null,
    voiceCost: 0,
    vcpuCost: 0,
    conversationLength: 2,
  }));

  assertClose(results.totalCost, 0.02, "two-minute total");
  assertClose(results.costPerMinute, 0.01, "two-minute normalized cost");
});

test("AI-speech ratio zero produces no output or TTS while retaining user context", () => {
  const results = calculateResults(state({
    transcriptionCost: 0,
    llmInputCost: 1,
    llmOutputCost: 1,
    voiceCost: 1,
    vcpuCost: 0,
    wordsPerMinute: 60,
    tokensPerWord: 1,
    charsPerWord: 1,
    turnsPerMinute: 2,
    llmSpeechRatio: 0,
    conversationLength: 2,
  }));

  assert.equal(results.llmOutputTokens, 0);
  assert.equal(results.llmInputTokens, 300);
  assert.equal(results.voiceTotal, 0);
  assert.equal(results.llmTotal, 300);
});

test("AI-speech ratio one produces no user tokens and accumulates only prior outputs", () => {
  const results = calculateResults(state({
    transcriptionCost: 0,
    llmInputCost: 1,
    llmOutputCost: 1,
    voiceCost: 1,
    vcpuCost: 0,
    wordsPerMinute: 60,
    tokensPerWord: 1,
    charsPerWord: 1,
    turnsPerMinute: 2,
    llmSpeechRatio: 1,
    conversationLength: 2,
  }));

  assert.equal(results.llmOutputTokens, 120);
  assert.equal(results.llmInputTokens, 180);
  assert.equal(results.voiceTotal, 120);
  assert.equal(results.llmTotal, 300);
});

test("multi-turn context follows the arithmetic series rather than charging one prompt", () => {
  const oneTurn = calculateResults(state({
    wordsPerMinute: 10,
    conversationLength: 1,
    tokensPerWord: 1,
    turnsPerMinute: 1,
    llmSpeechRatio: 0.5,
  }));
  const fiveTurns = calculateResults(state({
    wordsPerMinute: 10,
    conversationLength: 1,
    tokensPerWord: 1,
    turnsPerMinute: 5,
    llmSpeechRatio: 0.5,
  }));

  assert.equal(oneTurn.llmOutputTokens, 5);
  assert.equal(oneTurn.llmInputTokens, 5);
  assert.equal(fiveTurns.llmOutputTokens, 5);
  assert.equal(fiveTurns.llmInputTokens, 25);
});

test("long-context pricing switches per request after the provider threshold", () => {
  const results = calculateResults(state({
    transcriptionCost: 0,
    llmInputCost: 0.1,
    llmOutputCost: 0.2,
    llmContextThresholdTokens: 6,
    llmLongContextInputCost: 1,
    llmLongContextOutputCost: 2,
    voiceCost: 0,
    vcpuCost: 0,
    wordsPerMinute: 20,
    conversationLength: 1,
    tokensPerWord: 1,
    turnsPerMinute: 2,
    llmSpeechRatio: 0.5,
  }));

  // Turn 1 sends 5 input tokens and emits 5; turn 2 sends 15 and emits 5.
  assert.equal(results.llmInputTokens, 20);
  assert.equal(results.llmOutputTokens, 10);
  assert.equal(results.longContextTurns, 1);
  assert.equal(results.llmTotal, 26.5);
});

test("fixed input and non-spoken output assumptions are billed on every request", () => {
  const results = calculateResults(state({
    transcriptionCost: 0,
    llmInputCost: 1,
    llmOutputCost: 1,
    llmContextThresholdTokens: null,
    llmLongContextInputCost: null,
    llmLongContextOutputCost: null,
    fixedInputTokensPerRequest: 3,
    nonSpeechOutputTokensPerRequest: 2,
    voiceCost: 0,
    vcpuCost: 0,
    wordsPerMinute: 20,
    conversationLength: 1,
    tokensPerWord: 1,
    turnsPerMinute: 2,
    llmSpeechRatio: 0.5,
  }));

  // Request inputs are 3+5 and 3+10+5; outputs are (5 spoken + 2 extra) twice.
  assert.equal(results.llmInputTokens, 26);
  assert.equal(results.llmOutputTokens, 14);
  assert.equal(results.llmTotal, 40);
});

test("STT request minimums and rounding determine billable duration", () => {
  const minimum = calculateResults(state({
    transcriptionCost: 0.01,
    transcriptionMinimumBillableSeconds: 15,
    transcriptionRoundingSeconds: 1,
    conversationLength: 0.1,
  }));
  assert.equal(minimum.transcriptionBillableMinutes, 0.25);
  assertClose(minimum.transcriptionTotal, 0.0025, "minimum-duration transcription total");

  const rounded = calculateResults(state({
    transcriptionCost: 0.01,
    transcriptionMinimumBillableSeconds: 0,
    transcriptionRoundingSeconds: 10,
    conversationLength: 0.18,
  }));
  assertClose(rounded.transcriptionBillableMinutes, 1 / 3, "rounded transcription minutes");
  assertClose(rounded.transcriptionTotal, 1 / 300, "rounded transcription total");

  const roundingBeatsMinimum = calculateResults(state({
    transcriptionCost: 0.01,
    transcriptionMinimumBillableSeconds: 15,
    transcriptionRoundingSeconds: 10,
    conversationLength: 0.3,
  }));
  assertClose(roundingBeatsMinimum.transcriptionBillableMinutes, 1 / 3, "rounding above minimum");
  assertClose(roundingBeatsMinimum.transcriptionTotal, 1 / 300, "rounded-above-minimum total");
});

test("turn count is rounded once for fractional conversation schedules", () => {
  const oneTurn = calculateResults(state({
    wordsPerMinute: 8,
    conversationLength: 1,
    tokensPerWord: 1,
    turnsPerMinute: 1.49,
    llmSpeechRatio: 0.5,
  }));
  const threeTurns = calculateResults(state({
    wordsPerMinute: 8,
    conversationLength: 1,
    tokensPerWord: 1,
    turnsPerMinute: 2.5,
    llmSpeechRatio: 0.5,
  }));

  assert.equal(oneTurn.llmInputTokens, 4);
  assert.equal(threeTurns.llmInputTokens, 12);
});

test("normalization replaces non-finite values and clamps unsafe edge cases", () => {
  const invalid = normalizeCalculatorState({
    wordsPerMinute: Number.NaN,
    tokensPerWord: Number.POSITIVE_INFINITY,
    llmSpeechRatio: -5,
    conversationLength: 0,
    agentsPerVcpu: 0,
    networkLatency: 100_000,
  });

  assert.equal(invalid.wordsPerMinute, DEFAULT_STATE.wordsPerMinute);
  assert.equal(invalid.tokensPerWord, DEFAULT_STATE.tokensPerWord);
  assert.equal(invalid.llmSpeechRatio, 0);
  assert.equal(invalid.conversationLength, 0.1);
  assert.equal(invalid.agentsPerVcpu, 1);
  assert.equal(invalid.networkLatency, 60_000);

  const upperRatio = normalizeCalculatorState({ llmSpeechRatio: 7 });
  assert.equal(upperRatio.llmSpeechRatio, 1);

  const results = calculateResults(invalid);
  for (const [key, value] of Object.entries(results)) {
    assert.ok(Number.isFinite(value), `${key} must remain finite after normalization`);
    assert.ok(value >= 0, `${key} must remain non-negative after normalization`);
  }
});

test("nullable long-context fields reject values that could overflow totals", () => {
  const normalized = normalizeCalculatorState({
    llmContextThresholdTokens: 1e308,
    llmLongContextInputCost: 1e308,
    llmLongContextOutputCost: 1e308,
  });

  assert.equal(normalized.llmContextThresholdTokens, DEFAULT_STATE.llmContextThresholdTokens);
  assert.equal(normalized.llmLongContextInputCost, DEFAULT_STATE.llmLongContextInputCost);
  assert.equal(normalized.llmLongContextOutputCost, DEFAULT_STATE.llmLongContextOutputCost);
  for (const value of Object.values(calculateResults(normalized))) assert.ok(Number.isFinite(value));

  const invalid = normalizeCalculatorState({
    llmContextThresholdTokens: -1,
    llmLongContextInputCost: Number.NaN,
    llmLongContextOutputCost: Number.POSITIVE_INFINITY,
  });
  assert.equal(invalid.llmContextThresholdTokens, DEFAULT_STATE.llmContextThresholdTokens);
  assert.equal(invalid.llmLongContextInputCost, DEFAULT_STATE.llmLongContextInputCost);
  assert.equal(invalid.llmLongContextOutputCost, DEFAULT_STATE.llmLongContextOutputCost);
});

test("default selected providers resolve to the catalog and match default rates", () => {
  const llm = llmProviders.find((provider) => provider.id === DEFAULT_STATE.selectedLLMProvider);
  const stt = sttProviders.find((provider) => provider.id === DEFAULT_STATE.selectedSTTProvider);
  const tts = ttsProviders.find((provider) => provider.id === DEFAULT_STATE.selectedTTSProvider);

  assert.ok(llm, "default LLM must exist and be calculator eligible");
  assert.ok(stt, "default STT must exist and be calculator eligible");
  assert.ok(tts, "default TTS must exist and be calculator eligible");
  assert.equal(DEFAULT_STATE.llmInputCost, llm.inputCost);
  assert.equal(DEFAULT_STATE.llmOutputCost, llm.outputCost);
  assert.equal(DEFAULT_STATE.llmContextThresholdTokens, llm.contextThresholdTokens ?? null);
  assert.equal(DEFAULT_STATE.llmLongContextInputCost, (llm.longContextInputCostPerMillion ?? 0) / 1_000_000 || null);
  assert.equal(DEFAULT_STATE.llmLongContextOutputCost, (llm.longContextOutputCostPerMillion ?? 0) / 1_000_000 || null);
  assert.equal(DEFAULT_STATE.transcriptionCost, stt.costPerMinute);
  assert.equal(DEFAULT_STATE.transcriptionMinimumBillableSeconds, stt.minimumBillableSeconds ?? 0);
  assert.equal(DEFAULT_STATE.transcriptionRoundingSeconds, stt.roundingSeconds ?? 0);
  assert.equal(DEFAULT_STATE.voiceCost, tts.costPerCharacter);
});

test("share URL preserves normalized state, results, and provider IDs", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { origin: "https://calculator.example" } },
  });

  try {
    const sharedState = normalizeCalculatorState({
      ...DEFAULT_STATE,
      wordsPerMinute: 157,
      tokensPerWord: 1.7,
      llmSpeechRatio: 0.63,
      conversationLength: 12.5,
      selectedLLMProvider: llmProviders.at(-1)?.id ?? null,
      selectedSTTProvider: sttProviders.at(-1)?.id ?? null,
      selectedTTSProvider: ttsProviders.at(-1)?.id ?? null,
    });
    const results = calculateResults(sharedState);
    const url = createShareableUrl(sharedState, results);
    const encoded = new URL(url).searchParams.get("share");

    assert.ok(encoded, "share query parameter must exist");
    assert.match(encoded, /^[A-Za-z0-9_-]+$/, "share payload must be URL-safe base64");

    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as {
      version: number;
      catalogVerifiedAt: string;
      state: Partial<CalculatorState>;
      results: Record<string, number>;
      providers: { llm: string | null; stt: string | null; tts: string | null };
    };

    assert.equal(payload.version, 3);
    assert.equal(payload.catalogVerifiedAt, PRICING_VERIFIED_DATE);
    assert.equal(payload.providers.llm, sharedState.selectedLLMProvider);
    assert.equal(payload.providers.stt, sharedState.selectedSTTProvider);
    assert.equal(payload.providers.tts, sharedState.selectedTTSProvider);
    const rehydratedState = initialState(payload as SharedPayload);
    assert.deepEqual(rehydratedState, sharedState);
    assert.equal(payload.results.totalCost, results.totalCost);
    assert.equal(payload.results.costPerMinute, results.costPerMinute);
    assert.equal(payload.results.llmInputTokens, results.llmInputTokens);
    assert.equal(payload.results.llmOutputTokens, results.llmOutputTokens);
  } finally {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
  }
});

test("shared catalog dates accept only real ISO calendar dates", () => {
  assert.equal(normalizeSharedCatalogVerifiedAt("2026-07-22"), "2026-07-22");
  assert.equal(normalizeSharedCatalogVerifiedAt("2024-02-29"), "2024-02-29");
  assert.equal(normalizeSharedCatalogVerifiedAt("2026-02-29"), null);
  assert.equal(normalizeSharedCatalogVerifiedAt("2026-13-01"), null);
  assert.equal(normalizeSharedCatalogVerifiedAt("=HYPERLINK(\"https://example.com\")\n2026-07-22"), null);
  assert.equal(normalizeSharedCatalogVerifiedAt(20260722), null);
});

test("legacy shares preserve legacy arithmetic instead of mixing in current billing rules", () => {
  const legacy = initialState({
    version: 1,
    state: {
      llmInputCost: 0.000123,
      llmOutputCost: 0.000456,
      transcriptionCost: 0.0123,
    },
    providers: {
      llm: DEFAULT_STATE.selectedLLMProvider ?? undefined,
      stt: DEFAULT_STATE.selectedSTTProvider ?? undefined,
      tts: DEFAULT_STATE.selectedTTSProvider ?? undefined,
    },
  });

  assert.equal(legacy.llmInputCost, 0.000123);
  assert.equal(legacy.llmOutputCost, 0.000456);
  assert.equal(legacy.transcriptionCost, 0.0123);
  assert.equal(legacy.llmContextThresholdTokens, null);
  assert.equal(legacy.llmLongContextInputCost, null);
  assert.equal(legacy.llmLongContextOutputCost, null);
  assert.equal(legacy.transcriptionMinimumBillableSeconds, 0);
  assert.equal(legacy.transcriptionRoundingSeconds, 0);
});

test("shared snapshots do not relabel removed providers as current defaults", () => {
  const snapshot = initialState({
    version: 3,
    catalogVerifiedAt: "2026-01-01",
    state: {
      llmInputCost: 0.000321,
      llmOutputCost: 0.000654,
      llmContextThresholdTokens: 1000,
      llmLongContextInputCost: 0.000987,
      llmLongContextOutputCost: 0.001234,
      transcriptionMinimumBillableSeconds: 7,
      transcriptionRoundingSeconds: 2,
    },
    providers: { llm: "removed_provider_model" },
  });

  assert.equal(snapshot.selectedLLMProvider, null);
  assert.equal(snapshot.llmInputCost, 0.000321);
  assert.equal(snapshot.llmOutputCost, 0.000654);
  assert.equal(snapshot.llmContextThresholdTokens, 1000);
  assert.equal(snapshot.transcriptionMinimumBillableSeconds, 7);
});

test("shared snapshots validate fallback provider IDs against calculator selectors", () => {
  const pricingRules = {
    llmContextThresholdTokens: null,
    llmLongContextInputCost: null,
    llmLongContextOutputCost: null,
    transcriptionMinimumBillableSeconds: 0,
    transcriptionRoundingSeconds: 0,
  };
  const snapshot = initialState({
    version: 3,
    state: {
      ...pricingRules,
      selectedLLMProvider: "meta_host_required",
      selectedSTTProvider: "openai_whisper_1",
      selectedTTSProvider: "hume_octave_2_creator",
    },
  });

  assert.equal(snapshot.selectedLLMProvider, null);
  assert.equal(snapshot.selectedSTTProvider, null);
  assert.equal(snapshot.selectedTTSProvider, null);

  const nonStringProvider = initialState({
    version: 3,
    state: pricingRules,
    providers: { llm: 123 },
  } as unknown as SharedPayload);
  assert.equal(nonStringProvider.selectedLLMProvider, null);
});
