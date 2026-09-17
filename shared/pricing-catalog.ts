import {
  PRICING_VERIFIED_DATE,
  type LLMCatalogRecord,
  type LLMProvider,
  type STTCatalogRecord,
  type TTSCatalogRecord,
  type TTSProvider,
} from "./providers";

const verified = PRICING_VERIFIED_DATE;

export const llmCatalog: LLMCatalogRecord[] = [
  {
    id: "openai_gpt_5_6_sol", name: "GPT-5.6 Sol", modelId: "gpt-5.6-sol", provider: "OpenAI", pricingHost: "OpenAI API",
    description: "Frontier GPT-5.6 tier.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 5, outputCostPerMillion: 30, cachedInputCostPerMillion: 0.5, contextThresholdTokens: 272000,
    longContextInputCostPerMillion: 10, longContextOutputCostPerMillion: 45, sourceUrl: "https://openai.com/index/gpt-5-6/", lastVerified: verified, calculatorEligible: true,
    notes: ["Prompts over 272K tokens price the full request at 2x input and 1.5x output.", "Cache writes are 1.25x the uncached input price."],
  },
  {
    id: "openai_gpt_5_6_terra", name: "GPT-5.6 Terra", modelId: "gpt-5.6-terra", provider: "OpenAI", pricingHost: "OpenAI API",
    description: "Balanced GPT-5.6 tier.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 2.5, outputCostPerMillion: 15, cachedInputCostPerMillion: 0.25, contextThresholdTokens: 272000,
    longContextInputCostPerMillion: 5, longContextOutputCostPerMillion: 22.5, sourceUrl: "https://openai.com/index/gpt-5-6/", lastVerified: verified, calculatorEligible: true,
    notes: ["Prompts over 272K tokens use long-context pricing.", "Cache writes are 1.25x the uncached input price."],
  },
  {
    id: "openai_gpt_5_6_luna", name: "GPT-5.6 Luna", modelId: "gpt-5.6-luna", provider: "OpenAI", pricingHost: "OpenAI API",
    description: "Economical GPT-5.6 tier.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 1, outputCostPerMillion: 6, cachedInputCostPerMillion: 0.1, contextThresholdTokens: 272000,
    longContextInputCostPerMillion: 2, longContextOutputCostPerMillion: 9, sourceUrl: "https://openai.com/index/gpt-5-6/", lastVerified: verified, calculatorEligible: true,
    notes: ["Prompts over 272K tokens use long-context pricing.", "Cache writes are 1.25x the uncached input price."],
  },
  {
    id: "openai_gpt_5_4_nano", name: "GPT-5.4 nano", modelId: "gpt-5.4-nano", provider: "OpenAI", pricingHost: "OpenAI API",
    description: "Low-cost GPT-5.4 tier for high-volume workloads.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 0.2, outputCostPerMillion: 1.25, cachedInputCostPerMillion: 0.02,
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-5.4-nano", lastVerified: verified, calculatorEligible: true,
    notes: ["Standard API pricing; batch and priority processing prices are excluded."],
  },
  {
    id: "openai_gpt_5_4_mini", name: "GPT-5.4 mini", modelId: "gpt-5.4-mini", provider: "OpenAI", pricingHost: "OpenAI API",
    description: "Balanced lower-cost GPT-5.4 model.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 0.75, outputCostPerMillion: 4.5, cachedInputCostPerMillion: 0.075,
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-5.4-mini", lastVerified: verified, calculatorEligible: true,
    notes: ["Standard API pricing; batch and priority processing prices are excluded."],
  },
  {
    id: "openai_gpt_4_1_mini", name: "GPT-4.1 mini", modelId: "gpt-4.1-mini", provider: "OpenAI", pricingHost: "OpenAI API",
    description: "Older-generation small GPT model that remains available.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 0.4, outputCostPerMillion: 1.6, cachedInputCostPerMillion: 0.1,
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-4.1-mini", lastVerified: verified, calculatorEligible: true,
    notes: ["OpenAI recommends newer small models for more complex tasks."],
  },
  {
    id: "openai_gpt_4o_mini", name: "GPT-4o mini", modelId: "gpt-4o-mini", provider: "OpenAI", pricingHost: "OpenAI API",
    description: "Older-generation, low-cost OpenAI model that remains active.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 0.15, outputCostPerMillion: 0.6, cachedInputCostPerMillion: 0.075, sourceUrl: "https://developers.openai.com/api/docs/models/gpt-4o-mini", lastVerified: verified, calculatorEligible: true,
    notes: ["Active, but no longer OpenAI's current generation."],
  },
  {
    id: "google_gemini_3_6_flash", name: "Gemini 3.6 Flash", modelId: "gemini-3.6-flash", provider: "Google", pricingHost: "Google Gemini API",
    description: "Current general-purpose Gemini Flash model.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 1.5, outputCostPerMillion: 7.5, cachedInputCostPerMillion: 0.15, sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing", lastVerified: verified, calculatorEligible: true,
    notes: ["Output price includes thinking tokens.", "Cache storage is charged separately at $1 per million tokens per hour."],
  },
  {
    id: "google_gemini_3_5_flash_lite", name: "Gemini 3.5 Flash-Lite", modelId: "gemini-3.5-flash-lite", provider: "Google", pricingHost: "Google Gemini API",
    description: "Lower-cost current Gemini tier.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 0.3, outputCostPerMillion: 2.5, cachedInputCostPerMillion: 0.03, sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing", lastVerified: verified, calculatorEligible: true,
    notes: ["Output price includes thinking tokens.", "Cached-content storage costs $1 per million tokens per hour.", "Batch/Flex pricing is lower and is not used here."],
  },
  {
    id: "google_gemini_3_1_pro_preview", name: "Gemini 3.1 Pro Preview", modelId: "gemini-3.1-pro-preview", provider: "Google", pricingHost: "Google Gemini API",
    description: "Preview Pro model; base rate applies through 200K input tokens.", status: "preview", tier: "standard <=200K", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 2, outputCostPerMillion: 12, cachedInputCostPerMillion: 0.2, contextThresholdTokens: 200000,
    longContextInputCostPerMillion: 4, longContextOutputCostPerMillion: 18, sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing", lastVerified: verified, calculatorEligible: true,
    notes: ["Preview model.", "Prompts over 200K tokens use the long-context rate.", "Cached-content storage costs $4.50 per million tokens per hour."],
  },
  {
    id: "anthropic_claude_sonnet_5", name: "Claude Sonnet 5", modelId: "claude-sonnet-5", provider: "Anthropic", pricingHost: "Anthropic API",
    description: "Current Sonnet model at an introductory list price.", status: "active", tier: "introductory standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 2, outputCostPerMillion: 10, cachedInputCostPerMillion: 0.2, effectiveUntil: "2026-08-31",
    sourceUrl: "https://platform.claude.com/docs/en/about-claude/pricing", lastVerified: verified, calculatorEligible: true,
    notes: ["Introductory price ends August 31, 2026; then base pricing becomes $3 input / $15 output per million tokens.", "The newer tokenizer can yield different token counts than older Claude models."],
  },
  {
    id: "anthropic_claude_fable_5", name: "Claude Fable 5", modelId: "claude-fable-5", provider: "Anthropic", pricingHost: "Anthropic API",
    description: "Current long-context Claude model with a full one-million-token context window.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 10, outputCostPerMillion: 50, cachedInputCostPerMillion: 1,
    sourceUrl: "https://platform.claude.com/docs/en/about-claude/pricing", lastVerified: verified, calculatorEligible: true,
    notes: ["Five-minute cache writes cost $12.50/M tokens and one-hour cache writes cost $20/M tokens.", "The full one-million-token context window uses the same base input and output rates."],
  },
  {
    id: "anthropic_claude_opus_4_8", name: "Claude Opus 4.8", modelId: "claude-opus-4-8", provider: "Anthropic", pricingHost: "Anthropic API",
    description: "Current high-capability Opus tier.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 5, outputCostPerMillion: 25, cachedInputCostPerMillion: 0.5, sourceUrl: "https://platform.claude.com/docs/en/about-claude/pricing", lastVerified: verified, calculatorEligible: true,
    notes: ["Optional fast mode costs $10 input / $50 output per million and is excluded."],
  },
  {
    id: "anthropic_claude_haiku_4_5", name: "Claude Haiku 4.5", modelId: "claude-haiku-4-5", provider: "Anthropic", pricingHost: "Anthropic API",
    description: "Current low-cost Claude tier.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 1, outputCostPerMillion: 5, cachedInputCostPerMillion: 0.1, sourceUrl: "https://platform.claude.com/docs/en/about-claude/pricing", lastVerified: verified, calculatorEligible: true,
    notes: ["Batch pricing and cache-write charges are excluded."],
  },
  {
    id: "deepseek_v4_flash", name: "DeepSeek V4 Flash", modelId: "deepseek-v4-flash", provider: "DeepSeek", pricingHost: "DeepSeek API",
    description: "Current low-cost DeepSeek API model.", status: "active", tier: "cache-miss", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 0.14, outputCostPerMillion: 0.28, cachedInputCostPerMillion: 0.0028, sourceUrl: "https://api-docs.deepseek.com/quick_start/pricing/", lastVerified: verified, calculatorEligible: true,
    notes: ["Uses the conservative cache-miss input rate.", "Thinking and non-thinking modes share this rate."],
  },
  {
    id: "deepseek_v4_pro", name: "DeepSeek V4 Pro", modelId: "deepseek-v4-pro", provider: "DeepSeek", pricingHost: "DeepSeek API",
    description: "Current higher-capability DeepSeek API model.", status: "active", tier: "cache-miss", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 0.435, outputCostPerMillion: 0.87, cachedInputCostPerMillion: 0.003625, sourceUrl: "https://api-docs.deepseek.com/quick_start/pricing/", lastVerified: verified, calculatorEligible: true,
    notes: ["Uses the conservative cache-miss input rate."],
  },
  {
    id: "mistral_small_4", name: "Mistral Small 4", modelId: "mistral-small-latest", provider: "Mistral", pricingHost: "Mistral API",
    description: "Current economical Mistral model.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 0.15, outputCostPerMillion: 0.6, cachedInputCostPerMillion: 0.015, sourceUrl: "https://mistral.ai/pricing/api/", lastVerified: verified, calculatorEligible: true,
    notes: ["Batch is 50% off and excluded from this real-time comparison."],
  },
  {
    id: "mistral_large_3", name: "Mistral Large 3", modelId: "mistral-large-2512", provider: "Mistral", pricingHost: "Mistral API",
    description: "Current large Mistral model.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 0.5, outputCostPerMillion: 1.5, cachedInputCostPerMillion: 0.05, sourceUrl: "https://mistral.ai/pricing/api/", lastVerified: verified, calculatorEligible: true,
    notes: ["Pinned model ID shown; the latest alias can move."],
  },
  {
    id: "mistral_medium_3_5", name: "Mistral Medium 3.5", modelId: "mistral-medium-latest", provider: "Mistral", pricingHost: "Mistral API",
    description: "Current medium Mistral tier.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 1.5, outputCostPerMillion: 7.5, cachedInputCostPerMillion: 0.15, sourceUrl: "https://mistral.ai/pricing/api/", lastVerified: verified, calculatorEligible: true,
    notes: ["Batch is 50% off and excluded."],
  },
  {
    id: "amazon_nova_2_lite_global", name: "Nova 2 Lite", modelId: "global.amazon.nova-2-lite-v1:0", provider: "Amazon", pricingHost: "Amazon Bedrock",
    description: "Current Nova model using Global cross-region Standard routing.", status: "active", tier: "global cross-region standard", region: "Global", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 0.3, outputCostPerMillion: 2.5, cachedInputCostPerMillion: 0.075, sourceUrl: "https://aws.amazon.com/bedrock/pricing/", lastVerified: verified, calculatorEligible: true,
    notes: ["US East regional routing is 10% higher at $0.33/$2.75 per million tokens.", "Inference profile and region affect price."],
  },
  {
    id: "xai_grok_4_5", name: "Grok 4.5", modelId: "grok-4.5", provider: "xAI", pricingHost: "xAI API",
    description: "Current Grok flagship; base rate applies through 200K input tokens.", status: "active", tier: "standard <=200K", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 2, outputCostPerMillion: 6, cachedInputCostPerMillion: 0.3, contextThresholdTokens: 200000,
    longContextInputCostPerMillion: 4, longContextOutputCostPerMillion: 12, sourceUrl: "https://docs.x.ai/developers/pricing", lastVerified: verified, calculatorEligible: true,
    notes: ["Prompts over 200K tokens use the long-context rate.", "Regional availability can vary."],
  },
  {
    id: "xai_grok_4_3", name: "Grok 4.3", modelId: "grok-4.3", provider: "xAI", pricingHost: "xAI API",
    description: "Current lower-cost Grok model; base rate applies through 200K input tokens.", status: "active", tier: "standard <=200K", currency: "USD", priceQualifier: "list", billingMetric: "tokens",
    inputCostPerMillion: 1.25, outputCostPerMillion: 2.5, cachedInputCostPerMillion: 0.2, contextThresholdTokens: 200000,
    longContextInputCostPerMillion: 2.5, longContextOutputCostPerMillion: 5,
    sourceUrl: "https://docs.x.ai/developers/models/grok-4.3", lastVerified: verified, calculatorEligible: true,
    notes: ["Requests above 200K input tokens cost $2.50 input / $5 output per million tokens.", "Long-context cached input is $0.40/M tokens."],
  },
  {
    id: "meta_host_required", name: "Hosted Llama (host required)", modelId: null, provider: "Meta", pricingHost: "No universal host",
    description: "Meta publishes model weights, not one universal hosted inference tariff.", status: "variable", tier: "host-dependent", currency: "USD", priceQualifier: "unavailable", billingMetric: "tokens",
    inputCostPerMillion: null, outputCostPerMillion: null, sourceUrl: "https://ai.meta.com/llama", lastVerified: verified, calculatorEligible: false,
    notes: ["Choose a specific host, exact Llama model, region, and SKU before comparing price."],
  },
];

