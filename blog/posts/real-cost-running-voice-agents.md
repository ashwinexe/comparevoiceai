---
title: "Voice AI Production Costs: A Practical Breakdown"
date: 2025-05-29
updated: 2026-07-22
description: "Break down voice-agent production costs across transcription, language models, speech synthesis, infrastructure, and context management."
tags: "cost, llm, stt, tts, production"
author:
  name: "Nikhil R."
  bio: "Comparevoiceai.com"
---

Voice-agent costs are easy to underestimate because a production stack usually combines transcription, language-model inference, speech synthesis, and infrastructure with different billing units. This guide makes those assumptions explicit.

> **Pricing check (22 July 2026):** Prices below are public list prices for the stated mode or billing unit. Estimated totals still depend on speaking share, tokens, generated characters, cache behavior, request rounding, tiers, and region.

The examples below show how public list prices flow through the calculator; they are planning scenarios rather than a survey of customer deployments.

## The Three-Headed Cost Monster

Every voice AI agent has three core components that determine your bill:

1. **Speech-to-Text (STT)** - Converting user voice to text
2. **Large Language Model (LLM)** - The "brain" that understands and responds
3. **Text-to-Speech (TTS)** - Converting responses back to voice

Sounds simple, right? Here's where it gets interesting.

### STT: The Steady Baseline

STT costs are refreshingly predictable. Based on our analysis of current providers:

- **OpenAI Whisper-1**: $0.006/minute
- **Deepgram Nova-3**: $0.0077/minute (monolingual pre-recorded PAYG)
- **AssemblyAI Universal-2**: $0.0025/minute
- **Groq Whisper Large v3 Turbo**: $0.0006667/minute (10-second minimum)

For ten fully billable audio minutes, the listed fixed-rate examples span roughly $0.0067 to $0.06 before request minimums, rounding, channels, and add-ons. Within a fixed billing mode and tier, doubling billable duration doubles this component.

### TTS: The Variable Middle Child

Text-to-speech pricing varies dramatically based on quality and provider:

- **Amazon Polly Standard**: $0.000004/character (budget option)
- **OpenAI TTS-1**: $0.000015/character
- **Cartesia Sonic 3.5**: plan-derived; $0.00005/character effective on Pro
- **ElevenLabs Multilingual v2**: $0.0001/character

Assuming ~150 words per minute, 5 billable characters per word, and a 50% agent speaking share, a 10-minute conversation generates about 3,750 TTS characters. That is about $0.375 with ElevenLabs Multilingual v2 or $0.015 with Amazon Polly Standard, before free tiers, taxes, and provider-specific character-counting rules.

### LLMs: Context Can Compound Cost

LLM cost does not follow conversation duration directly. In a naive implementation that resends the complete history on every turn, earlier input tokens are billed repeatedly; with a roughly steady number of new tokens per turn, cumulative input can approach quadratic growth in the number of turns. Rolling windows, summaries, retrieval, and provider caching change that curve substantially.

The following GPT-4o figures are retained as a **May 2025 historical example**; GPT-4o is now deprecated:

- **3-minute conversation**: ~$0.02 in LLM costs
- **10-minute conversation**: ~$0.15 in LLM costs  
- **30-minute conversation**: ~$4.50 in LLM costs

That historical scenario produced a 225x difference because it assumed repeated full-history input and its own token pattern. It is not a universal scaling law or a current quote.

## Real-World Cost Examples

The following three stacks are a **May 2025 historical snapshot** and should not be used as current quotes; several listed models are now retired, deprecated, or differently priced:

### Scenario 1: Customer Support (Budget Stack)
- **STT**: Groq Whisper v3 Turbo
- **LLM**: Llama 4 Maverick  
- **TTS**: Amazon Polly Standard

**10-minute call cost**: $0.021/minute → **Total: $0.21**

### Scenario 2: Premium Assistant (Balanced)
- **STT**: OpenAI GPT-4o-Transcribe
- **LLM**: GPT-4o
- **TTS**: Cartesia Sonic

**10-minute call cost**: $0.038/minute → **Total: $0.38**

