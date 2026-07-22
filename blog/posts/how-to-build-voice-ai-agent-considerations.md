---
title: "How to Build a Voice AI Agent Stack"
date: 2025-05-17
updated: 2026-07-22
description: "Plan a voice AI agent stack by comparing STT, LLM, TTS, orchestration, latency, reliability, safety, and cost trade-offs."
tags: "architecture, llm, stt, tts, latency"
author:
  name: "Nikhil R."
  bio: "Comparevoiceai.com"
---

In the rapidly evolving landscape of AI, voice agents represent one of the most complex and interesting applications. These agents combine multiple AI components to create natural, responsive conversational experiences. This post explores the core components of modern voice agent stacks and the critical technical considerations for building effective voice AI systems.

> **Content check (22 July 2026):** Provider prices and model availability have been refreshed where stated. WER, TTFT, throughput, ELO, and latency figures remain a **May 2025 benchmark snapshot** and require workload-specific validation.

![Voice AI agent stack and components](/blog/assets/voiceaiflow.png)


## The Core Voice Agent Loop

At its most basic, a voice agent's job is to listen to what a human says, respond usefully, and repeat this sequence. This deceptively simple flow involves multiple specialized AI models and careful orchestration:

1. Speech is captured and sent to the cloud
2. Speech is transcribed to text
3. Text is processed by an LLM to generate a response
4. Response text is converted to speech
5. Audio is returned to the user

While this appears straightforward, achieving human-like conversation requires sophisticated engineering across multiple domains.

## Core Components of the Voice Agent Stack

### Speech-to-Text (STT)

STT is the input stage for voice AI, responsible for converting user speech into text that an LLM can process.

**Technical considerations:**

- **Accuracy:** The chart below is a May 2025 benchmark snapshot. WER depends on the dataset, language, formatting rules, audio channel, and test method, so benchmark current candidates on representative recordings.
![Speech to Text model error rate](/blog/assets/worderrorrate.png)


- **Latency:** Partial and final transcript timing both matter. The May 2025 measurements included sub-300 ms results in some regions and workloads, but they are not current guarantees; measure end-of-speech to final transcript in your deployment region.

- **Streaming capability:** Interim results are essential for real-time voice applications. Modern APIs stream partial transcriptions while the user speaks, reducing perceived latency.

- **Cost efficiency:** Billing varies by mode. OpenAI Whisper-1 is $0.006/minute; Deepgram Nova-3 monolingual pre-recorded PAYG is $0.0077/minute and its streaming rate is separate.

- **Language support:** Consider multilingual needs. Gladia Solaria supports 100+ languages, while some specialized models focus only on English for better performance.

For mission-critical applications requiring specialized vocabulary (medical, legal), domain-specific tuning is often worth the investment.

### Large Language Models (LLMs)

LLMs serve as the "brain" of the voice agent – understanding queries, maintaining context, and formulating responses.

**Technical considerations:**

- **Response latency:** Time to first token and sustained generation rate both affect when speech can begin. The GPT-4o and Gemini 2.5 figures in the original article were May 2025 snapshots; establish a target from your own task and channel, then measure active models.

- **Throughput:** After the first token, generation speed matters. Compare measured output rate with the response length, TTS chunking strategy, and chosen speaking rate instead of assuming every model outpaces playback.

- **Context window:** A larger limit is not automatically better: resending unnecessary history adds latency and cost. Check the current limit for the exact model and endpoint, then use structured state, rolling history, summaries, or retrieval as the task requires.

- **Conversational ability:** Test multi-turn references, brevity, instruction following, tool recovery, and failure behavior on transcripts from your application. Provider-family reputations are not a substitute for that evaluation.

- **Tool/function calling:** Many voice agents interface with external systems such as calendars or account APIs. Verify schema support, parallel calls, cancellation, retries, and argument accuracy for the exact current model.

- **Cost efficiency:** LLMs charge input and output separately. Current examples include GPT-5.6 Luna at $1/$6 per 1M tokens and Gemini 3.6 Flash at $1.50/$7.50. Duration alone is insufficient to calculate LLM cost.

### Text-to-Speech (TTS)

TTS is the output stage, converting LLM text responses into natural-sounding speech.

**Technical considerations:**

- **Voice quality:** The relative scores below are a May 2025 snapshot from one benchmark. Listener preference depends on voice, language, content, codec, and test design, so run blinded listening tests for your use case.

![Text to speech voice model comparison](/blog/assets/voiceelo.png)

- **Latency:** Fast time to first audio can reduce dead air, but the acceptable value is workload-specific. Measure from final user speech through audible playback, not only provider TTFB.

- **Streaming capability:** For interactive use, verify that the exact model and endpoint can emit a supported audio format incrementally; availability and protocol differ by provider.

- **Voice customization:** Consider whether you need a consistent persona, emotional expressiveness, or specific accents. GPT-4o mini TTS demonstrated prompt-based style control in 2025 but is now deprecated; choose an active model and verify its current controls and lifecycle.

- **Word-level timestamps:** For interruption handling and visual sync, having precise timing data for each word is valuable. Amazon Polly, Google TTS, and some ElevenLabs endpoints provide this metadata.

- **Cost efficiency:** TTS pricing varies significantly. ElevenLabs Flash v2.5 is $0.05/1K characters, while Amazon Polly Neural is $16/1M characters. A per-minute estimate requires generated characters and agent speaking share.

## Critical Engineering Considerations

### Latency Management

For voice interaction, latency is important alongside recognition quality, task success, reliability, and interruption behavior. There is no single human-response threshold that applies to every language, channel, or task.

**Technical approaches:**