export const sttCatalog: STTCatalogRecord[] = [
  {
    id: "gradium_stt_xs_overage", name: "Gradium STT — XS overage", modelId: null, provider: "Gradium", pricingHost: "Gradium API",
    description: "Real-time streaming speech-to-text with semantic turn detection for voice agents.", status: "active", tier: "XS overage", currency: "USD", priceQualifier: "overage", billingMetric: "audio_minute", mode: "streaming", costPerMinute: 0.01242,
    sourceUrl: "https://gradium.ai/pricing", lastVerified: "2026-09-17", calculatorEligible: false,
    notes: ["XS costs $13/month and includes 225,000 credits shared across services.", "Additional 100,000 credits cost $6.90 on XS. STT consumes 3 credits/second: $6.90 / 100,000 × 180 = $0.01242/minute of additional usage.", "This is an overage rate, not a standalone pay-as-you-go tariff; subscription minimums and included credits are not modeled by the calculator.", "Documentation: https://docs.gradium.ai/guides/speech-to-text-overview"],
  },
  {
    id: "openai_gpt_4o_transcribe", name: "GPT-4o Transcribe", modelId: "gpt-4o-transcribe", provider: "OpenAI", pricingHost: "OpenAI API",
    description: "Current token-billed transcription model.", status: "active", tier: "standard", currency: "USD", priceQualifier: "unavailable", billingMetric: "audio_tokens", mode: "pre-recorded", costPerMinute: null,
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-4o-transcribe", lastVerified: verified, calculatorEligible: false,
    notes: ["Billed at $2.50/M audio input tokens and $10/M text output tokens; no exact fixed minute rate."],
  },
  {
    id: "openai_gpt_4o_mini_transcribe", name: "GPT-4o mini Transcribe", modelId: "gpt-4o-mini-transcribe", provider: "OpenAI", pricingHost: "OpenAI API",
    description: "Lower-cost current token-billed transcription model.", status: "active", tier: "standard", currency: "USD", priceQualifier: "unavailable", billingMetric: "audio_tokens", mode: "pre-recorded", costPerMinute: null,
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-4o-mini-transcribe", lastVerified: verified, calculatorEligible: false,
    notes: ["Billed at $1.25/M audio input tokens and $5/M text output tokens; no exact fixed minute rate."],
  },
  {
    id: "openai_gpt_4o_transcribe_diarize", name: "GPT-4o Transcribe Diarize", modelId: "gpt-4o-transcribe-diarize", provider: "OpenAI", pricingHost: "OpenAI API",
    description: "Current token-billed transcription model with speaker labels.", status: "active", tier: "standard", currency: "USD", priceQualifier: "unavailable", billingMetric: "audio_tokens", mode: "pre-recorded", costPerMinute: null,
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-4o-transcribe-diarize", lastVerified: verified, calculatorEligible: false,
    notes: ["Billed at $2.50/M audio input tokens and $10/M text output tokens; no exact fixed minute rate.", "Inputs over 30 seconds require chunking and supported response formats."],
  },
  {
    id: "openai_whisper_1", name: "Whisper", modelId: "whisper-1", provider: "OpenAI", pricingHost: "OpenAI API",
    description: "Older-generation fixed-minute OpenAI transcription model that remains available.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "audio_minute", mode: "pre-recorded", costPerMinute: 0.006,
    sourceUrl: "https://developers.openai.com/api/docs/models/whisper-1", lastVerified: verified, calculatorEligible: true, notes: ["Fixed per-audio-minute price."],
  },
  {
    id: "openai_gpt_realtime_whisper", name: "GPT-Realtime-Whisper", modelId: "gpt-realtime-whisper", provider: "OpenAI", pricingHost: "OpenAI Realtime API",
    description: "Current realtime OpenAI transcription model.", status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "audio_minute", mode: "streaming", costPerMinute: 0.017,
    sourceUrl: "https://openai.com/index/advancing-voice-intelligence-with-new-models-in-the-api/", lastVerified: verified, calculatorEligible: true, notes: ["Realtime API only."],
  },
  {
    id: "sarvam_saaras_v3", name: "Saaras v3", modelId: "saaras:v3", provider: "Sarvam AI", pricingHost: "Sarvam API",
    description: "Current recommended Sarvam STT model.", status: "active", tier: "base", currency: "INR", priceQualifier: "list", billingMetric: "native_currency", mode: "pre-recorded", costPerMinute: null, nativeRate: 0.5, nativeUnit: "INR/audio minute", roundingSeconds: 1,
    sourceUrl: "https://docs.sarvam.ai/api/getting-started/pricing", lastVerified: verified, calculatorEligible: false, notes: ["₹30/hour, billed per second; a live FX rate is required for USD totals."],
  },
  {
    id: "sarvam_saaras_v3_diarization", name: "Saaras v3 + Diarization", modelId: "saaras:v3", provider: "Sarvam AI", pricingHost: "Sarvam API",
    description: "Current Saaras v3 batch transcription with speaker diarization.", status: "active", tier: "diarization", currency: "INR", priceQualifier: "list", billingMetric: "native_currency", mode: "batch", costPerMinute: null, nativeRate: 0.75, nativeUnit: "INR/audio minute", roundingSeconds: 1,
    sourceUrl: "https://docs.sarvam.ai/api/getting-started/pricing", lastVerified: verified, calculatorEligible: false, notes: ["₹45/hour, billed per second; a live FX rate is required for USD totals."],
  },
  {
    id: "google_chirp_3_standard", name: "Chirp 3", modelId: "chirp_3", provider: "Google", pricingHost: "Google Cloud Speech-to-Text",
    description: "Current flagship Google STT model at the first monthly tier.", status: "active", tier: "standard 0-500K min", currency: "USD", priceQualifier: "list", billingMetric: "audio_minute", mode: "streaming", costPerMinute: 0.016, roundingSeconds: 1,
    sourceUrl: "https://cloud.google.com/speech-to-text/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Marginal volume tiers fall to $0.004/min.", "Each channel is billed separately."],
  },
  {
    id: "google_chirp_3_dynamic_batch", name: "Chirp 3 — Dynamic Batch", modelId: "chirp_3", provider: "Google", pricingHost: "Google Cloud Speech-to-Text",
    description: "Lower-urgency dynamic batch recognition.", status: "active", tier: "dynamic batch", currency: "USD", priceQualifier: "list", billingMetric: "audio_minute", mode: "dynamic-batch", costPerMinute: 0.003, roundingSeconds: 1,
    sourceUrl: "https://cloud.google.com/speech-to-text/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Not a realtime voice-agent rate.", "Each channel is billed separately."],
  },
  {
    id: "elevenlabs_scribe_v2", name: "Scribe v2", modelId: "scribe_v2", provider: "ElevenLabs", pricingHost: "ElevenLabs API",
    description: "Current pre-recorded Scribe model.", status: "active", tier: "PAYG", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "pre-recorded", costPerMinute: 0.0036666667,
    sourceUrl: "https://elevenlabs.io/pricing/api?price.section=speech_to_text", lastVerified: verified, calculatorEligible: true, notes: ["Normalized from $0.22/hour; optional keyterm and entity add-ons excluded."],
  },
  {
    id: "elevenlabs_scribe_v2_realtime", name: "Scribe v2 Realtime", modelId: "scribe_v2_realtime", provider: "ElevenLabs", pricingHost: "ElevenLabs API",
    description: "Current realtime Scribe model.", status: "active", tier: "PAYG", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "streaming", costPerMinute: 0.0065,
    sourceUrl: "https://elevenlabs.io/pricing/api?price.section=speech_to_text", lastVerified: verified, calculatorEligible: true, notes: ["Normalized from $0.39/hour."],
  },
  {
    id: "aws_transcribe_batch_us_east_1", name: "Amazon Transcribe — Batch", modelId: null, provider: "AWS", pricingHost: "Amazon Transcribe",
    description: "Standard batch transcription in US East (N. Virginia).", status: "active", tier: "standard", region: "us-east-1", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "batch", costPerMinute: 0.006, minimumBillableSeconds: 15, roundingSeconds: 1,
    sourceUrl: "https://aws.amazon.com/transcribe/pricing/", lastVerified: verified, calculatorEligible: true, notes: ["Pricing operation: TranscribeAudio.", "15-second minimum per request.", "Region-specific; includes up to two channels."],
  },
  {
    id: "aws_transcribe_streaming_us_east_1", name: "Amazon Transcribe — Streaming", modelId: null, provider: "AWS", pricingHost: "Amazon Transcribe",
    description: "Standard streaming transcription in US East (N. Virginia).", status: "active", tier: "standard", region: "us-east-1", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "streaming", costPerMinute: 0.010002, minimumBillableSeconds: 15, roundingSeconds: 1,
    sourceUrl: "https://aws.amazon.com/transcribe/pricing/", lastVerified: verified, calculatorEligible: true, notes: ["Pricing operation: StreamingAudio.", "15-second minimum per request.", "Region-specific; includes up to two channels."],
  },
  {
    id: "deepgram_nova_3_mono_prerecorded", name: "Nova-3 Monolingual — Pre-recorded", modelId: "nova-3", provider: "Deepgram", pricingHost: "Deepgram API",
    description: "PAYG pre-recorded monolingual recognition.", status: "active", tier: "PAYG", currency: "USD", priceQualifier: "list", billingMetric: "audio_minute", mode: "pre-recorded", costPerMinute: 0.0077,
    sourceUrl: "https://deepgram.com/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Add-ons such as diarization and redaction cost extra."],
  },
  {
    id: "deepgram_nova_3_mono_streaming", name: "Nova-3 Monolingual — Streaming", modelId: "nova-3", provider: "Deepgram", pricingHost: "Deepgram API",
    description: "PAYG streaming monolingual recognition.", status: "active", tier: "PAYG promotional", currency: "USD", priceQualifier: "list", billingMetric: "audio_minute", mode: "streaming", costPerMinute: 0.0048,
    sourceUrl: "https://deepgram.com/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Official page labels this a limited-time promotional streaming rate."],
  },
  {
    id: "deepgram_nova_3_multilingual_prerecorded", name: "Nova-3 Multilingual — Pre-recorded", modelId: "nova-3", provider: "Deepgram", pricingHost: "Deepgram API",
    description: "PAYG pre-recorded multilingual recognition.", status: "active", tier: "PAYG", currency: "USD", priceQualifier: "list", billingMetric: "audio_minute", mode: "pre-recorded", costPerMinute: 0.0092,
    sourceUrl: "https://deepgram.com/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Multilingual mode; add-ons such as diarization and redaction cost extra."],
  },
  {
    id: "deepgram_nova_3_multilingual_streaming", name: "Nova-3 Multilingual — Streaming", modelId: "nova-3", provider: "Deepgram", pricingHost: "Deepgram API",
    description: "PAYG streaming multilingual recognition.", status: "active", tier: "PAYG promotional", currency: "USD", priceQualifier: "list", billingMetric: "audio_minute", mode: "streaming", costPerMinute: 0.0058,
    sourceUrl: "https://deepgram.com/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Official page labels this a limited-time promotional streaming rate."],
  },
  {
    id: "deepgram_flux_english", name: "Flux English", modelId: "flux-general-en", provider: "Deepgram", pricingHost: "Deepgram API",
    description: "Conversational streaming STT with turn detection.", status: "active", tier: "PAYG", currency: "USD", priceQualifier: "list", billingMetric: "audio_minute", mode: "streaming", costPerMinute: 0.0065,
    sourceUrl: "https://deepgram.com/pricing", lastVerified: verified, calculatorEligible: true, notes: ["English streaming rate; add-ons excluded."],
  },
  {
    id: "deepgram_flux_multilingual", name: "Flux Multilingual", modelId: null, provider: "Deepgram", pricingHost: "Deepgram API",
    description: "Conversational multilingual streaming STT with turn detection.", status: "active", tier: "PAYG", currency: "USD", priceQualifier: "list", billingMetric: "audio_minute", mode: "streaming", costPerMinute: 0.0078,
    sourceUrl: "https://deepgram.com/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Multilingual streaming rate; confirm the current callable model identifier in Deepgram's model documentation."],
  },
  {
    id: "mistral_voxtral_mini_transcribe_2_batch", name: "Voxtral Mini Transcribe 2 — Batch", modelId: "voxtral-mini-latest", provider: "Mistral", pricingHost: "Mistral API",
    description: "Batch transcription with the current Voxtral Mini Transcribe model.", status: "active", tier: "batch", currency: "USD", priceQualifier: "list", billingMetric: "audio_minute", mode: "batch", costPerMinute: 0.003,
    sourceUrl: "https://mistral.ai/pricing/api/", lastVerified: verified, calculatorEligible: true, notes: ["The latest alias can move; this batch API is excluded from the realtime selector."],
  },
  {
    id: "mistral_voxtral_mini_transcribe_realtime", name: "Voxtral Mini Transcribe Realtime", modelId: "voxtral-mini-transcribe-realtime-2602", provider: "Mistral", pricingHost: "Mistral API",
    description: "Low-latency realtime Voxtral transcription.", status: "active", tier: "realtime", currency: "USD", priceQualifier: "list", billingMetric: "audio_minute", mode: "streaming", costPerMinute: 0.006,
    sourceUrl: "https://mistral.ai/pricing/api/", lastVerified: verified, calculatorEligible: true, notes: ["Pinned February 2026 realtime model ID."],
  },
  {
    id: "azure_mai_transcribe_1_5_preview", name: "MAI-Transcribe-1.5", modelId: "mai-transcribe-1.5", provider: "Microsoft", pricingHost: "Microsoft Foundry",
    description: "Microsoft multilingual transcription model in public preview.", status: "preview", tier: "starts at", currency: "USD", priceQualifier: "starting_at", billingMetric: "audio_minute", mode: "pre-recorded", costPerMinute: 0.006,
    sourceUrl: "https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/new-mai-models-in-microsoft-foundry-across-text-image-voice-and-speech/4524632", lastVerified: verified, calculatorEligible: false, notes: ["Public pricing starts at $0.36 per audio hour; region and API surface can affect availability.", "Current model documentation is published in the Azure AI Speech MAI Transcribe guide."],
  },
  {
    id: "gladia_solaria_3_async", name: "Solaria-3 — Async", modelId: "solaria-3", provider: "Gladia", pricingHost: "Gladia API",
    description: "Current Solaria model for asynchronous transcription.", status: "active", tier: "Starter", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "pre-recorded", costPerMinute: 0.0101666667,
    sourceUrl: "https://www.gladia.io/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Normalized from $0.61/hour."],
  },
  {
    id: "gladia_solaria_3_realtime", name: "Solaria-3 — Realtime", modelId: "solaria-3", provider: "Gladia", pricingHost: "Gladia API",
    description: "Current Solaria model for realtime transcription.", status: "active", tier: "Starter", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "streaming", costPerMinute: 0.0125,
    sourceUrl: "https://www.gladia.io/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Normalized from $0.75/hour; live sessions are capped at three hours."],
  },
  {
    id: "assemblyai_universal_3_pro", name: "Universal-3 Pro", modelId: "universal-3-pro", provider: "AssemblyAI", pricingHost: "AssemblyAI API",
    description: "Current highest-accuracy pre-recorded AssemblyAI model.", status: "active", tier: "PAYG", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "pre-recorded", costPerMinute: 0.0035, roundingSeconds: 1,
    sourceUrl: "https://www.assemblyai.com/pricing/", lastVerified: verified, calculatorEligible: true, notes: ["Prompting and keyterms add $0.05/hour each."],
  },
  {
    id: "assemblyai_universal_2", name: "Universal-2", modelId: "universal-2", provider: "AssemblyAI", pricingHost: "AssemblyAI API",
    description: "Economical pre-recorded AssemblyAI model.", status: "active", tier: "PAYG", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "pre-recorded", costPerMinute: 0.0025, roundingSeconds: 1,
    sourceUrl: "https://www.assemblyai.com/pricing/", lastVerified: verified, calculatorEligible: true, notes: ["Diarization and multichannel usage can add cost."],
  },
  {
    id: "assemblyai_universal_streaming", name: "Universal-Streaming", modelId: "universal-streaming", provider: "AssemblyAI", pricingHost: "AssemblyAI API",
    description: "Current standard streaming model.", status: "active", tier: "PAYG", currency: "USD", priceQualifier: "normalized", billingMetric: "session_minute", mode: "streaming", costPerMinute: 0.0025,
    sourceUrl: "https://www.assemblyai.com/pricing/", lastVerified: verified, calculatorEligible: true, notes: ["Billed for the full connected session, including idle time."],
  },
  {
    id: "assemblyai_universal_3_pro_streaming", name: "Universal-3 Pro Streaming", modelId: "universal-3-pro-streaming", provider: "AssemblyAI", pricingHost: "AssemblyAI API",
    description: "Higher-accuracy streaming AssemblyAI model.", status: "active", tier: "PAYG", currency: "USD", priceQualifier: "normalized", billingMetric: "session_minute", mode: "streaming", costPerMinute: 0.0075,
    sourceUrl: "https://www.assemblyai.com/pricing/", lastVerified: verified, calculatorEligible: true, notes: ["Billed for the full connected session; optional diarization costs extra."],
  },
  {
    id: "speechmatics_melia_1_batch", name: "Melia 1 — Batch", modelId: "melia-1", provider: "Speechmatics", pricingHost: "Speechmatics API",
    description: "Current lower-cost batch model.", status: "active", tier: "Pro", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "batch", costPerMinute: 0.00215, roundingSeconds: 1,
    sourceUrl: "https://www.speechmatics.com/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Normalized from $0.129/hour."],
  },
  {
    id: "speechmatics_standard_batch", name: "Standard — Batch", modelId: "standard", provider: "Speechmatics", pricingHost: "Speechmatics API",
    description: "Standard batch recognition.", status: "active", tier: "Pro", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "batch", costPerMinute: 0.004, roundingSeconds: 1,
    sourceUrl: "https://www.speechmatics.com/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Normalized from $0.24/hour; billed to the second."],
  },
  {
    id: "speechmatics_enhanced_batch", name: "Enhanced — Batch", modelId: "enhanced", provider: "Speechmatics", pricingHost: "Speechmatics API",
    description: "Higher-accuracy batch recognition.", status: "active", tier: "Pro", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "batch", costPerMinute: 0.0066666667, roundingSeconds: 1,
    sourceUrl: "https://www.speechmatics.com/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Normalized from $0.40/hour; billed to the second."],
  },
  {
    id: "speechmatics_standard_realtime", name: "Standard — Realtime", modelId: "standard", provider: "Speechmatics", pricingHost: "Speechmatics API",
    description: "Standard realtime recognition.", status: "active", tier: "Pro", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "streaming", costPerMinute: 0.004, roundingSeconds: 1,
    sourceUrl: "https://www.speechmatics.com/pricing", lastVerified: verified, calculatorEligible: true, notes: ["A 20% discount applies above 500 hours per model/mode/month."],
  },
  {
    id: "speechmatics_enhanced_realtime", name: "Enhanced — Realtime", modelId: "enhanced", provider: "Speechmatics", pricingHost: "Speechmatics API",
    description: "Higher-accuracy realtime recognition.", status: "active", tier: "Pro", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "streaming", costPerMinute: 0.0071666667, roundingSeconds: 1,
    sourceUrl: "https://www.speechmatics.com/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Normalized from $0.43/hour."],
  },
  {
    id: "fal_scribe_v2", name: "Scribe v2 on fal", modelId: "fal-ai/elevenlabs/speech-to-text/scribe-v2", provider: "fal.ai", pricingHost: "fal.ai",
    description: "ElevenLabs Scribe v2 served through fal.ai.", status: "active", tier: "PAYG", currency: "USD", priceQualifier: "list", billingMetric: "audio_minute", mode: "pre-recorded", costPerMinute: 0.008,
    sourceUrl: "https://fal.ai/models/fal-ai/elevenlabs/speech-to-text/scribe-v2", lastVerified: verified, calculatorEligible: true, notes: ["Keyterms add 30%."],
  },
  {
    id: "fal_canary_streaming", name: "Canary Streaming STT", modelId: "fal-ai/speech-to-text", provider: "fal.ai", pricingHost: "fal.ai",
    description: "Current Canary-based streaming transcription endpoint.", status: "active", tier: "PAYG", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "streaming", costPerMinute: 0.048,
    sourceUrl: "https://fal.ai/models/fal-ai/speech-to-text", lastVerified: verified, calculatorEligible: true, notes: ["Normalized from $0.0008 per second."],
  },
  {
    id: "fal_wizper_experimental", name: "Wizper — Experimental", modelId: "fal-ai/wizper", provider: "fal.ai", pricingHost: "fal.ai",
    description: "Experimental endpoint with no durable per-minute list price.", status: "variable", tier: "experimental", currency: "USD", priceQualifier: "unavailable", billingMetric: "audio_minute", mode: "pre-recorded", costPerMinute: null,
    sourceUrl: "https://fal.ai/models/fal-ai/wizper", lastVerified: verified, calculatorEligible: false, notes: ["The current page displays $0 per compute-second; do not treat that as a durable free commercial tariff."],
  },
  {
    id: "groq_whisper_large_v3_turbo", name: "Whisper Large V3 Turbo", modelId: "whisper-large-v3-turbo", provider: "Groq", pricingHost: "Groq API",
    description: "High-throughput Whisper transcription on Groq.", status: "active", tier: "synchronous", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "pre-recorded", costPerMinute: 0.0006666667, minimumBillableSeconds: 10,
    sourceUrl: "https://console.groq.com/docs/speech-to-text", lastVerified: verified, calculatorEligible: true, notes: ["Normalized from $0.04/hour; 10-second minimum per request.", "Batch is 50% cheaper and excluded."],
  },
  {
    id: "groq_whisper_large_v3", name: "Whisper Large V3", modelId: "whisper-large-v3", provider: "Groq", pricingHost: "Groq API",
    description: "Accuracy-oriented Whisper transcription on Groq.", status: "active", tier: "synchronous", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "pre-recorded", costPerMinute: 0.00185, minimumBillableSeconds: 10,
    sourceUrl: "https://console.groq.com/docs/model/whisper-large-v3", lastVerified: verified, calculatorEligible: true, notes: ["Normalized from $0.111/hour; 10-second minimum per request."],
  },
  {
    id: "groq_whisper_large_v3_turbo_batch", name: "Whisper Large V3 Turbo — Batch", modelId: "whisper-large-v3-turbo", provider: "Groq", pricingHost: "Groq Batch API",
    description: "Lower-urgency batch transcription on Groq.", status: "active", tier: "batch", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "batch", costPerMinute: 0.00033333335, minimumBillableSeconds: 10,
    sourceUrl: "https://console.groq.com/docs/batch", lastVerified: verified, calculatorEligible: true, notes: ["50% below the synchronous rate; 10-second minimum billable duration."],
  },
  {
    id: "groq_whisper_large_v3_batch", name: "Whisper Large V3 — Batch", modelId: "whisper-large-v3", provider: "Groq", pricingHost: "Groq Batch API",
    description: "Accuracy-oriented batch transcription on Groq.", status: "active", tier: "batch", currency: "USD", priceQualifier: "normalized", billingMetric: "audio_minute", mode: "batch", costPerMinute: 0.000925, minimumBillableSeconds: 10,
    sourceUrl: "https://console.groq.com/docs/batch", lastVerified: verified, calculatorEligible: true, notes: ["50% below the synchronous rate; 10-second minimum billable duration."],
  },
];

