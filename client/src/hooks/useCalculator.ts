import { useMemo, useState } from "react";
import {
  llmProviders,
  sttProviders,
  ttsProviders,
} from "@shared/pricing-catalog";
import type { LLMProvider, STTProvider, TTSProvider } from "@shared/providers";
import {
  calculateResults,
  DEFAULT_STATE,
  normalizeCalculatorState,
  type CalculatorResults,
  type CalculatorState,
  type EditableCalculatorStateKey,
} from "@/lib/calculator";

export type { CalculatorResults, CalculatorState } from "@/lib/calculator";

export interface SharedPayload {
  version?: number;
  catalogVerifiedAt?: unknown;
  state?: Partial<CalculatorState>;
  providers?: {
    llm?: string;
    stt?: string;
    tts?: string;
  };
}

export function normalizeSharedCatalogVerifiedAt(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value
    ? null
    : value;
}

function parseSharedPayload(): SharedPayload | null {
  if (typeof window === "undefined") return null;
  const encoded = new URLSearchParams(window.location.search).get("share");
  if (!encoded) return null;

  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as SharedPayload;
  } catch {
    try {
      return JSON.parse(atob(encoded)) as SharedPayload;
    } catch {
      return null;
    }
  }
}

function providerId<T extends { id: string; name: string }>(
  providers: T[],
  value: unknown,
  fallback: unknown,
) {
  if (value !== undefined && value !== null && (typeof value !== "string" || value.length === 0)) {
    return null;
  }
  const candidate = value ?? fallback;
  if (typeof candidate !== "string" || candidate.length === 0) return null;
  return providers.find((provider) => provider.id === candidate || provider.name === candidate)?.id ?? null;
}

const snapshottedPricingRuleKeys = [
  "llmContextThresholdTokens",
  "llmLongContextInputCost",
  "llmLongContextOutputCost",
  "transcriptionMinimumBillableSeconds",
  "transcriptionRoundingSeconds",
] as const;

export function initialState(payload: SharedPayload | null): CalculatorState {
  if (!payload) return DEFAULT_STATE;
  const state = normalizeCalculatorState(payload.state ?? {});
  const selectedLLMProvider = providerId(llmProviders, payload.providers?.llm, state.selectedLLMProvider);
  const selectedSTTProvider = providerId(sttProviders, payload.providers?.stt, state.selectedSTTProvider);
  const selectedTTSProvider = providerId(ttsProviders, payload.providers?.tts, state.selectedTTSProvider);
  const hasCompletePricingRuleSnapshot = snapshottedPricingRuleKeys.every((key) =>
    Object.prototype.hasOwnProperty.call(payload.state ?? {}, key),
  );

  return {
    ...state,
    selectedLLMProvider,
    selectedSTTProvider,
    selectedTTSProvider,
    // Version-2+ links snapshot all pricing rules. Legacy links predate request
    // minimums and long-context tiers, so preserve their old arithmetic instead
    // of combining their saved base rates with today's catalog rules.
    llmContextThresholdTokens: hasCompletePricingRuleSnapshot ? state.llmContextThresholdTokens : null,
    llmLongContextInputCost: hasCompletePricingRuleSnapshot ? state.llmLongContextInputCost : null,
    llmLongContextOutputCost: hasCompletePricingRuleSnapshot ? state.llmLongContextOutputCost : null,
    transcriptionMinimumBillableSeconds: hasCompletePricingRuleSnapshot ? state.transcriptionMinimumBillableSeconds : 0,
    transcriptionRoundingSeconds: hasCompletePricingRuleSnapshot ? state.transcriptionRoundingSeconds : 0,
  };
}

export interface Calculator {
  state: CalculatorState;
  results: CalculatorResults;
  updateValue: (key: EditableCalculatorStateKey, value: number) => void;
  updateProvider: (type: "llm" | "stt" | "tts", providerId: string) => void;
  resetToDefaults: () => void;
  llmProviders: LLMProvider[];
  sttProviders: STTProvider[];
  ttsProviders: TTSProvider[];
  isLoading: boolean;
  isSharedView: boolean;
  sharedCatalogVerifiedAt: string | null;
}

export function useCalculator(): Calculator {
  const [sharedPayload] = useState(parseSharedPayload);
  const [state, setState] = useState<CalculatorState>(() => initialState(sharedPayload));
  const isSharedView = sharedPayload !== null;
  const results = useMemo(() => calculateResults(state), [state]);

  const updateValue = (key: EditableCalculatorStateKey, value: number) => {
    if (isSharedView || !Number.isFinite(value)) return;
    setState((previous) => normalizeCalculatorState({ ...previous, [key]: value }));
  };

  const updateProvider = (type: "llm" | "stt" | "tts", id: string) => {
    if (isSharedView) return;
    if (type === "llm") {
      const provider = llmProviders.find((candidate) => candidate.id === id);
      if (provider) setState((previous) => ({
        ...previous,
        selectedLLMProvider: id,
        llmInputCost: provider.inputCost,
        llmOutputCost: provider.outputCost,
        llmContextThresholdTokens: provider.contextThresholdTokens ?? null,
        llmLongContextInputCost: provider.longContextInputCostPerMillion !== undefined ? provider.longContextInputCostPerMillion / 1_000_000 : null,
        llmLongContextOutputCost: provider.longContextOutputCostPerMillion !== undefined ? provider.longContextOutputCostPerMillion / 1_000_000 : null,
      }));
    } else if (type === "stt") {
      const provider = sttProviders.find((candidate) => candidate.id === id);
      if (provider) setState((previous) => ({
        ...previous,
        selectedSTTProvider: id,
        transcriptionCost: provider.costPerMinute,
        transcriptionMinimumBillableSeconds: provider.minimumBillableSeconds ?? 0,
        transcriptionRoundingSeconds: provider.roundingSeconds ?? 0,
      }));
    } else {
      const provider = ttsProviders.find((candidate) => candidate.id === id);
      if (provider) setState((previous) => ({ ...previous, selectedTTSProvider: id, voiceCost: provider.costPerCharacter }));
    }
  };

  return {
    state,
    results,
    updateValue,
    updateProvider,
    resetToDefaults: () => !isSharedView && setState(DEFAULT_STATE),
    llmProviders,
    sttProviders,
    ttsProviders,
    isLoading: false,
    isSharedView,
    sharedCatalogVerifiedAt: normalizeSharedCatalogVerifiedAt(sharedPayload?.catalogVerifiedAt),
  };
}