- **Streaming across the stack:** Implement streaming for STT, LLM, and TTS simultaneously. This creates a pipeline where each component starts working as soon as it receives initial input.

- **Concurrent processing:** Start transcribing while the user speaks. Begin LLM processing on partial transcripts. Send initial LLM output to TTS before the full response is generated.

- **Component co-location:** When providers expose compatible regions, place your orchestration layer near those endpoints and your media ingress. Measure the resulting network path; savings vary by topology.

- **Regional routing:** Compare candidate regions using the complete user/carrier-to-ingress-to-provider path. The geographically nearest application region is not always the fastest or most reliable once provider availability, data residency, and failover are included.

An illustrative timing budget might allocate 250 ms to endpointing and final transcription, another 250 ms to first model output, and 150 ms to first audible TTS. Those figures are not additive provider guarantees: instrument each boundary and set the budget from your own experience target.

### Turn Detection & Interruption Handling

Turn detection determines when the user has finished speaking and expects a response.

**Technical implementations:**

- **Voice Activity Detection (VAD):** The most common approach uses specialized models like Silero VAD to classify audio segments as speech or silence. A typical configuration waits for 0.8 seconds of silence before assuming the user is done.

- **Push-to-talk:** An alternative approach requiring user button interaction. Eliminates ambiguity but creates a less natural experience.

- **Semantic turn detection:** Advanced systems use contextual cues beyond silence. They analyze grammar, intonation, and even predicted intent to determine when a user has finished their thought.

- **Interruption handling:** Implement "barge-in" detection that recognizes when a user starts speaking during the agent's response. This requires:
  - Cancellable TTS output
  - Full-duplex audio handling
  - Mechanisms to preserve context after interruption

### Audio Processing

Real-world audio presents numerous challenges that impact voice agent performance.

**Critical components:**

- **Automatic Gain Control (AGC):** Normalizes volume levels to ensure consistent input to STT systems.

- **Echo Cancellation (AEC):** Prevents the agent's voice from being captured by the microphone and fed back into the system. Browser and native WebRTC stacks can provide AEC, but effectiveness depends on the device, capture path, configuration, and acoustic environment.

- **Noise Suppression (NS):** Filters out background noise to improve STT accuracy. Solutions like Krisp.ai use AI to remove background noise while preserving speech.

- **Speaker Isolation:** In environments with multiple speakers or background speech, models like Krisp can identify and isolate the primary speaker, dramatically improving transcription accuracy.

### Network Transport

Voice data transmission requires specialized protocols for real-time media delivery.

**Technical options:**

- **WebRTC:** Often a strong fit for interactive browser or mobile media because it includes congestion control, jitter handling, NAT traversal, and media-oriented audio features. It also adds signaling and operational complexity, and is not a universal default.

- **WebSockets:** Can suit server-controlled and server-to-server streams and some production client applications. TCP head-of-line blocking can matter under loss, so test buffering, backpressure, cancellation, and recovery on representative networks.

- **HTTP streaming:** Can work well when the provider, client, and intermediaries support a genuinely incremental response. Reuse connections where supported and measure proxy buffering and setup cost.

- **QUIC/HTTP/3:** Avoids TCP-level head-of-line blocking between streams, but availability and operational behavior vary across clients, networks, CDNs, and providers.

Choose transport by channel and topology, then benchmark it under realistic loss, jitter, mobile handoffs, proxies, and concurrency. Security, authentication, observability, and provider SDK support are part of the decision.

### Cost Optimization

At scale, cost efficiency becomes significant.

**Practical strategies:**

- **Context management:** Implement summarization techniques to reduce token usage over long conversations. Instead of resending the entire history each turn, summarize older exchanges and only include recent turns verbatim.

- **Tiered model selection:** Route complex queries to a higher-capability current model and simpler tasks to a lower-cost model, then measure quality and savings on your workload.

- **Caching:** Implement token caching to avoid redundant processing. Both OpenAI and Google offer automatic token caching features.

- **End-to-end cost calculation:** Calculate STT audio, LLM input/output tokens, and TTS characters separately. A universal per-minute range is misleading without mode, model, region, context policy, cache behavior, and speaking-share assumptions.


## Emerging Alternative: Speech-to-Speech Models

Unified speech-to-speech models are an alternative to the STT → LLM → TTS pipeline. OpenAI's Realtime API is one implementation that accepts and produces audio; current model IDs, controls, regions, and prices should be checked before adoption.

**Potential advantages:**
- Lower latency (no multi-step processing)
- Preservation of paralinguistic information (emotions, tone)
- More natural handling of non-verbal sounds

**Current limitations:**
- Less control and interpretability (no text checkpoint to edit/moderate)
- Typically higher computational requirements and cost
- Potentially shorter effective memory for long conversations
- Limited customization compared to separate components

In the article's May 2025 context, many systems used a cascade for modularity and observability while experimenting with end-to-end audio. In 2026, compare both architectures against the same task, moderation, debugging, latency, and cost requirements rather than assuming either is the default.

## Conclusion

Building effective voice agents requires careful orchestration of multiple AI components. Beyond selecting the best individual models, success depends on how these components work together to create a seamless, natural conversation experience.

Success depends on a workload-specific balance of task completion, recognition and speech quality, interruption handling, reliability, safety, cost, and latency. Measure the full voice-to-voice loop and its percentiles instead of treating 800 ms as a universal boundary.

As technologies advance, especially with emerging speech-to-speech models, we'll continue to see the gap between human-human and human-AI conversation narrow. However, understanding the technical foundations outlined here will remain essential for building voice agents that truly engage and delight users.

---

Compare model pricing and explore a latency budget on [CompareVoiceAI.com](https://comparevoiceai.com/), then validate the shortlist end to end.