export const ttsCatalog: TTSCatalogRecord[] = [
  {
    id: "gradium_tts_xs_overage", name: "Gradium TTS — XS overage", modelId: null, provider: "Gradium", pricingHost: "Gradium API",
    description: "Real-time streaming text-to-speech with instant voice cloning and voice design from a text prompt.", status: "active", tier: "XS overage", currency: "USD", priceQualifier: "overage", billingMetric: "subscription_credits", costPerMillionCharacters: 69, monthlyCommitment: 13, includedCharacters: 225000,
    sourceUrl: "https://gradium.ai/pricing", lastVerified: "2026-09-17", calculatorEligible: false,
    notes: ["XS includes 225,000 credits shared across TTS, STT, and translation. The included character allowance assumes all credits are used for TTS.", "TTS consumes 1 credit/character; additional 100,000 credits cost $6.90 on XS, equivalent to $69/M additional characters.", "Higher subscription tiers have different allowances and overage rates. Free credits are for non-commercial use.", "Documentation: https://docs.gradium.ai/guides/text-to-speech-overview"],
  },
  {
    id: "openai_tts_1", name: "TTS-1", modelId: "tts-1", provider: "OpenAI", pricingHost: "OpenAI API", description: "Active realtime-optimized character-billed TTS model.",
    status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 15,
    sourceUrl: "https://developers.openai.com/api/docs/models/tts-1", lastVerified: verified, calculatorEligible: true, notes: ["Speech generation list price."],
  },
  {
    id: "openai_tts_1_hd", name: "TTS-1 HD", modelId: "tts-1-hd", provider: "OpenAI", pricingHost: "OpenAI API", description: "Higher-quality active OpenAI TTS option.",
    status: "active", tier: "HD", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 30,
    sourceUrl: "https://developers.openai.com/api/docs/models/tts-1", lastVerified: verified, calculatorEligible: true, notes: [],
  },
  {
    id: "openai_gpt_4o_mini_tts", name: "GPT-4o mini TTS", modelId: "gpt-4o-mini-tts", provider: "OpenAI", pricingHost: "OpenAI API", description: "Deprecated token- and audio-token-billed speech model.",
    status: "deprecated", tier: "standard", currency: "USD", priceQualifier: "unavailable", billingMetric: "tokens_and_audio", costPerMillionCharacters: null,
    sourceUrl: "https://developers.openai.com/api/docs/models/gpt-4o-mini-tts", lastVerified: verified, calculatorEligible: false, notes: ["No defensible fixed character price; billed at $0.60/M input text tokens plus $12/M output audio tokens."],
  },
  {
    id: "mistral_voxtral_mini_tts", name: "Voxtral Mini TTS", modelId: "voxtral-mini-tts-latest", provider: "Mistral", pricingHost: "Mistral API", description: "Current character-billed Voxtral speech synthesis model.",
    status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 16,
    sourceUrl: "https://mistral.ai/pricing/api/", lastVerified: verified, calculatorEligible: true, notes: ["The latest alias currently points to the Voxtral Mini TTS family; pin voxtral-mini-tts-2603 for immutable behavior."],
  },
  {
    id: "elevenlabs_flash_v2_5", name: "Flash v2.5", modelId: "eleven_flash_v2_5", provider: "ElevenLabs", pricingHost: "ElevenLabs API", description: "Current low-latency ElevenLabs model.",
    status: "active", tier: "API list", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 50,
    sourceUrl: "https://elevenlabs.io/pricing/api", lastVerified: verified, calculatorEligible: true, notes: ["Taxes and Shared Voice Library multipliers are excluded."],
  },
  {
    id: "elevenlabs_turbo_v2_5", name: "Turbo v2.5", modelId: "eleven_turbo_v2_5", provider: "ElevenLabs", pricingHost: "ElevenLabs API", description: "Current fast ElevenLabs model.",
    status: "active", tier: "API list", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 50,
    sourceUrl: "https://elevenlabs.io/pricing/api", lastVerified: verified, calculatorEligible: true, notes: ["Base public API list rate."],
  },
  {
    id: "elevenlabs_multilingual_v2", name: "Multilingual v2", modelId: "eleven_multilingual_v2", provider: "ElevenLabs", pricingHost: "ElevenLabs API", description: "Stable multilingual long-form model.",
    status: "active", tier: "API list", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 100,
    sourceUrl: "https://elevenlabs.io/pricing/api", lastVerified: verified, calculatorEligible: true, notes: ["Base v2/v3 public API price bucket."],
  },
  {
    id: "elevenlabs_v3", name: "Eleven v3", modelId: "eleven_v3", provider: "ElevenLabs", pricingHost: "ElevenLabs API", description: "Current expressive multilingual model.",
    status: "active", tier: "API list", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 100,
    sourceUrl: "https://elevenlabs.io/pricing/api", lastVerified: verified, calculatorEligible: true, notes: ["Base v2/v3 public API price bucket."],
  },
  {
    id: "cartesia_sonic_3_5_pro", name: "Sonic 3.5 — Pro plan", modelId: "sonic-3.5", provider: "Cartesia", pricingHost: "Cartesia API", description: "Current stable Sonic generation; effective rate assumes the full Pro allowance is used.",
    status: "active", tier: "Pro", currency: "USD", priceQualifier: "effective", billingMetric: "subscription_credits", costPerMillionCharacters: 50, monthlyCommitment: 5, includedCharacters: 100000,
    sourceUrl: "https://www.cartesia.ai/pricing", lastVerified: verified, calculatorEligible: false, notes: ["sonic-3.5 follows the latest stable snapshot; pin sonic-3.5-2026-05-04 when immutable behavior is required.", "Effective rate is subscription-derived, not universal PAYG."],
  },
  {
    id: "cartesia_sonic_3_5_startup", name: "Sonic 3.5 — Startup plan", modelId: "sonic-3.5", provider: "Cartesia", pricingHost: "Cartesia API", description: "Current stable Sonic generation at the Startup plan's full-allocation effective rate.",
    status: "active", tier: "Startup", currency: "USD", priceQualifier: "effective", billingMetric: "subscription_credits", costPerMillionCharacters: 39.2, monthlyCommitment: 49, includedCharacters: 1250000,
    sourceUrl: "https://www.cartesia.ai/pricing", lastVerified: verified, calculatorEligible: false, notes: ["sonic-3.5 follows stable snapshots; pin a dated snapshot when immutable behavior is required.", "Subscription-derived effective rate assumes full allowance use.", "Professional voice clones consume 1.5x credits."],
  },
  {
    id: "cartesia_sonic_3_5_scale", name: "Sonic 3.5 — Scale plan", modelId: "sonic-3.5", provider: "Cartesia", pricingHost: "Cartesia API", description: "Current stable Sonic generation at the Scale plan's full-allocation effective rate.",
    status: "active", tier: "Scale", currency: "USD", priceQualifier: "effective", billingMetric: "subscription_credits", costPerMillionCharacters: 37.375, monthlyCommitment: 299, includedCharacters: 8000000,
    sourceUrl: "https://www.cartesia.ai/pricing", lastVerified: verified, calculatorEligible: false, notes: ["sonic-3.5 follows stable snapshots; pin a dated snapshot when immutable behavior is required.", "Subscription-derived effective rate assumes the full 8M-credit allowance is used.", "Professional voice clones consume 1.5x credits."],
  },
  {
    id: "azure_standard_neural", name: "Azure Standard Neural", modelId: null, provider: "Microsoft", pricingHost: "Azure AI Speech", description: "Standard neural Azure speech synthesis.",
    status: "active", tier: "standard", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 15,
    sourceUrl: "https://azure.microsoft.com/en-us/pricing/details/speech/", lastVerified: verified, calculatorEligible: true, notes: ["Some Unicode characters count as two billable characters.", "Azure's retail price feed lists $15 per million characters for the global S1 Neural meter."],
  },
  {
    id: "azure_neural_hd", name: "Azure Neural HD / DragonHD", modelId: null, provider: "Microsoft", pricingHost: "Azure AI Speech", description: "Advanced high-definition Azure voices.",
    status: "active", tier: "HD", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 22,
    sourceUrl: "https://azure.microsoft.com/en-us/pricing/details/speech/", lastVerified: verified, calculatorEligible: true, notes: ["Voice and locale availability varies.", "Azure's retail price feed lists $22 per million Neural HD characters, effective March 1, 2026."],
  },
  {
    id: "azure_mai_voice_1_preview", name: "MAI-Voice-1", modelId: "MAI-Voice-1", provider: "Microsoft", pricingHost: "Microsoft Foundry", description: "Microsoft voice model in public preview.",
    status: "preview", tier: "starts at", currency: "USD", priceQualifier: "starting_at", billingMetric: "characters", costPerMillionCharacters: 22,
    sourceUrl: "https://learn.microsoft.com/en-us/azure/ai-services/speech-service/mai-voices", lastVerified: verified, calculatorEligible: false, notes: ["Public preview; price starts at the shown rate and region availability varies.", "MAI-Voice-2 extends this family but does not replace this listed model."],
  },
  {
    id: "azure_mai_voice_2_preview", name: "MAI-Voice-2", modelId: "MAI-Voice-2", provider: "Microsoft", pricingHost: "Microsoft Foundry", description: "Latest Microsoft voice model in public preview.",
    status: "preview", tier: "starts at", currency: "USD", priceQualifier: "starting_at", billingMetric: "characters", costPerMillionCharacters: 22,
    sourceUrl: "https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/new-mai-models-in-microsoft-foundry-across-text-image-voice-and-speech/4524632", lastVerified: verified, calculatorEligible: false, notes: ["Public preview; price starts at the shown rate and region availability varies.", "Microsoft's current MAI voices guide lists both MAI-Voice-1 and MAI-Voice-2."],
  },
  {
    id: "google_chirp_3_hd", name: "Chirp 3 HD", modelId: null, provider: "Google", pricingHost: "Google Cloud Text-to-Speech", description: "Current flagship character-billed Google Cloud TTS model family.",
    status: "active", tier: "standard after free allowance", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 30,
    sourceUrl: "https://cloud.google.com/text-to-speech/pricing", lastVerified: verified, calculatorEligible: true, notes: ["A callable voice ID includes locale and voice, for example en-US-Chirp3-HD-Kore.", "First 1M characters are free under the published allowance; calculator uses paid list price."],
  },
  {
    id: "google_wavenet_legacy", name: "WaveNet", modelId: null, provider: "Google", pricingHost: "Google Cloud Text-to-Speech", description: "Legacy Google TTS model.",
    status: "legacy", tier: "standard after free allowance", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 4,
    sourceUrl: "https://cloud.google.com/text-to-speech/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Google labels WaveNet a legacy model; first 4M characters have a published free allowance."],
  },
  {
    id: "google_studio_legacy", name: "Studio", modelId: null, provider: "Google", pricingHost: "Google Cloud Text-to-Speech", description: "Legacy premium Studio voices.",
    status: "legacy", tier: "standard after free allowance", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 160,
    sourceUrl: "https://cloud.google.com/text-to-speech/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Google labels Studio a legacy model."],
  },
  {
    id: "google_gemini_2_5_flash_tts", name: "Gemini 2.5 Flash TTS", modelId: "gemini-2.5-flash-tts", provider: "Google", pricingHost: "Google Cloud / Gemini API", description: "Compound text-token plus audio-token TTS model.",
    status: "active", tier: "standard", currency: "USD", priceQualifier: "unavailable", billingMetric: "tokens_and_audio", costPerMillionCharacters: null, inputTextCostPerMillionTokens: 0.5, outputAudioCostPerMillionTokens: 10, outputAudioCostPerMinute: 0.015,
    sourceUrl: "https://cloud.google.com/text-to-speech/pricing", lastVerified: verified, calculatorEligible: false, notes: ["Billed at $0.50/M text tokens plus $10/M audio tokens; audio output alone normalizes to $0.015/min, so no fixed character rate is defensible."],
  },
  {
    id: "google_gemini_2_5_flash_lite_tts_preview", name: "Gemini 2.5 Flash-Lite TTS", modelId: null, provider: "Google", pricingHost: "Google Cloud / Gemini API", description: "Preview compound text-token plus audio-token TTS model.",
    status: "preview", tier: "standard", currency: "USD", priceQualifier: "unavailable", billingMetric: "tokens_and_audio", costPerMillionCharacters: null, inputTextCostPerMillionTokens: 0.5, outputAudioCostPerMillionTokens: 10, outputAudioCostPerMinute: 0.015,
    sourceUrl: "https://cloud.google.com/text-to-speech/pricing", lastVerified: verified, calculatorEligible: false, notes: ["Billed at $0.50/M text tokens plus $10/M audio tokens; audio output alone normalizes to $0.015/min.", "No fixed character rate is defensible."],
  },
  {
    id: "google_gemini_3_1_flash_tts_preview", name: "Gemini 3.1 Flash TTS", modelId: null, provider: "Google", pricingHost: "Google Cloud / Gemini API", description: "Preview compound text-token plus audio-token TTS model.",
    status: "preview", tier: "standard", currency: "USD", priceQualifier: "unavailable", billingMetric: "tokens_and_audio", costPerMillionCharacters: null, inputTextCostPerMillionTokens: 1, outputAudioCostPerMillionTokens: 20, outputAudioCostPerMinute: 0.03,
    sourceUrl: "https://cloud.google.com/text-to-speech/pricing", lastVerified: verified, calculatorEligible: false, notes: ["Billed at $1/M text tokens plus $20/M audio tokens; audio output alone normalizes to $0.030/min.", "No fixed character rate is defensible."],
  },
  {
    id: "google_gemini_2_5_pro_tts", name: "Gemini 2.5 Pro TTS", modelId: null, provider: "Google", pricingHost: "Google Cloud / Gemini API", description: "Active compound text-token plus audio-token TTS model.",
    status: "active", tier: "standard", currency: "USD", priceQualifier: "unavailable", billingMetric: "tokens_and_audio", costPerMillionCharacters: null, inputTextCostPerMillionTokens: 1, outputAudioCostPerMillionTokens: 20, outputAudioCostPerMinute: 0.03,
    sourceUrl: "https://cloud.google.com/text-to-speech/pricing", lastVerified: verified, calculatorEligible: false, notes: ["Billed at $1/M text tokens plus $20/M audio tokens; audio output alone normalizes to $0.030/min.", "No fixed character rate is defensible."],
  },
  {
    id: "amazon_polly_standard", name: "Polly Standard", modelId: "standard", provider: "Amazon", pricingHost: "Amazon Polly", description: "Standard Amazon Polly engine.",
    status: "active", tier: "PAYG", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 4,
    sourceUrl: "https://aws.amazon.com/polly/pricing/", lastVerified: verified, calculatorEligible: true, notes: ["Commercial-region list price; GovCloud is higher."],
  },
  {
    id: "amazon_polly_neural", name: "Polly Neural", modelId: "neural", provider: "Amazon", pricingHost: "Amazon Polly", description: "Neural Amazon Polly engine.",
    status: "active", tier: "PAYG", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 16,
    sourceUrl: "https://aws.amazon.com/polly/pricing/", lastVerified: verified, calculatorEligible: true, notes: ["Free-tier allowances are excluded."],
  },
  {
    id: "amazon_polly_generative", name: "Polly Generative", modelId: "generative", provider: "Amazon", pricingHost: "Amazon Polly", description: "Generative Amazon Polly engine.",
    status: "active", tier: "PAYG", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 30,
    sourceUrl: "https://aws.amazon.com/polly/pricing/", lastVerified: verified, calculatorEligible: true, notes: ["Free-tier allowances are excluded."],
  },
  {
    id: "amazon_polly_long_form", name: "Polly Long-Form", modelId: "long-form", provider: "Amazon", pricingHost: "Amazon Polly", description: "Long-form Amazon Polly engine.",
    status: "active", tier: "PAYG", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 100,
    sourceUrl: "https://aws.amazon.com/polly/pricing/", lastVerified: verified, calculatorEligible: true, notes: ["Free-tier allowances are excluded."],
  },
  {
    id: "hume_octave_2_creator", name: "Octave 2 — Creator overage", modelId: null, provider: "Hume AI", pricingHost: "Hume API", description: "Octave 2 preview at the Creator plan overage rate.",
    status: "preview", tier: "Creator overage", currency: "USD", priceQualifier: "overage", billingMetric: "subscription_credits", costPerMillionCharacters: 150, monthlyCommitment: 14,
    sourceUrl: "https://www.hume.ai/pricing", lastVerified: verified, calculatorEligible: false, notes: ["The API uses version 2 plus a selected voice rather than an octave-2 model ID.", "Marginal overage price; $14/month plan fee and included usage make a standalone usage total misleading."],
  },
  {
    id: "hume_octave_2_pro", name: "Octave 2 — Pro overage", modelId: null, provider: "Hume AI", pricingHost: "Hume API", description: "Octave 2 preview at the Pro plan overage rate.",
    status: "preview", tier: "Pro overage", currency: "USD", priceQualifier: "overage", billingMetric: "subscription_credits", costPerMillionCharacters: 120, monthlyCommitment: 70,
    sourceUrl: "https://www.hume.ai/pricing", lastVerified: verified, calculatorEligible: false, notes: ["The API uses version 2 plus a selected voice.", "Marginal overage price; the $70 monthly plan and included usage are separate."],
  },
  {
    id: "hume_octave_2_scale", name: "Octave 2 — Scale overage", modelId: null, provider: "Hume AI", pricingHost: "Hume API", description: "Octave 2 preview at the Scale plan overage rate.",
    status: "preview", tier: "Scale overage", currency: "USD", priceQualifier: "overage", billingMetric: "subscription_credits", costPerMillionCharacters: 100, monthlyCommitment: 200,
    sourceUrl: "https://www.hume.ai/pricing", lastVerified: verified, calculatorEligible: false, notes: ["The API uses version 2 plus a selected voice.", "Marginal overage price; the $200 monthly plan and included usage are separate."],
  },
  {
    id: "hume_octave_2_business", name: "Octave 2 — Business overage", modelId: null, provider: "Hume AI", pricingHost: "Hume API", description: "Octave 2 preview at the Business plan overage rate.",
    status: "preview", tier: "Business overage", currency: "USD", priceQualifier: "overage", billingMetric: "subscription_credits", costPerMillionCharacters: 50, monthlyCommitment: 500,
    sourceUrl: "https://www.hume.ai/pricing", lastVerified: verified, calculatorEligible: false, notes: ["The API uses version 2 plus a selected voice.", "Marginal overage price; the $500 monthly plan and included usage are separate."],
  },
  {
    id: "deepgram_aura_2_payg", name: "Aura-2", modelId: null, provider: "Deepgram", pricingHost: "Deepgram API", description: "Current Aura voice family at PAYG list price.",
    status: "active", tier: "PAYG", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 30,
    sourceUrl: "https://deepgram.com/pricing", lastVerified: verified, calculatorEligible: true, notes: ["A callable model includes a voice, for example aura-2-thalia-en.", "Growth commitment price is $27/M characters and is excluded."],
  },
  {
    id: "deepgram_aura_1_payg", name: "Aura-1", modelId: null, provider: "Deepgram", pricingHost: "Deepgram API", description: "Earlier lower-cost Aura voice family that remains listed.",
    status: "active", tier: "PAYG", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 15,
    sourceUrl: "https://deepgram.com/pricing", lastVerified: verified, calculatorEligible: true, notes: ["A callable model must include a specific Aura-1 voice.", "Current pricing page still lists Aura-1."],
  },
  {
    id: "rime_coda_starter", name: "Coda", modelId: "coda", provider: "Rime", pricingHost: "Rime API", description: "Rime-recommended conversational model at the public Starter starting rate.",
    status: "active", tier: "Starter", currency: "USD", priceQualifier: "starting_at", billingMetric: "characters", costPerMillionCharacters: 50,
    sourceUrl: "https://rime.ai/pricing", lastVerified: verified, calculatorEligible: false, notes: ["Public price starts at this rate and is not a model-specific contractual quote."],
  },
  {
    id: "sarvam_bulbul_v3", name: "Bulbul v3", modelId: "bulbul:v3", provider: "Sarvam AI", pricingHost: "Sarvam API", description: "Latest Sarvam model with beta native-currency pricing.",
    status: "preview", tier: "beta", currency: "INR", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: null, nativeRate: 30, nativeUnit: "INR/10K characters",
    sourceUrl: "https://docs.sarvam.ai/api/getting-started/pricing", lastVerified: verified, calculatorEligible: false, notes: ["₹30/10K characters; use live FX for USD totals instead of a hard-coded conversion."],
  },
  {
    id: "replicate_kokoro_runtime", name: "Kokoro 82M community model", modelId: "alphanumericuser/kokoro-82m", provider: "Replicate", pricingHost: "Replicate", description: "Community model billed by runtime/run, not by character.",
    status: "variable", tier: "community runtime", currency: "USD", priceQualifier: "unavailable", billingMetric: "runtime", costPerMillionCharacters: null,
    sourceUrl: "https://replicate.com/alphanumericuser/kokoro-82m", lastVerified: verified, calculatorEligible: false, notes: ["About $0.020/run is shown, but runtime and input size vary; no fixed per-character rate is defensible."],
  },
  {
    id: "playai_dialog_discontinued", name: "PlayAI Dialog", modelId: "playai-tts", provider: "PlayAI", pricingHost: "Discontinued", description: "Former model whose direct surface is unavailable and hosted endpoint was shut down.",
    status: "discontinued", tier: "former", currency: "USD", priceQualifier: "unavailable", billingMetric: "characters", costPerMillionCharacters: null,
    sourceUrl: "https://console.groq.com/docs/deprecations", lastVerified: verified, calculatorEligible: false, notes: ["Groq shut down PlayAI TTS endpoints on December 31, 2025."],
  },
  {
    id: "groq_orpheus_english", name: "Orpheus English", modelId: "canopylabs/orpheus-v1-english", provider: "Groq / Canopy Labs", pricingHost: "Groq API", description: "Current English replacement for the former PlayAI endpoint.",
    status: "preview", tier: "PAYG", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 22,
    sourceUrl: "https://groq.com/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Groq documents this model as Preview.", "Hosted by Groq; model creator is Canopy Labs."],
  },
  {
    id: "groq_orpheus_arabic_saudi", name: "Orpheus Arabic Saudi", modelId: "canopylabs/orpheus-arabic-saudi", provider: "Groq / Canopy Labs", pricingHost: "Groq API", description: "Current Saudi Arabic Orpheus speech model.",
    status: "preview", tier: "PAYG", currency: "USD", priceQualifier: "list", billingMetric: "characters", costPerMillionCharacters: 40,
    sourceUrl: "https://groq.com/pricing", lastVerified: verified, calculatorEligible: true, notes: ["Groq documents this model as Preview.", "Hosted by Groq; model creator is Canopy Labs."],
  },
];

