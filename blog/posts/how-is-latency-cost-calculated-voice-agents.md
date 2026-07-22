---
title: "How Voice Agent Cost and Latency Are Calculated"
date: 2025-05-15
updated: 2026-07-22
description: "See the formulas and assumptions used to estimate voice-agent STT, LLM, TTS, infrastructure cost, and end-to-end latency."
tags: "cost, latency, llm, stt, tts"
author:
  name: "Nikhil R."
  bio: "Comparevoiceai.com"
---


Voice AI agents combine multiple AI components that work together to create natural-sounding conversations. But how much do these systems actually cost to operate, and what factors contribute to their responsiveness? This guide breaks down the calculation methods for both cost and latency, with real-world examples to help you understand the economics and performance of voice AI systems.

> **Pricing check (22 July 2026):** The worked example uses fixed-unit products where possible. Provider prices may also depend on mode, tier, region, channels, request rounding, caching, and long-context rules. Performance tables later in the article are a **May 2025 benchmark snapshot**.

You can simulate latency assumptions and check provider costs at [comparevoiceai.com](https://comparevoiceai.com).

![Compare voice model costs across providers](/blog/assets/comparecosts.png)

## The Voice AI Pipeline

Before diving into calculations, let's understand the basic components of a voice AI agent:

1. **Speech-to-Text (STT)**: Transcribes user's speech into text
2. **Large Language Model (LLM)**: Processes the text and generates a response
3. **Text-to-Speech (TTS)**: Converts the text response into speech

Each component adds to both cost and latency, and optimizing both requires understanding how they interact.

## How Voice AI Costs Are Calculated

### Transcription Cost

```
raw_seconds = conversation_length_minutes * 60
rounded_seconds = ceil(raw_seconds / rounding_increment_seconds) * rounding_increment_seconds
billable_seconds = max(rounded_seconds, request_minimum_seconds)
Transcription Cost ($) = transcription_cost_per_min * billable_seconds / 60
```

When a provider publishes no rounding increment or request minimum, `rounded_seconds` and `billable_seconds` are simply the actual duration. The calculator applies the selected row's rules to one configured call/session; if your application creates multiple separately billed requests, calculate each request separately and add the results. Session-minute products can also bill connected idle time, while some products bill only submitted audio.

**Example:** Using [OpenAI Whisper-1](https://developers.openai.com/api/docs/models/whisper-1) at $0.006 per minute for a 15-minute audio stream:
- $0.006 × 15 = $0.09

### LLM Costs

LLM costs are more complex because they involve both input and output tokens. In the calculator's deliberately conservative full-history-resend scenario, each request contains the current user segment plus all earlier user and assistant turns:

```
total_words = words_per_min * conversation_length
assistant_words = total_words * assistant_speech_ratio
user_words = total_words - assistant_words
user_tokens = user_words * tokens_per_word
assistant_spoken_tokens = assistant_words * tokens_per_word
turns = max(1, round(turns_per_min * conversation_length))

LLM Input Tokens = user_tokens * (turns + 1) / 2
                 + assistant_spoken_tokens * (turns - 1) / 2
                 + fixed_input_tokens_per_request * turns

LLM Output Tokens = assistant_spoken_tokens
                  + non_speech_output_tokens_per_request * turns
```

The arithmetic-series terms assume user and assistant tokens are distributed evenly across the rounded turns. The calculator prices each turn's input and output at the selected model's base or long-context rate, then sums the turns. This scenario does not model caching, summarization, retrieval, or provider-side token-count differences unless you add them through the fixed-input and non-speech-output assumptions. The worked example uses OpenAI GPT-5.6 Luna:

**Parameters:**
- Words per minute: 150
- Tokens per word: 1.3
- Turns per minute: 2 (back-and-forth exchanges)
- Conversation length: 15 minutes
- LLM speech ratio: 0.5 (the assistant produces half of the combined spoken words)
- Fixed input and non-speech output tokens per request: 0
- Input token cost: $0.000001 per token
- Output token cost: $0.000006 per token

**Input Tokens:**

- Total words: 150 × 15 = 2,250
- User words: 2,250 × (1 - 0.5) = 1,125, or 1,462.5 user tokens
- Assistant words: 2,250 × 0.5 = 1,125, or 1,462.5 assistant tokens
- Turns: round(2 × 15) = 30

```
1,462.5 × (30 + 1) / 2 + 1,462.5 × (30 - 1) / 2
= 22,668.75 + 21,206.25
= 43,875 input tokens
```

**Output Tokens:**
150 × 1.3 × 0.5 × 15 = 1,462.5 tokens

**LLM Cost:**
(43,875 × $0.000001) + (1,462.5 × $0.000006) = $0.043875 + $0.008775 = $0.05265

Under uninterrupted full-history resend, accumulated input can grow approximately quadratically as turns are added. It does not have to: trimming, summarization, retrieval, caching, or starting a new session changes the curve.

### Voice Generation Cost

```
Voice Cost ($) = voice_cost * words_per_min * chars_per_word * llm_speech_ratio * convo_length
```

**Example:** Using [OpenAI TTS-1](https://developers.openai.com/api/docs/models/tts-1) at $0.000015 per character:
- Billable characters per word: 5 (a scenario assumption that should include spaces and punctuation according to the provider's counting rules)
- Words per minute: 150
- LLM speech ratio: 0.5
- Conversation length: 15 minutes

**Voice Cost:**
$0.000015 × 150 × 5 × 0.5 × 15 = $0.000015 × 5,625 = $0.084375

### Hosting Cost

```
Hosting Cost ($) = (vcpu_cost * convo_length) / agents_per_vcpu
```

This accounts for the infrastructure running your agent.

**Example:**
- vCPU cost: $0.00007083 per minute
- Conversation length: 15 minutes
- Agents per vCPU: 10 (how many concurrent conversations one vCPU can handle)

**Hosting Cost:**
($0.00007083 × 15) / 10 = $0.00106 / 10 = $0.000106

### Total Cost and Cost Per Minute

```
Total Cost ($) = transcription_cost + llm_cost + voice_cost + hosting_cost
Cost Per Minute ($) = total_cost / convo_length
```

**Example total:**
$0.09 (transcription) + $0.05265 (LLM) + $0.084375 (voice) + $0.000106 (hosting) = $0.227131

**Cost per minute:**
$0.227131 / 15 = $0.01514 per minute

## How Latency is Calculated

Voice-to-voice latency represents the total time from when a user finishes speaking to when they hear the AI response. This is crucial for creating natural-feeling conversations.

```
Total Voice-to-Voice Latency (ms) = mic_input + opus_encoding + network + packet_handling + jitter_buffer + opus_decoding + transcription + llm_ttfb + sentence_aggregation + tts_ttfb + opus_encoding + packet_handling + network + jitter_buffer + opus_decoding + speaker_output
```

Here is one illustrative latency budget:

| Component | Duration (ms) | Description |
|-----------|---------------|-------------|
| **Input Path** | **114 ms** | **Capturing and sending user speech** |
| Mic Input | 40 ms | Time for operating system to process microphone input |
| Opus Encoding | 21 ms | Audio compression |
| Network Transit | 10 ms | Time to transfer audio packets to server |
| Packet Handling | 2 ms | Packet processing overhead |
| Jitter Buffer | 40 ms | Buffer to handle network variance |
| Opus Decoding | 1 ms | Audio decompression |
| **AI Processing** | **790 ms** | **Core AI inference pipeline** |
| Transcription & Endpointing | 300 ms | Converting speech to text and detecting end of utterance |
| LLM Inference (TTFT) | 350 ms | Time for LLM to process input and generate first token |
| Sentence Aggregation | 20 ms | Processing and assembling LLM output |
| Text-to-Speech (TTFT) | 120 ms | Converting text to initial audio |
| **Output Path** | **89 ms** | **Sending AI speech back to user** |
| Opus Encoding | 21 ms | Audio compression |
| Packet Handling | 2 ms | Packet processing overhead |
| Network Transit | 10 ms | Time to transfer audio packets to client |
| Jitter Buffer | 40 ms | Buffer to handle network variance |
| Opus Decoding | 1 ms | Audio decompression |
| Speaker Output | 15 ms | Time for operating system to process audio output |
| **Total Voice-to-Voice Latency** | **993 ms** | **End-to-end response time** |

This illustrative voice-to-voice path totals 993ms, just under one second. There is no universal target: acceptable latency depends on endpointing policy, task, language, turn length, user expectations, and the percentile measured. Benchmark the complete path under representative network and load conditions.

You can adjust the above latency figures and simulate the latency at [comparevoiceai.com](https://comparevoiceai.com)

![Compare voice model latency and simulate them](/blog/assets/latencybanner.png)


## Historical May 2025 Model Benchmark Snapshot

> **Historical benchmark note:** Accuracy, speed, TTFT, throughput, ELO, and latency figures in this section are a May 2025 snapshot. They are dataset- and environment-dependent and should not be treated as current provider guarantees.

### STT Model Performance

In the May 2025 evaluation snapshot, [Scribe](https://elevenlabs.io/speech-to-text) measured 7.7% WER, AssemblyAI Enhanced 8.1%, and Universal-2 8.6%. In that benchmark environment, Whisper Large v3 on Fireworks and Whisper Large v3 Turbo on Groq measured 259.7× and 252.2× real-time throughput. These results are not comparable across different datasets or deployment paths without retesting.

Those benchmark-era prices should not be treated as current quotes. fal.ai does not publish the old Wizper fixed-minute price; Groq currently lists Whisper Large v3 Turbo at $0.04/hour ($0.0006667/minute) with a 10-second minimum.

### LLM Performance

In the May 2025 snapshot, Google's Gemini 2.5 Flash measured 0.39s time-to-first-token (TTFT) and 268 tokens/s, GPT-4o measured about 0.55s TTFT and 117 tokens/s, and Claude 3.7 Sonnet measured about 0.5s TTFT. Those models and measurements are retained only as historical benchmark context.

Those LLM latency figures are historical. For current cost comparisons, use separate input/output rates such as GPT-5.6 Luna at $1/$6 per 1M tokens and Gemini 3.6 Flash at $1.50/$7.50, then apply the workload's actual token counts.

### TTS Model Performance

In the May 2025 snapshot, MiniMax Speech-02-HD scored 1165.8 ELO, OpenAI TTS-1 HD 1150.2, and OpenAI TTS-1 1135.1. The same snapshot measured Google WaveNet at 500 characters/second, Amazon Polly Long-form at 382, and ElevenLabs Flash v2.5 at 366. Treat both quality and throughput values as benchmark-specific historical results.

Replicate's community Kokoro model is runtime/run-priced, so the old `$0.65 per 1M characters` normalization is not a provider-published fixed character rate.

## Optimization Strategies

### Cost Optimization

1. **Context management:** Trim or summarize conversation history to prevent super-linear cost growth in longer sessions
2. **Token caching:** Evaluate provider-specific cache read, write, and storage charges for repeated prompt prefixes
3. **Provider selection:** Compare current models using actual input/output tokens, cache behavior, and quality requirements
4. **Multi-model approach:** Use specialized, smaller models for specific tasks rather than a single large model for everything

### Latency Optimization

1. **Service placement:** Keep application services near users and, for managed APIs, select compatible provider regions to reduce network transit
2. **LLM selection:** Benchmark the current supported models from each pricing host; do not reuse May 2025 TTFT rankings as current results
3. **STT optimization:** Benchmark streaming transcription and endpointing on your audio; historical TTFT figures are not provider guarantees
4. **Network routing:** Minimize geographical distance between users and inference servers

## Conclusion

Understanding how costs and latency are calculated for voice AI agents is essential for building systems that are both economical and responsive. By breaking down each component and optimizing strategically, you can create voice experiences that feel natural while keeping expenses under control.

Production cost and latency vary with the selected models, billing modes, regions, context policy, cache behavior, generated speech, and network path. Treat the worked figures as a scenario and validate the complete voice-to-voice path under representative load.
