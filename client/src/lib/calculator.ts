export interface CalculatorState {
  transcriptionCost: number;
  llmInputCost: number;
  llmOutputCost: number;
  llmContextThresholdTokens: number | null;
  llmLongContextInputCost: number | null;
  llmLongContextOutputCost: number | null;
  fixedInputTokensPerRequest: number;
  nonSpeechOutputTokensPerRequest: number;
  voiceCost: number;
  transcriptionMinimumBillableSeconds: number;
  transcriptionRoundingSeconds: number;
  vcpuCost: number;
  selectedLLMProvider: string | null;
  selectedSTTProvider: string | null;
  selectedTTSProvider: string | null;
  wordsPerMinute: number;
  tokensPerWord: number;
  charsPerWord: number;
  turnsPerMinute: number;
  llmSpeechRatio: number;
  conversationLength: number;
  agentsPerVcpu: number;
  micInputLatency: number;
  opusEncodingLatency: number;
  networkLatency: number;
  packetHandlingLatency: number;
  jitterBufferLatency: number;
  opusDecodingLatency: number;
  transcriptionLatency: number;
  llmLatency: number;
  sentenceAggregationLatency: number;
  ttsLatency: number;
  speakerOutputLatency: number;
}

export interface CalculatorResults {
  llmInputTokens: number;
  llmOutputTokens: number;
  transcriptionTotal: number;
  transcriptionBillableMinutes: number;
  llmTotal: number;
  longContextTurns: number;
  voiceTotal: number;
  hostingTotal: number;
  totalCost: number;
  costPerMinute: number;
  totalLatency: number;
}

export interface LatencySegments {
  input: number;
  processing: number;
  output: number;
  total: number;
}

export type NumericCalculatorStateKey = {
  [Key in keyof CalculatorState]: CalculatorState[Key] extends number ? Key : never;
}[keyof CalculatorState];

export type EditableCalculatorStateKey =
  | NumericCalculatorStateKey
  | "llmContextThresholdTokens"
  | "llmLongContextInputCost"
  | "llmLongContextOutputCost";

export const DEFAULT_STATE: CalculatorState = {
  transcriptionCost: 0.0065,
  llmInputCost: 0.000001,
  llmOutputCost: 0.000006,
  llmContextThresholdTokens: 272000,
  llmLongContextInputCost: 0.000002,
  llmLongContextOutputCost: 0.000009,
  fixedInputTokensPerRequest: 0,
  nonSpeechOutputTokensPerRequest: 0,
  voiceCost: 0.00003,
  transcriptionMinimumBillableSeconds: 0,
  transcriptionRoundingSeconds: 0,
  vcpuCost: 0,
  selectedLLMProvider: "openai_gpt_5_6_luna",
  selectedSTTProvider: "deepgram_flux_english",
  selectedTTSProvider: "deepgram_aura_2_payg",
  wordsPerMinute: 130,
  tokensPerWord: 1.3,
  charsPerWord: 6,
  turnsPerMinute: 4,
  llmSpeechRatio: 0.5,
  conversationLength: 10,
  agentsPerVcpu: 1,
  micInputLatency: 40,
  opusEncodingLatency: 21,
  networkLatency: 10,
  packetHandlingLatency: 2,
  jitterBufferLatency: 40,
  opusDecodingLatency: 1,
  transcriptionLatency: 300,
  llmLatency: 350,
  sentenceAggregationLatency: 20,
  ttsLatency: 120,
  speakerOutputLatency: 15,
};

const numericBounds: Partial<Record<keyof CalculatorState, [number, number]>> = {
  transcriptionCost: [0, 100],
  llmInputCost: [0, 1],
  llmOutputCost: [0, 1],
  fixedInputTokensPerRequest: [0, 1_000_000],
  nonSpeechOutputTokensPerRequest: [0, 1_000_000],
  transcriptionMinimumBillableSeconds: [0, 3600],
  transcriptionRoundingSeconds: [0, 3600],
  voiceCost: [0, 100],
  vcpuCost: [0, 100],
  wordsPerMinute: [1, 400],
  tokensPerWord: [0.1, 10],
  charsPerWord: [1, 20],
  turnsPerMinute: [0.1, 30],
  llmSpeechRatio: [0, 1],
  conversationLength: [0.1, 1440],
  agentsPerVcpu: [1, 10000],
  micInputLatency: [0, 60000],
  opusEncodingLatency: [0, 60000],
  networkLatency: [0, 60000],
  packetHandlingLatency: [0, 60000],
  jitterBufferLatency: [0, 60000],
  opusDecodingLatency: [0, 60000],
  transcriptionLatency: [0, 60000],
  llmLatency: [0, 60000],
  sentenceAggregationLatency: [0, 60000],
  ttsLatency: [0, 60000],
  speakerOutputLatency: [0, 60000],
};

const nullableNumericBounds = {
  llmContextThresholdTokens: [0, 1_000_000_000],
  // A deliberately generous safety ceiling preserves manual scenario modeling
  // while rejecting finite values large enough to overflow aggregate totals.
  llmLongContextInputCost: [0, 100],
  llmLongContextOutputCost: [0, 100],
} as const satisfies Record<
  "llmContextThresholdTokens" | "llmLongContextInputCost" | "llmLongContextOutputCost",
  readonly [number, number]
