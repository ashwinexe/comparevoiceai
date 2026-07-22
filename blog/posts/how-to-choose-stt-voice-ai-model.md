---
title: "How to Choose a Speech-to-Text Provider"
date: 2025-05-18
updated: 2026-07-22
description: "Choose a speech-to-text provider by comparing streaming mode, accuracy, endpointing, latency, billing units, request minimums, and language support."
tags: "stt, latency, pricing, provider selection"
author:
  name: "Nikhil R."
  bio: "Comparevoiceai.com"
---

Selecting the right Speech-to-Text (STT) model is critical for creating responsive, accurate, and cost-effective voice agents. This decision significantly impacts user experience, operational costs, and the technical architecture of your application. 

> **Pricing check (22 July 2026):** The prices in the table are current public list prices for the named mode. WER and speed values elsewhere in this article are retained as a **May 2025 external benchmark snapshot**; they are dataset- and test-dependent, not current provider guarantees.

## The Role of STT in Voice AI Agents

| Provider & Model | Current public list-price basis |
|------------------|---------------------------------|
| [ElevenLabs Scribe v2](https://elevenlabs.io/pricing/api?price.section=speech_to_text) | Pre-recorded: $0.22/hour = $0.0036667/min; realtime is a separate $0.0065/min row |
| [Speechmatics Enhanced](https://www.speechmatics.com/) | $0.0066667/min batch; $0.0071667/min realtime |
| [AssemblyAI Universal-2](https://www.assemblyai.com/universal-2) | Pre-recorded: $0.15/hour = $0.0025/min |
| [OpenAI GPT-4o Transcribe](https://developers.openai.com/api/docs/models/gpt-4o-transcribe) | Token-billed; no fixed per-minute list price |
| [Google Chirp 3](https://docs.cloud.google.com/speech-to-text/docs/models/chirp-3) | $0.016/min V2 Standard first tier; $0.003/min dynamic batch |
| [fal.ai Wizper](https://fal.ai/models/fal-ai/wizper) | Experimental; no defensible fixed per-minute list price |
| [OpenAI Whisper-1](https://developers.openai.com/api/docs/models/whisper-1) | $0.006/min |
| [Amazon Transcribe, US East](https://aws.amazon.com/transcribe/pricing/) | $0.006/min batch; $0.010002/min streaming; 15-second request minimum |
| [Whisper Large v3 Turbo, Groq](https://console.groq.com/) | $0.0006667/min; 10-second request minimum |
| [Nova-3 Monolingual, Deepgram](https://deepgram.com/pricing) | $0.0077/min pre-recorded PAYG; $0.0048/min streaming promotional |
| [Sarvam Saaras v3](https://docs.sarvam.ai/api/getting-started/pricing) | ₹0.50/min, billed per second and rounded per request |
| [Gladia Solaria-3](https://www.gladia.io/pricing) | $0.0101667/min async Starter; $0.0125/min realtime Starter |

*Mode, region, tier, channels, add-ons, request rounding and minimum duration can materially change the bill.*

Modern voice agents convert user speech to text, process that text with an LLM, and then convert the response back to speech. As the entry point of this pipeline, STT quality directly impacts everything downstream:

- **Transcription accuracy** affects how well your agent understands user intent measured as WER
- **STT latency** contributes to the overall response time. Speed factor is audio file seconds transcribed per second of processing time.
- **Cost per minute** affects your operational expenses at scale


## Key Things to Consider When Evaluating STT Models

Since this is the first transcription step, here you want to use a product with low word error rate (% of words transcribed incorrectly), high speed (Input audio seconds transcribed per processing second) and low price per min of audio transcribed. 

[Whisper](https://platform.openai.com/docs/guides/speech-to-text) remains useful for many transcription workloads, but conversational suitability depends on streaming support, endpointing, region, audio, and measured end-of-speech-to-final-transcript latency. Common managed options include [Deepgram](https://deepgram.com/), [Gladia](https://www.gladia.io/), [ElevenLabs](https://elevenlabs.io/), [AssemblyAI](https://www.assemblyai.com/), and [Speechmatics](https://www.speechmatics.com/). Benchmark the exact mode and deployment region you plan to use.


In this section, we will dive deeper into each of the above concerns.

### Accuracy and WER

WER is the share of reference words represented by substitutions, deletions, and insertions; lower is better. The model-specific figures in the original article and chart are a **May 2025 external benchmark snapshot**, not a current ranking. Results change with dataset, accents, noise, domain terminology, diarization, punctuation, and normalization rules. Build a labeled sample from your own audio and compare current candidates with the same scoring procedure.

### Latency and Time-to-First-Token (TTFT)

The latency figures in the original article are also a **May 2025 snapshot**. Partial-transcript timing, endpointing delay, final-transcript timing, and network transit are different measurements and should not be compared as one number. For a conversational agent, measure end-of-speech to stable final transcript in the exact mode, region, audio format, and load you will use. Streaming interim results may enable safe preparatory work, but acting on unstable text can require rollback.

### Cost per Minute

STT pricing has become very competitive. Open-source models like [Whisper](https://platform.openai.com/docs/guides/speech-to-text) incur infrastructure costs, while managed services simplify scaling. Current billing is not universally per minute: Whisper-1 is $0.006/min, GPT-4o Transcribe is token-billed, Deepgram Nova-3 monolingual pre-recorded PAYG is $0.0077/min, AssemblyAI Universal-2 is $0.0025/min, and Google V2 Standard is tiered from $0.016 to $0.004/min with a separate $0.003/min dynamic-batch mode. Compare like-for-like mode, tier, channel, region, and request duration.


![Speech to text voice AI speed vs price compare](/blog/assets/speedfactorprice.png)

#### Historical Experiment: Using Gemini for Conversation and Transcription

> **Historical note:** This section describes a Gemini 2.5 experiment from May 2025. Stable Gemini 2.5 models are scheduled to shut down on 16 October 2026; revalidate the workflow and pricing against a current native-audio model before implementation.

The May 2025 article explored sending the current utterance to two Gemini 2.5 flows: one for a transcript and one for a response, while retaining prior history as text. That was an architecture experiment, not evidence that it was cheaper or faster than dedicated STT. Stable Gemini 2.5 models are scheduled to shut down on 16 October 2026.

If evaluating the pattern with a current native-audio model, separately measure audio/text tokens, transcript determinism, finalization latency, synchronization, retries, and audit requirements. Ensure the transcript committed to history is stable before the next turn. Compare the total with a dedicated streaming STT path using the same audio and traffic; do not assume an audio-to-audio model is a drop-in transcription service.

### Fine-tuning and Customization

Many STT providers now support custom vocabulary or prompt biasing to improve recognition of proper nouns, acronyms, or context-specific terms. For instance, [Deepgram](https://deepgram.com/) offers Keyphrase Boosting (a form of "pre-prompting" the STT with expected keywords) to raise accuracy on those terms. [OpenAI](https://openai.com/)'s [GPT-4o-transcribe](https://platform.openai.com/docs/models/gpt-4o-transcribe), being a derivative of a large multimodal model, can potentially leverage context better than [Whisper](https://platform.openai.com/docs/guides/speech-to-text) for things like overlapping speech or complex audio scenes. [AssemblyAI Universal-2](https://www.assemblyai.com/universal-2) introduced formatted output (auto-punctuation, casing, etc.) using an all-neural post-processing, reducing the need to hand-tune transcripts. Some platforms ([Google](https://cloud.google.com/), [Amazon](https://aws.amazon.com/)) let you fine-tune STT models with your own audio data to specialize them, though this can be complex and costly. If fine-tuning is not feasible, providing hints or a domain-specific word list is a simpler way to bias the model (e.g. ensuring product names or addresses are transcribed correctly)

### Edge Deployment Feasibility

Open-source models such as [Whisper](https://github.com/openai/whisper) and Vosk can be deployed on infrastructure you control, subject to hardware, model size, language, accuracy, and power constraints. Managed Groq and OpenAI transcription products are API services, not on-device deployment options. Benchmark real-time factor, memory, battery or accelerator use, and WER on the target device before choosing edge STT; compare that operational burden with cloud privacy, availability, and network requirements.

### Notable 2025 Entrants (Historical Benchmark Context):

[GPT-4o Transcribe](https://developers.openai.com/api/docs/models/gpt-4o-transcribe) and [GPT-4o Mini Transcribe](https://developers.openai.com/api/docs/models/gpt-4o-mini-transcribe) were notable 2025 entrants. OpenAI's current model pages describe accuracy improvements over original Whisper models; benchmark the exact model and snapshot on your audio instead of carrying forward the old article's universal WER and latency claims. Also notable in the 2025 snapshot was [Gladia Solaria](https://www.gladia.io/)
(April 2025), which targets enterprise with 100+ languages and claims native-level accuracy in many (e.g. ~94% accuracy in English, Spanish, French) at 270 ms latency indicating big players and startups alike are pushing latency under the ~300 ms mark.

## Use Case-Specific Considerations

Different voice agent applications have different STT requirements:

### Real-time Conversation Agents

For applications where natural conversation is key (customer service, voice assistants):
- Set latency percentiles from the application's turn-taking and channel requirements
- Set an accuracy threshold from task errors and representative transcripts rather than a universal WER
- Consider streaming APIs that return interim results

### Domain-Specific Applications

For specialized fields (healthcare, legal, technical support):
- Focus on domain-specific accuracy
- Look for models that support custom vocabulary or keyphrase boosting
- Consider fine-tuning options for specialized terminology

### Cost-Sensitive High-Volume Applications

For applications processing thousands of hours monthly:
- Balance accuracy vs. cost
- Compare current managed and self-hosted candidates at the same accuracy, mode, minimum duration, and total operating cost
- Consider self-hosted options for very high volumes

## Implementation Considerations

Beyond the model selection, consider these implementation factors:

### 1. Edge vs. Cloud Deployment

Most production voice agents use cloud APIs for STT, but edge deployment options exist:

- **Cloud considerations**: Managed scaling and models, but network, region, data-handling, and service dependencies remain
- **Edge considerations**: Potential offline operation and local data handling, balanced against hardware limits, model optimization such as quantization, and ongoing operating responsibility

### 2. Streaming STT for Responsiveness

Streaming STT returns partial transcripts while the user is still speaking, enabling:
- Earlier LLM processing for faster responses
- More natural turn-taking
- Better conversation flow

### 3. Audio Processing Pipeline

Your STT performance depends on clean audio input:
- Implement noise suppression
- Use automatic gain control
- Consider adding speaker isolation (e.g., [Krisp](https://krisp.ai/)) for noisy environments
- Ensure proper echo cancellation for speakerphone settings


## Emerging Trends in STT

Keep an eye on these developments:

1. **Speech-to-Speech Models**: Current audio models such as those exposed through [OpenAI's Realtime API](https://developers.openai.com/api/docs/guides/realtime) can accept and produce audio; verify lifecycle, controls, observability, latency, and billing against a pipeline.

2. **Multimodal Context**: Models incorporating visual and audio context to improve transcription quality and semantic understanding.

3. **Semantic VAD**: Advanced turn detection that uses content rather than just pauses to determine when a user has finished speaking.

4. **Specialized Industry Models**: Increasing availability of models fine-tuned for specific industries or technical domains.

## Conclusion

Choosing the right STT model is a critical decision that impacts the entire voice agent experience. Consider your specific needs around accuracy, latency, cost, and languages supported. As STT technology continues to advance rapidly, regularly reassess your choices to ensure you're leveraging the best available options.

For implementation, start with a cloud-based STT API to minimize development complexity, then optimize as you scale and better understand your specific requirements. As voice AI becomes more prevalent, the quality of the STT component will increasingly become a key differentiator in creating natural, responsive voice experiences.

---

Compare model pricing and explore latency assumptions on [CompareVoiceAI.com](https://comparevoiceai.com/), then benchmark the exact STT mode and region you plan to deploy.
