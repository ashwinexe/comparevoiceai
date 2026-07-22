---
title: "How to Choose a Text-to-Speech Provider"
date: 2025-05-18
updated: 2026-07-22
description: "Choose a text-to-speech provider by testing voice quality, languages, controls, streaming, time to first audio, and billing terms."
tags: "tts, latency, pricing, provider selection"
author:
  name: "Nikhil R."
  bio: "Comparevoiceai.com"
---

The last mile of a voice-agent loop converts the model's text response into clear audio. Choosing a TTS service requires workload-specific testing of intelligibility, voice preference, time to first audio, streaming behavior, language coverage, controls, and billing terms.

> **Pricing check (22 July 2026):** Public list prices below are shown in their actual billing basis. Quality, TTFB, and throughput figures in the article are retained as a **May 2025 benchmark snapshot** and are not current provider guarantees.


| TTS Provider/Model | Current public pricing basis | Historical quality/latency note |
|--------------------|------------------------------|---------------------------------|
| [TTS-1 (OpenAI)](https://developers.openai.com/api/docs/models/tts-1) | $15/1M characters | Historical ELO 1,135; ~200ms snapshot |
| [Multilingual v2 (ElevenLabs)](https://elevenlabs.io/pricing/api) | $0.10/1K characters | Historical ELO 1,116 |
| [Flash v2.5 (ElevenLabs)](https://elevenlabs.io/pricing/api) | $0.05/1K characters | Historical ELO 1,107; ~75ms snapshot |
| [Sonic 3.5 (Cartesia)](https://docs.cartesia.ai/build-with-cartesia/tts-models/latest) | Plan-derived; $50/1M effective on Pro | `sonic-3.5` follows stable releases; pin `sonic-3.5-2026-05-04` when immutable behavior is required |
| [Kokoro 82M v1.0 (Replicate)](https://replicate.com/alphanumericuser/kokoro-82m) | Runtime/run-priced; no fixed character price | Historical ELO 1,089 |
| [Azure Standard Neural (Microsoft)](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech) | $15/1M characters | Historical ELO 1,059; ~300ms snapshot |
| [Studio (Google, legacy)](https://cloud.google.com/text-to-speech/pricing) | $160/1M characters | Historical ELO 1,040; ~500ms snapshot |
| [WaveNet (Google, legacy)](https://cloud.google.com/text-to-speech/pricing) | $4/1M characters | Historical ELO 872 |
| [Polly Standard (Amazon)](https://aws.amazon.com/polly/pricing/) | $4/1M characters | Historical ELO 797 |
| [ElevenLabs Turbo v2.5](https://elevenlabs.io/pricing/api) | $0.05/1K characters | Replaces Turbo v2 |
| GPT-4o Mini TTS (OpenAI) | Deprecated; token-billed, no fixed character price | Historical model |
| [Hume Octave 2](https://hume.ai/) | Creator overage $0.15/1K characters; $14/month plan | Preview; tier-dependent |
| [Deepgram Aura-2](https://deepgram.com/pricing) | $0.030/1K characters PAYG | Historical latency snapshot |
| [Rime Coda](https://www.rime.ai/) | Starts at $0.05/1K characters | Plan-dependent |
| [Sarvam Bulbul v3](https://docs.sarvam.ai/api/getting-started/pricing) | ₹30/10K characters; USD conversion is FX-dependent | Latest beta model; v2 is legacy |



This technical guide will walk you through the key considerations for selecting a TTS model that meets your voice agent's needs, comparing top providers, and exploring implementation considerations to ensure your conversational AI sounds as human-like as possible while meeting technical requirements.

## Understanding the Voice AI Stack

Before diving into TTS selection, it's important to understand where TTS fits in the overall voice AI architecture. A typical voice agent pipeline includes:

1. **Speech-to-Text (STT)**: Converts user's spoken input to text
2. **Large Language Model (LLM)**: Processes the text input and generates a response
3. **Text-to-Speech (TTS)**: Converts the LLM's text response into spoken audio output

While all three components are essential, TTS represents the "last mile" of your voice AI agent's communication, significantly impacting user experience and perceived quality.

![Voice AI agent pipeline](/blog/assets/voiceaiflow.png)

## Key Considerations for TTS Selection

### Human-Like Quality

![Voice Text to speech model comparison](/blog/assets/elotts.png)

The scores in the table and chart are a **May 2025 benchmark snapshot**, not a current universal ranking. Voice preference varies with language, speaker, content, codec, speaking style, and listener population. Shortlist active products by the controls and languages you need, then run blinded listening tests using the prompts and audio channel your agent will use. A single ELO score cannot establish intelligibility, emotional fit, or user preference for your deployment.


### Latency (Time to First Audio):

TTS timing should be measured from the application sending usable text to the user hearing the first audio, including network transit, buffering, decoding, and playback. The ~75-500 ms values in the table are **May 2025 snapshots** from particular tests, not current provider guarantees. GPT-4o mini TTS is now deprecated, and latency cannot be inferred from the behavior of a consumer application such as ChatGPT. Benchmark active models in the target region and audio format, compare streaming and quality modes, and choose a timing budget appropriate to the task rather than assuming a universal sub-300 ms target.

### Generation Rate

![Voice Text to speech model speed comparison](/blog/assets/genspeedtts.png)


Once playback starts, generation must keep enough decoded audio queued for the intended speaking rate. Throughput depends on model, text length, format, region, load, and hardware; do not assume every cloud or self-hosted product runs at least twice real time. For interactive use, verify that the exact model and endpoint supports incremental output in a format your client can decode continuously, then measure underruns and time to first audible frame.


### Voice Customization and Expressiveness

Providers differ in voice libraries, cloning or custom-voice terms, style controls, SSML, pronunciation tools, and multilingual behavior. GPT-4o mini TTS illustrated prompt-based style control in 2025 but is now deprecated, so do not build a new recommendation around it. For any current product, verify consent and rights for custom voices, test the exact languages and code-switching pattern, and confirm whether pronunciation or style controls apply to the selected voice and endpoint.

### Streaming Support

Streaming can reduce delay by allowing playback before the complete response is synthesized. Verify it on the exact model, endpoint, and returned audio format; a provider may support streaming on only part of its catalog.

Support summary from the current public surfaces; confirm the exact model and endpoint before implementation:

| Provider | Streaming Support |
|----------|------------------|
| [OpenAI](https://openai.com/) | Yes |
| [Google](https://cloud.google.com/text-to-speech) | Yes |
| [Amazon](https://aws.amazon.com/polly/) | Yes |
| [Azure](https://azure.microsoft.com/en-us/products/ai-services/ai-speech) | Yes |
| [ElevenLabs](https://elevenlabs.io/) | Yes |
| [Cartesia](https://cartesia.ai/) | Yes |
| PlayAI direct API | Discontinued; historical surface |
| [Fish Audio](https://fish.audio/) | Yes |
| [MiniMax](https://www.minimax.com/) | Yes |

Word-level timestamps are another important feature for interactive agents, as they help with synchronization, turn-taking, and handling interruptions.

### Word-level Timestamps

For integrating voice with visuals or for ensuring accurate turn-taking, having timestamps for each word or phoneme is useful. [Amazon Polly](https://aws.amazon.com/polly/) and [Google TTS](https://cloud.google.com/text-to-speech) provide speech marks or timecodes that indicate when words occur in the audio. [ElevenLabs](https://elevenlabs.io/) provides alignment metadata on supported endpoints. If you need to highlight text as it is spoken or synchronize an avatar, verify the exact endpoint and format; some products require a separate request or option. Timestamps can also help determine what audio was heard before a barge-in. We discuss that use case in a separate guide.

## Implementation Considerations

### Voice Agent Latency and Pipeline Integration

![Voice Text to speech model latency](/blog/assets/ttslatency.png)


When implementing a TTS model in your voice agent, remember that total latency includes more than just TTS processing:

```
Total Latency = STT time + LLM processing + TTS time + Network overhead
```

If offline operation or local data handling is required, benchmark a self-hosted model such as the actively maintained [OHF-Voice Piper](https://github.com/OHF-Voice/piper1-gpl) on the target hardware. Compare its license and each voice model's license, voice quality, generation rate, operating burden, and full playback latency with managed services. Local deployment removes a provider round trip but does not guarantee a fixed latency saving.

To work toward the response-time budget established for your own users and channel, consider:

1. **Pipeline Design**: Implement streaming concurrently across the stack. Don't wait for the LLM to finish generating the complete response before starting TTS—stream partial outputs to TTS as they're generated.

2. **Network path**: When compatible provider regions exist, compare application placement using the complete media-ingress-to-provider path. A shared region name does not guarantee the shortest route.

3. **Network Protocols**: Choose a transport suited to the channel. WebRTC provides media-oriented congestion, jitter, and echo-handling features; WebSockets can suit server-controlled streams. Measure both under realistic loss and network conditions.

### Handling Voice Customization in Production

For production voice agents, consider these implementation details:

1. **Pronunciation Dictionaries**: Maintain a dictionary of domain-specific terms or proper nouns that need special pronunciation, especially if your agent operates in specialized domains like healthcare or finance.

2. **SSML Support**: Use Speech Synthesis Markup Language tags for fine-tuning pauses, emphasis, and speaking rate when needed. Many services support SSML, and it can dramatically improve the naturalness of speech.

3. **Dynamic Voice Selection**: Consider implementing context-aware voice selection, where the voice characteristics or style changes based on the content or emotional context of the response.

### Handling Interruptions

A good conversational agent should handle interruptions gracefully—when the user speaks while the agent is talking:

1. Implement a Voice Activity Detector (VAD) that runs even while the TTS is playing audio
2. When user speech is detected during TTS output, immediately stop playback
3. Track which parts of the message were actually spoken using word-level timestamps
4. Maintain accurate conversation context based on what was actually heard, not what was planned to be said

## Future Trends in TTS for Voice Agents

The TTS landscape is rapidly evolving, with several emerging trends worth monitoring:

1. **Speech-to-Speech Models**: End-to-end audio models exposed through services such as [OpenAI's Realtime API](https://developers.openai.com/api/docs/guides/realtime) can accept and generate audio, potentially changing latency, control, and observability trade-offs.

2. **Emotional Intelligence**: Models that can detect user emotions from speech and appropriately modulate their response tone and style.

3. **Multimodal Capabilities**: Integration with visual elements, allowing voices to be paired with 2D or 3D avatars with synchronized expressions and gestures.

4. **Steerable TTS**: More sophisticated prompt-based control over voice characteristics, tempo, emotional tone, and speaking style without needing separate voice models.

## Cost Optimization Strategies

For organizations concerned about TTS costs at scale, consider these optimization strategies:

1. **Caching Common Phrases**: For frequently used responses or greeting phrases, cache the audio to avoid regenerating it each time.

2. **Hybrid Approaches**: Use premium voices for key interactions and less expensive voices for routine or informational content.

3. **Self-Hosting**: For very high volume applications, consider self-hosting open-source models like [Coqui TTS](https://github.com/coqui-ai/TTS) or [FastSpeech](https://github.com/ming024/FastSpeech2) on your own infrastructure, though this comes with maintenance overhead.

4. **Contextual Verbosity**: Adjust response length based on conversation context—be concise for quick exchanges, more detailed when users request explanations.

## Conclusion

Choosing the right TTS model for your voice AI agent involves balancing multiple factors including voice quality, latency, cost, and customization capabilities. The good news is that TTS technology has advanced dramatically, with many options providing remarkably human-like voices with low latency.

Current candidates include [OpenAI TTS-1/TTS-1 HD](https://developers.openai.com/api/docs/models/tts-1), [ElevenLabs Flash/Turbo v2.5 and Eleven v3](https://elevenlabs.io/pricing/api), Cartesia Sonic 3.5, [Azure Standard Neural/HD](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech), Google Chirp 3 HD, and Amazon Polly engines—each with different billing and availability qualifiers. Cartesia's `sonic-3.5` ID follows the latest stable snapshot; pin and test `sonic-3.5-2026-05-04` when your production change-control process requires an immutable model.

Remember that TTS is just one component of your voice agent stack, but as the literal "voice" of your application, it deserves careful consideration to ensure users have a natural, engaging conversation experience.

By systematically evaluating your needs and testing candidates against your specific use cases, you can select a TTS model that delivers the right balance of quality, performance, and cost for your voice AI agent application.

---

Compare model pricing and explore latency assumptions on [CompareVoiceAI.com](https://comparevoiceai.com/), then evaluate current TTS endpoints with your own scripts and listeners.