export const llmProviders: LLMProvider[] = llmCatalog
  .filter((record): record is LLMCatalogRecord & { inputCostPerMillion: number; outputCostPerMillion: number } =>
    record.calculatorEligible && record.inputCostPerMillion !== null && record.outputCostPerMillion !== null,
  )
  .map((record) => ({
    ...record,
    inputCost: record.inputCostPerMillion / 1_000_000,
    outputCost: record.outputCostPerMillion / 1_000_000,
  }));

export const sttProviders = sttCatalog.filter(
  (record): record is STTCatalogRecord & { costPerMinute: number } =>
    record.calculatorEligible && record.mode === "streaming" && record.costPerMinute !== null,
);

export const ttsProviders: TTSProvider[] = ttsCatalog
  .filter((record): record is TTSCatalogRecord & { costPerMillionCharacters: number } =>
    record.calculatorEligible &&
    record.billingMetric === "characters" &&
    record.currency === "USD" &&
    (record.priceQualifier === "list" || record.priceQualifier === "normalized") &&
    record.costPerMillionCharacters !== null,
  )
  .map((record) => ({ ...record, costPerCharacter: record.costPerMillionCharacters / 1_000_000 }));

export const pricingCatalog = {
  verifiedAt: PRICING_VERIFIED_DATE,
  llm: llmCatalog,
  stt: sttCatalog,
  tts: ttsCatalog,
};
