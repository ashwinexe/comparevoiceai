import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  llmCatalog,
  llmProviders,
  pricingCatalog,
  sttCatalog,
  sttProviders,
  ttsCatalog,
  ttsProviders,
} from "../shared/pricing-catalog.ts";
import {
  PRICING_VERIFIED_DATE,
  type PriceQualifier,
  type PricingRecordBase,
  type PricingStatus,
} from "../shared/providers.ts";
import { assertNoExpiredCalculatorPricing } from "../scripts/generate-static-content.ts";

const catalogRecords: PricingRecordBase[] = [
  ...llmCatalog,
  ...sttCatalog,
  ...ttsCatalog,
];

const validStatuses = new Set<PricingStatus>([
  "active",
  "preview",
  "legacy",
  "deprecated",
  "discontinued",
  "variable",
]);

const validPriceQualifiers = new Set<PriceQualifier>([
  "list",
  "normalized",
  "effective",
  "overage",
  "starting_at",
  "estimated",
  "unavailable",
]);

function recordById<T extends PricingRecordBase>(records: T[], id: string): T {
  const record = records.find((candidate) => candidate.id === id);
  assert.ok(record, `missing catalog record ${id}`);
  return record;
}

function assertPositiveFinite(value: number, label: string) {
  assert.ok(Number.isFinite(value), `${label} must be finite; received ${value}`);
  assert.ok(value > 0, `${label} must be positive; received ${value}`);
}

test("catalog has one globally unique stable ID per row", () => {
  assert.ok(catalogRecords.length > 0, "catalog must not be empty");

  const seen = new Map<string, string>();
  for (const record of catalogRecords) {
    assert.match(
      record.id,
      /^[a-z0-9]+(?:_[a-z0-9]+)*$/,
      `${record.name} has a non-stable ID: ${record.id}`,
    );
    assert.equal(
      seen.get(record.id),
      undefined,
      `duplicate catalog ID ${record.id} in ${seen.get(record.id)} and ${record.name}`,
    );
    seen.set(record.id, record.name);
  }
});