>;

export function normalizeCalculatorState(candidate: Partial<CalculatorState>): CalculatorState {
  const merged: CalculatorState = { ...DEFAULT_STATE, ...candidate };

  for (const [key, [minimum, maximum]] of Object.entries(numericBounds) as Array<
    [keyof CalculatorState, [number, number]]
  >) {
    const value = merged[key];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      (merged as unknown as Record<string, unknown>)[key] = DEFAULT_STATE[key];
    } else {
      (merged as unknown as Record<string, unknown>)[key] = Math.min(Math.max(value, minimum), maximum);
    }
  }

  for (const key of ["llmContextThresholdTokens", "llmLongContextInputCost", "llmLongContextOutputCost"] as const) {
    const value = merged[key];
    const [minimum, maximum] = nullableNumericBounds[key];
    if (
      value !== null &&
      (typeof value !== "number" || !Number.isFinite(value) || value < minimum || value > maximum)
    ) {
      merged[key] = DEFAULT_STATE[key];
    }
  }

  return merged;
}

export function calculateLatencySegments(state: CalculatorState): LatencySegments {
  const input =
    state.micInputLatency +
    state.opusEncodingLatency +
    state.networkLatency +
    state.packetHandlingLatency +
    state.jitterBufferLatency +
    state.opusDecodingLatency;
  const processing =
    state.transcriptionLatency +
    state.llmLatency +
    state.sentenceAggregationLatency +
    state.ttsLatency;
  const output =
    state.opusEncodingLatency +
    state.packetHandlingLatency +
    state.networkLatency +
    state.jitterBufferLatency +
    state.opusDecodingLatency +
    state.speakerOutputLatency;

  return { input, processing, output, total: input + processing + output };
}

export function calculateResults(input: CalculatorState): CalculatorResults {
  const state = normalizeCalculatorState(input);
  const totalWords = state.wordsPerMinute * state.conversationLength;
  const assistantWords = totalWords * state.llmSpeechRatio;
  const userWords = totalWords - assistantWords;
  const spokenOutputTokens = assistantWords * state.tokensPerWord;
  const userTokens = userWords * state.tokensPerWord;
  const turns = Math.max(1, Math.round(state.turnsPerMinute * state.conversationLength));
  const llmOutputTokens =
    spokenOutputTokens + state.nonSpeechOutputTokensPerRequest * turns;

  // Each request includes the current user segment and all prior user/assistant turns.
  // Summing that growing context yields these two arithmetic-series terms.
  const llmInputTokens =
    userTokens * ((turns + 1) / 2) +
    spokenOutputTokens * ((turns - 1) / 2) +
    state.fixedInputTokensPerRequest * turns;

  // STT session-minute rates apply to the configured call duration. Providers that
  // bill only voiced audio should be modeled by manually adjusting this field.
  const rawTranscriptionSeconds = state.conversationLength * 60;
  const roundedTranscriptionSeconds = state.transcriptionRoundingSeconds > 0
    ? Math.ceil(rawTranscriptionSeconds / state.transcriptionRoundingSeconds) * state.transcriptionRoundingSeconds
    : rawTranscriptionSeconds;
  const billableTranscriptionSeconds = Math.max(
    roundedTranscriptionSeconds,
    state.transcriptionMinimumBillableSeconds,
  );
  const transcriptionBillableMinutes = billableTranscriptionSeconds / 60;
  const transcriptionTotal = state.transcriptionCost * transcriptionBillableMinutes;

  let llmTotal = 0;
  let longContextTurns = 0;
  const userTokensPerTurn = userTokens / turns;
  const spokenOutputTokensPerTurn = spokenOutputTokens / turns;
  const billedOutputTokensPerTurn =
    spokenOutputTokensPerTurn + state.nonSpeechOutputTokensPerRequest;
  for (let turn = 1; turn <= turns; turn += 1) {
    const requestInputTokens =
      state.fixedInputTokensPerRequest +
      userTokensPerTurn * turn +
      spokenOutputTokensPerTurn * (turn - 1);
    const usesLongContextRate =
      state.llmContextThresholdTokens !== null &&
      state.llmLongContextInputCost !== null &&
      state.llmLongContextOutputCost !== null &&
      requestInputTokens > state.llmContextThresholdTokens;
    if (usesLongContextRate) longContextTurns += 1;
    llmTotal +=
      requestInputTokens * (usesLongContextRate ? state.llmLongContextInputCost! : state.llmInputCost) +
      billedOutputTokensPerTurn * (usesLongContextRate ? state.llmLongContextOutputCost! : state.llmOutputCost);
  }
  const voiceTotal =
    state.voiceCost * assistantWords * state.charsPerWord;
  const hostingTotal =
    (state.vcpuCost * state.conversationLength) / state.agentsPerVcpu;
  const totalCost = transcriptionTotal + llmTotal + voiceTotal + hostingTotal;

  const totalLatency = calculateLatencySegments(state).total;

  return {
    llmInputTokens,
    llmOutputTokens,
    transcriptionTotal,
    transcriptionBillableMinutes,
    llmTotal,
    longContextTurns,
    voiceTotal,
    hostingTotal,
    totalCost,
    costPerMinute: totalCost / state.conversationLength,
    totalLatency,
  };
}