### Scenario 3: Ultra-Premium (Everything maxed)
- **STT**: AssemblyAI Universal-2
- **LLM**: Claude 3.7 Sonnet Thinking
- **TTS**: ElevenLabs Multilingual v2  

**10-minute call cost**: $0.125/minute → **Total: $1.25**

Longer calls should be recalculated turn by turn with the actual context policy; do not extrapolate these ten-minute historical totals linearly.

## Current Worked Scenario (22 July 2026)

The calculator's current default stack uses [Deepgram Flux English](https://deepgram.com/pricing) for streaming STT at $0.0065 per session minute, [OpenAI GPT-5.6 Luna](https://openai.com/index/gpt-5-6/) at $1 input / $6 output per 1M tokens, and [Deepgram Aura-2](https://deepgram.com/pricing) at $30 per 1M generated characters.

For a 10-minute conversation at 130 words per minute, 50% agent speech, 4 turns per minute, 1.3 tokens per word, 6 characters per word, no fixed prompt tokens, and full-history resend on every turn, the [Voice AI Pricing Calculator](/) produces:

| Component | Calculation result |
|---|---:|
| Streaming STT | $0.065000 |
| LLM (33,800 input + 845 output tokens) | $0.038870 |
| TTS (3,900 generated characters) | $0.117000 |
| Hosting input | $0.000000 |
| **Total for 10 minutes** | **$0.220870** |
| **Modeled cost per minute** | **$0.022087** |

This is a reproducible planning scenario, not a provider quote or universal voice-agent price. It excludes telephony, platform fees, taxes, negotiated rates, free allowances, cache discounts, add-ons, and any hosting cost you do not enter. Keep these assumptions fixed when comparing alternatives in the [STT](/stt/), [LLM](/llm/), and [TTS](/tts/) tables.

## The Hidden Costs Nobody Mentions

### 1. Context Management Overhead

If you summarize older context with another model call, record its input and output tokens as a separate line item. The overhead depends on how often summarization runs, the model used, and the summary length; compare it with the repeated input tokens it avoids.

### 2. Function Calling Tax

Tool use may add model calls or tokens for tool definitions, arguments, results, and follow-up generation. Instrument each step: some workflows use one model response plus a continuation, while others require retries or multiple tools.

### 3. Interruption Handling

When users interrupt your agent mid-response, you've paid for TTS generation that never gets played. Plus you need additional logic to handle context correctly. It's computationally messy.

### 4. Infrastructure and Orchestration  

The models are only part of the bill. Measure orchestration CPU and memory, concurrent media sessions, bandwidth, storage, observability, regional redundancy, and idle headroom, then divide the total by successfully completed conversations or billable minutes. A universal infrastructure rate is not defensible without that workload.

## What Actually Works for Cost Optimization

The following techniques are candidates to test against the same workload and quality target:

### 1. Ruthless Context Management
Avoid resending irrelevant history. Experiment with a rolling window, structured state, retrieval, or periodic summaries, and measure both task quality and token savings before choosing retention limits.

### 2. Model Routing by Complexity
Use a fast, lower-cost current model for simple queries and escalate only when needed. Measure the savings on your own query distribution rather than assuming a fixed percentage.

### 3. Smart TTS Caching
Cache common responses. "Thank you for calling, how can I help you?" doesn't need to be generated fresh every time. Pre-generate your 50 most common phrases.

### 4. Conversation Length Limits
This sounds harsh, but consider designing your agent to solve problems quickly. A brilliant 5-minute conversation is far more profitable than a meandering 25-minute one.

## The Bottom Line

Voice AI economics depend on more than choosing the lowest list price. Billing modes, context policy, generated speech, reliability, and infrastructure all need to be modeled together.

Set a target from your own quality, latency, and workload requirements. A per-minute number without token, character, mode, tier, and region assumptions is not comparable across stacks.

The technology is amazing and getting better fast. But the economics require careful thought. Plan for success, but design for sustainability.

---

*Want to model your own voice AI costs? Check out our [Voice Agent Pricing Calculator](/). It uses a dated provider-price snapshot and disclosed assumptions; estimates are not provider quotes.*