test("every row has an HTTPS source and the current verification date", () => {
  assert.equal(pricingCatalog.verifiedAt, PRICING_VERIFIED_DATE);
  assert.match(PRICING_VERIFIED_DATE, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(
    Number.isFinite(Date.parse(`${PRICING_VERIFIED_DATE}T00:00:00Z`)),
    "global verification date must be a real ISO date",
  );

  for (const record of catalogRecords) {
    assert.equal(
      record.lastVerified,
      PRICING_VERIFIED_DATE,
      `${record.id} has stale or inconsistent verification metadata`,
    );

    let source: URL;
    try {
      source = new URL(record.sourceUrl);
    } catch {
      assert.fail(`${record.id} has an invalid source URL: ${record.sourceUrl}`);
    }
    assert.equal(source.protocol, "https:", `${record.id} source must use HTTPS`);
    assert.ok(source.hostname.includes("."), `${record.id} source must have a public hostname`);
  }
});

test("lifecycle and calculator-eligibility metadata is internally consistent", () => {
  for (const record of catalogRecords) {
    assert.ok(validStatuses.has(record.status), `${record.id} has unknown status ${record.status}`);
    assert.ok(record.provider.trim(), `${record.id} is missing its model/service provider`);
    assert.ok(record.pricingHost.trim(), `${record.id} is missing its pricing host`);
    assert.ok(record.description.trim(), `${record.id} is missing a description`);
    assert.ok(record.tier.trim(), `${record.id} is missing a pricing tier`);
    assert.ok(record.currency.trim(), `${record.id} is missing a currency`);
    assert.ok(validPriceQualifiers.has(record.priceQualifier), `${record.id} has unknown qualifier ${record.priceQualifier}`);
    assert.ok(Array.isArray(record.notes), `${record.id} notes must be an array`);

    if (record.effectiveUntil !== undefined) {
      assert.match(record.effectiveUntil, /^\d{4}-\d{2}-\d{2}$/, `${record.id} has an invalid expiry`);
      assert.ok(
        Number.isFinite(Date.parse(`${record.effectiveUntil}T23:59:59Z`)),
        `${record.id} has a non-date expiry`,
      );
      assert.ok(
        record.effectiveUntil >= record.lastVerified,
        `${record.id} pricing expired before it was verified`,
      );
    }

    if (record.status === "deprecated" || record.status === "discontinued") {
      assert.equal(record.calculatorEligible, false, `${record.id} must not be selectable`);
    }

    if (record.priceQualifier === "unavailable") {
      assert.equal(record.calculatorEligible, false, `${record.id} has no usable price but is selectable`);
    }

    if (record.calculatorEligible) {
      assert.notEqual(record.status, "variable", `${record.id} has variable pricing but is selectable`);
    }
  }
});

test("LLM calculator prices are exact per-million normalizations", () => {
  assert.ok(llmProviders.length > 0);
  assert.equal(llmProviders.length, llmCatalog.filter((record) => record.calculatorEligible).length);

  for (const provider of llmProviders) {
    const inputPerMillion = provider.inputCostPerMillion;
    const outputPerMillion = provider.outputCostPerMillion;
    if (inputPerMillion === null || outputPerMillion === null) {
      assert.fail(`${provider.id} is selectable without complete LLM pricing`);
    }
    assertPositiveFinite(inputPerMillion, `${provider.id}.inputCostPerMillion`);
    assertPositiveFinite(outputPerMillion, `${provider.id}.outputCostPerMillion`);
    assert.equal(provider.inputCost, inputPerMillion / 1_000_000);
    assert.equal(provider.outputCost, outputPerMillion / 1_000_000);

    if (provider.cachedInputCostPerMillion !== undefined) {
      assertPositiveFinite(provider.cachedInputCostPerMillion, `${provider.id}.cachedInputCostPerMillion`);
      assert.ok(
        provider.cachedInputCostPerMillion <= inputPerMillion,
        `${provider.id} cached input exceeds uncached input`,
      );
    }

    if (provider.contextThresholdTokens !== undefined) {
      assertPositiveFinite(provider.contextThresholdTokens, `${provider.id}.contextThresholdTokens`);
      assertPositiveFinite(
        provider.longContextInputCostPerMillion ?? Number.NaN,
        `${provider.id}.longContextInputCostPerMillion`,
      );
      assertPositiveFinite(
        provider.longContextOutputCostPerMillion ?? Number.NaN,
        `${provider.id}.longContextOutputCostPerMillion`,
      );
    }
  }
});

test("STT and TTS selectors contain only calculable positive normalized rates", () => {
  assert.ok(sttProviders.length > 0);
  assert.ok(ttsProviders.length > 0);

  assert.equal(
    sttProviders.length,
    sttCatalog.filter((record) => record.calculatorEligible && record.mode === "streaming").length,
  );
  for (const provider of sttProviders) {
    assertPositiveFinite(provider.costPerMinute, `${provider.id}.costPerMinute`);
    assert.equal(provider.mode, "streaming", `${provider.id} is not suitable for a realtime voice-agent selector`);
  }

  assert.equal(
    ttsProviders.length,
    ttsCatalog.filter((record) =>
      record.calculatorEligible &&
      record.billingMetric === "characters" &&
      record.currency === "USD" &&
      (record.priceQualifier === "list" || record.priceQualifier === "normalized"),
    ).length,
  );
  for (const provider of ttsProviders) {
    const costPerMillionCharacters = provider.costPerMillionCharacters;
    if (costPerMillionCharacters === null) {
      assert.fail(`${provider.id} is selectable without a character price`);
    }
    assertPositiveFinite(costPerMillionCharacters, `${provider.id}.costPerMillionCharacters`);
    assert.equal(provider.billingMetric, "characters", `${provider.id} must use character billing`);
    assert.equal(provider.currency, "USD", `${provider.id} must have a fixed USD rate`);
    assert.ok(
      provider.priceQualifier === "list" || provider.priceQualifier === "normalized",
      `${provider.id} must have a fixed list or normalized price`,
    );
    assert.equal(
      provider.costPerCharacter,
      costPerMillionCharacters / 1_000_000,
      `${provider.id} character normalization drifted`,
    );
  }
});

test("verified disputed prices retain exact source-backed regression pins", () => {
  assert.deepEqual(
    [
      "hume_octave_2_creator",
      "hume_octave_2_pro",
      "hume_octave_2_scale",
      "hume_octave_2_business",
    ].map((id) => {
      const record = recordById(ttsCatalog, id);
      return [record.costPerMillionCharacters, record.priceQualifier, record.calculatorEligible];
    }),
    [
      [150, "overage", false],
      [120, "overage", false],
      [100, "overage", false],
      [50, "overage", false],
    ],
  );

  assert.equal(recordById(sttCatalog, "deepgram_nova_3_mono_prerecorded").costPerMinute, 0.0077);
  assert.equal(recordById(sttCatalog, "deepgram_nova_3_multilingual_prerecorded").costPerMinute, 0.0092);

  assert.equal(recordById(ttsCatalog, "azure_standard_neural").costPerMillionCharacters, 15);
  assert.equal(recordById(ttsCatalog, "azure_neural_hd").costPerMillionCharacters, 22);

  const grok43 = recordById(llmCatalog, "xai_grok_4_3");
  assert.deepEqual(
    {
      threshold: grok43.contextThresholdTokens,
      input: grok43.inputCostPerMillion,
      cached: grok43.cachedInputCostPerMillion,
      output: grok43.outputCostPerMillion,
      longInput: grok43.longContextInputCostPerMillion,
      longOutput: grok43.longContextOutputCostPerMillion,
      eligible: grok43.calculatorEligible,
    },
    {
      threshold: 200000,
      input: 1.25,
      cached: 0.2,
      output: 2.5,
      longInput: 2.5,
      longOutput: 5,
      eligible: true,
    },
  );

  assert.deepEqual(
    ["azure_mai_voice_1_preview", "azure_mai_voice_2_preview"].map((id) => {
      const record = recordById(ttsCatalog, id);
      return [record.modelId, record.status, record.costPerMillionCharacters, record.priceQualifier, record.calculatorEligible];
    }),
    [
      ["MAI-Voice-1", "preview", 22, "starting_at", false],
      ["MAI-Voice-2", "preview", 22, "starting_at", false],
    ],
  );

  // These audit suggestions were rejected after checking current primary sources.
  assert.equal(recordById(sttCatalog, "aws_transcribe_batch_us_east_1").costPerMinute, 0.006);
  assert.equal(recordById(sttCatalog, "aws_transcribe_streaming_us_east_1").costPerMinute, 0.010002);
  assert.deepEqual(
    {
      status: recordById(ttsCatalog, "openai_gpt_4o_mini_tts").status,
      eligible: recordById(ttsCatalog, "openai_gpt_4o_mini_tts").calculatorEligible,
    },
    { status: "deprecated", eligible: false },
  );
});

test("newly verified model coverage has exact IDs, rates, and lifecycle metadata", () => {
  assert.deepEqual(
    [
      "openai_gpt_5_4_nano",
      "openai_gpt_5_4_mini",
      "openai_gpt_4_1_mini",
      "anthropic_claude_fable_5",
    ].map((id) => {
      const record = recordById(llmCatalog, id);
      return [record.modelId, record.inputCostPerMillion, record.cachedInputCostPerMillion, record.outputCostPerMillion, record.status, record.calculatorEligible];
    }),
    [
      ["gpt-5.4-nano", 0.2, 0.02, 1.25, "active", true],
      ["gpt-5.4-mini", 0.75, 0.075, 4.5, "active", true],
      ["gpt-4.1-mini", 0.4, 0.1, 1.6, "active", true],
      ["claude-fable-5", 10, 1, 50, "active", true],
    ],
  );

  const voxtralBatch = recordById(sttCatalog, "mistral_voxtral_mini_transcribe_2_batch");
  assert.deepEqual(
    [voxtralBatch.modelId, voxtralBatch.mode, voxtralBatch.costPerMinute, voxtralBatch.status, voxtralBatch.calculatorEligible],
    ["voxtral-mini-latest", "batch", 0.003, "active", true],
  );

  const voxtralRealtime = recordById(sttCatalog, "mistral_voxtral_mini_transcribe_realtime");
  assert.deepEqual(
    [voxtralRealtime.modelId, voxtralRealtime.mode, voxtralRealtime.costPerMinute, voxtralRealtime.status, voxtralRealtime.calculatorEligible],
    ["voxtral-mini-transcribe-realtime-2602", "streaming", 0.006, "active", true],
  );

  const maiTranscribe = recordById(sttCatalog, "azure_mai_transcribe_1_5_preview");
  assert.deepEqual(
    [maiTranscribe.modelId, maiTranscribe.mode, maiTranscribe.costPerMinute, maiTranscribe.priceQualifier, maiTranscribe.status, maiTranscribe.calculatorEligible],
    ["mai-transcribe-1.5", "pre-recorded", 0.006, "starting_at", "preview", false],
  );

  const voxtralTts = recordById(ttsCatalog, "mistral_voxtral_mini_tts");
  assert.deepEqual(
    [voxtralTts.modelId, voxtralTts.billingMetric, voxtralTts.costPerMillionCharacters, voxtralTts.status, voxtralTts.calculatorEligible],
    ["voxtral-mini-tts-latest", "characters", 16, "active", true],
  );
});

test("new rows obey the realtime three-layer selector boundaries", () => {
  for (const id of [
    "openai_gpt_5_4_nano",
    "openai_gpt_5_4_mini",
    "openai_gpt_4_1_mini",
    "anthropic_claude_fable_5",
    "xai_grok_4_3",
  ]) {
    assert.equal(llmProviders.some((record) => record.id === id), true, `${id} missing from the LLM selector`);
  }

  assert.equal(sttProviders.some((record) => record.id === "mistral_voxtral_mini_transcribe_realtime"), true);
  assert.equal(sttProviders.some((record) => record.id === "mistral_voxtral_mini_transcribe_2_batch"), false);
  assert.equal(sttProviders.some((record) => record.id === "azure_mai_transcribe_1_5_preview"), false);

  assert.equal(ttsProviders.some((record) => record.id === "mistral_voxtral_mini_tts"), true);
  for (const id of ["azure_mai_voice_1_preview", "azure_mai_voice_2_preview", "hume_octave_2_creator", "openai_gpt_4o_mini_tts"]) {
    assert.equal(ttsProviders.some((record) => record.id === id), false, `${id} leaked into the TTS selector`);
  }
});

test("provider batch APIs retain a distinct batch mode", () => {
  const batchRows = sttCatalog.filter((record) =>
    /batch/i.test(`${record.name} ${record.description} ${record.tier}`),
  );

  assert.ok(batchRows.length >= 8, "catalog must retain the known batch and dynamic-batch rows");
  for (const record of batchRows) {
    assert.ok(record.mode.includes("batch"), `${record.id} is a batch API row with the wrong mode`);
    assert.equal(sttProviders.some((provider) => provider.id === record.id), false, `${record.id} leaked into the streaming selector`);
  }
});

test("static generation rejects expired calculator-eligible promotional pricing", () => {
  const expiring = llmCatalog.find((record) => record.effectiveUntil !== undefined);
  assert.ok(expiring?.effectiveUntil, "catalog must retain an expiring row to exercise the safeguard");

  const scopedCatalog = { llm: [expiring], stt: [], tts: [] };
  assert.doesNotThrow(() => assertNoExpiredCalculatorPricing(scopedCatalog, expiring.effectiveUntil));

  const dayAfterExpiry = new Date(`${expiring.effectiveUntil}T00:00:00Z`);
  dayAfterExpiry.setUTCDate(dayAfterExpiry.getUTCDate() + 1);
  assert.throws(
    () => assertNoExpiredCalculatorPricing(scopedCatalog, dayAfterExpiry.toISOString().slice(0, 10)),
    new RegExp(`${expiring.id} \\(expired ${expiring.effectiveUntil}\\)`),
  );

  assert.doesNotThrow(() =>
    assertNoExpiredCalculatorPricing(
      { llm: [{ ...expiring, calculatorEligible: false }], stt: [], tts: [] },
      dayAfterExpiry.toISOString().slice(0, 10),
    ),
  );
  assert.doesNotThrow(() => assertNoExpiredCalculatorPricing(pricingCatalog, PRICING_VERIFIED_DATE));
});

test("unpriced rows never leak into calculator provider arrays", () => {
  const selectableIds = new Set([
    ...llmProviders.map((record) => record.id),
    ...sttProviders.map((record) => record.id),
    ...ttsProviders.map((record) => record.id),
  ]);

  for (const record of catalogRecords) {
    if (!record.calculatorEligible) {
      assert.equal(selectableIds.has(record.id), false, `${record.id} leaked into a calculator selector`);
    }
  }
});

test("published static catalog is byte-for-data equivalent to the TypeScript source", async () => {
  const staticCatalogUrl = new URL("../client/public/data/pricing-catalog.json", import.meta.url);
  const staticCatalog = JSON.parse(await readFile(staticCatalogUrl, "utf8")) as unknown;
  assert.deepEqual(
    staticCatalog,
    pricingCatalog,
    "public pricing-catalog.json is stale; regenerate it from shared/pricing-catalog.ts",
  );
});
