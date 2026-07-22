export const PRICING_VERIFIED_DATE = "2026-07-22";

export type PricingStatus =
  | "active"
  | "preview"
  | "legacy"
  | "deprecated"
  | "discontinued"
  | "variable";

export type PriceQualifier =
  | "list"
  | "normalized"
  | "effective"
  | "overage"
  | "starting_at"
  | "estimated"
  | "unavailable";

export interface PricingRecordBase {
  id: string;
  name: string;
  modelId: string | null;
  provider: string;
  pricingHost: string;
  description: string;
  status: PricingStatus;
  tier: string;
  currency: string;
  priceQualifier: PriceQualifier;
  sourceUrl: string;
  lastVerified: string;
  calculatorEligible: boolean;
  notes: string[];
  effectiveUntil?: string;
  region?: string;
}

export interface LLMCatalogRecord extends PricingRecordBase {
  billingMetric: "tokens";
  inputCostPerMillion: number | null;
  outputCostPerMillion: number | null;
  cachedInputCostPerMillion?: number;
  contextThresholdTokens?: number;
  longContextInputCostPerMillion?: number;
  longContextOutputCostPerMillion?: number;
}

export interface LLMProvider extends LLMCatalogRecord {
  inputCost: number;
  outputCost: number;
}

export interface STTCatalogRecord extends PricingRecordBase {
  billingMetric: "audio_minute" | "session_minute" | "audio_tokens" | "native_currency";
  mode: "pre-recorded" | "streaming" | "batch" | "dynamic-batch";
  costPerMinute: number | null;
  minimumBillableSeconds?: number;
  roundingSeconds?: number;
  nativeRate?: number;
  nativeUnit?: string;
}

export type STTProvider = STTCatalogRecord;

export interface TTSCatalogRecord extends PricingRecordBase {
  billingMetric: "characters" | "subscription_credits" | "tokens_and_audio" | "runtime";
  costPerMillionCharacters: number | null;
  monthlyCommitment?: number;
  includedCharacters?: number;
  nativeRate?: number;
  nativeUnit?: string;
  inputTextCostPerMillionTokens?: number;
  outputAudioCostPerMillionTokens?: number;
  outputAudioCostPerMinute?: number;
}

export interface TTSProvider extends TTSCatalogRecord {
  costPerCharacter: number;
}
