---
title: "Voice AI API Integration Tutorial and Examples"
date: 2025-05-29
updated: 2026-07-22
description: "A voice AI API integration tutorial with STT, LLM, TTS, orchestration, and realtime patterns, plus caveats for historical code examples."
tags: "api, integration, llm, stt, tts, realtime"
author:
  name: "Nikhil R."
  bio: "Comparevoiceai.com"
---


Building a pipeline voice agent typically requires integrating **Speech-to-Text (STT)**, a **Large Language Model (LLM)**, and **Text-to-Speech (TTS)**. These examples were originally written against 2025 SDKs and now include lifecycle and pricing annotations.

> **Revision note (22 July 2026):** Pricing/model status annotations were refreshed, but SDKs and realtime APIs evolve independently. Treat code using retired preview snapshots as historical and revalidate every sample against the provider's current SDK documentation before production use.

## Voice AI Architecture Overview

Modern voice agents follow a similar three-stage pipeline:

```
User Speech → STT → LLM → TTS → Audio Response
```

However, the release of speech-to-speech models like OpenAI's Realtime API is changing this landscape, offering direct audio-to-audio processing. Let's explore both traditional pipeline and modern unified approaches.

## Speech-to-Text (STT) Integrations

### 1. OpenAI GPT-4o Transcribe

GPT-4o Transcribe is a token-billed file-transcription model. Accuracy and latency depend on the audio, language, file length, and API mode; benchmark it against the alternatives on your own data.

**Pricing**: token-billed ($2.50/M audio-input tokens and $10/M text-output tokens); there is no fixed per-minute list price. **Latency**: the ~320ms figure is a May 2025 benchmark snapshot.

```python
import asyncio
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key="your-api-key")

async def transcribe_file(audio_file_path):
    """Upload one completed audio file for transcription.

    This is asynchronous application code, but it is not realtime streaming.
    Use a current Realtime transcription session for microphone streaming.
    """
    try:
        with open(audio_file_path, "rb") as audio_file:
            transcript = await client.audio.transcriptions.create(
                model="gpt-4o-transcribe",
                file=audio_file,
                response_format="json",
                language="en"  # Optional: specify language for better performance
            )

        return transcript.text

    except Exception as e:
        print(f"Transcription error: {e}")
        return None

# Usage example
result = asyncio.run(transcribe_file("audio.wav"))
print(f"Transcript: {result}")
```

### 2. Deepgram Nova-3

Deepgram Nova-3 supports pre-recorded and streaming transcription; latency and concurrency depend on mode, region, audio, and account limits.

**Pricing**: $0.0077/minute monolingual pre-recorded PAYG; streaming is a separate promotional $0.0048/minute. **Latency**: the <300ms figure is a May 2025 benchmark snapshot.

The example below targets the current
[`@deepgram/sdk` v5 surface](https://github.com/deepgram/deepgram-js-sdk).
Pin and test a compatible v5 release in your application instead of assuming
future major versions will preserve this interface.

```javascript
const { createReadStream } = require('node:fs');
const { DeepgramClient } = require('@deepgram/sdk');

class DeepgramSTT {
    constructor(apiKey, onFinalTranscript) {
        this.deepgram = new DeepgramClient({ apiKey });
        this.onFinalTranscript = onFinalTranscript;
    }

    async transcribeRealtime(audioStream) {
        const connection = await this.deepgram.listen.v1.connect({
            model: 'nova-3',
            language: 'en',
            smart_format: 'true',
            interim_results: 'true',
            endpointing: '300',
            utterance_end_ms: '1000',
            vad_events: 'true'
        });

        connection.on('message', (message) => {
            if (message.type === 'Results') {
                const transcript = message.channel.alternatives[0]?.transcript;
                if (message.is_final && transcript) {
                    this.onFinalTranscript(transcript);
                } else if (transcript) {
                    console.log('Interim result:', transcript);
                }
                if (message.from_finalize) connection.close();
            } else if (message.type === 'SpeechStarted') {
                console.log('User started speaking');
            } else if (message.type === 'UtteranceEnd') {
                console.log('User finished speaking');
            }
        });

        connection.on('error', (error) => console.error('Deepgram error:', error));
        connection.connect();
        await connection.waitForOpen();

        audioStream.on('data', (chunk) => connection.sendMedia(chunk));
        audioStream.once('end', () => {
            connection.sendFinalize({ type: 'Finalize' });
        });
        audioStream.once('error', () => connection.close());

        return connection;
    }
}

async function main() {
    const stt = new DeepgramSTT(
        process.env.DEEPGRAM_API_KEY,
        (transcript) => console.log('Final transcript:', transcript)
    );
    await stt.transcribeRealtime(createReadStream('audio.wav'));
}

main().catch(console.error);
```

### 3. AssemblyAI Universal-2

**Pricing**: $0.0025/minute | **WER**: 8.6% in the article's May 2025 benchmark snapshot

```python
import assemblyai as aai
import asyncio

class AssemblyAISTT:
    def __init__(self, api_key):
        aai.settings.api_key = api_key

    async def transcribe_prerecorded_url(self, audio_url):
        """Submit a pre-recorded audio URL and wait for the result.

        asyncio.to_thread prevents the synchronous SDK call from blocking this
        application's event loop; it does not turn batch transcription into a
        realtime stream.
        """
        config = aai.TranscriptionConfig(
            speaker_labels=True,  # Enable speaker diarization
            auto_chapters=True,   # Automatic chapter detection
            sentiment_analysis=True,  # Sentiment analysis
            entity_detection=True,    # Named entity recognition
            language_detection=True   # Auto language detection
        )

        transcriber = aai.Transcriber()
        transcript = await asyncio.to_thread(
            transcriber.transcribe, audio_url, config
        )

        # Process results with speaker information
        result = {
            'text': transcript.text,
            'speakers': [],
            'sentiment': transcript.sentiment_analysis_results,
            'entities': transcript.entities
        }

        if transcript.utterances:
            for utterance in transcript.utterances:
                result['speakers'].append({
                    'speaker': f"Speaker {utterance.speaker}",
                    'text': utterance.text,
                    'confidence': utterance.confidence,
                    'start': utterance.start,
                    'end': utterance.end
                })

        return result

async def main():
    stt = AssemblyAISTT('your-assemblyai-api-key')
    result = await stt.transcribe_prerecorded_url(
        'https://example.com/audio.wav'
    )
    print(result)

asyncio.run(main())
```

## Large Language Model (LLM) Integrations

### 1. OpenAI GPT-5.6 Luna for streaming text responses

The original 2025 version used GPT-4o and quoted benchmark-specific latency/throughput. GPT-4o is now deprecated, so this example uses the current cost-oriented GPT-5.6 Luna model and leaves performance to workload testing.

**Pricing checked 22 July 2026**: $1 input + $6 output per 1M tokens at the base tier. Cache and prompts over the 272K-token long-context threshold have separate rates.

```python
import asyncio
from openai import AsyncOpenAI

class VoiceAgentLLM:
    def __init__(self, api_key):
        self.client = AsyncOpenAI(api_key=api_key)
        self.conversation_history = []

    async def process_voice_input(self, transcript):
        """Stream a concise text response for downstream TTS."""
        # Add user message to conversation history
        self.conversation_history.append({
            "role": "user", 
            "content": transcript
        })

        # System prompt optimized for voice interactions
        system_prompt = """You are a helpful voice assistant. Your responses will be converted to speech, so:
        - Keep responses concise and conversational
        - Avoid complex formatting, lists, or tables
        - Use natural speech patterns
        - Always prioritize clarity over completeness in voice responses"""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-5.6-luna",
                messages=[
                    {"role": "system", "content": system_prompt},
                    *self.conversation_history
                ],
                stream=True,
                max_completion_tokens=150
            )

            # Handle streaming response
            full_response = ""

            async for chunk in response:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    # Send partial response to TTS for lower latency
                    await self.send_to_tts_streaming(content)

            # Add assistant response to history
            self.conversation_history.append({
                "role": "assistant",
                "content": full_response
            })

            return full_response

        except Exception as e:
            return f"I apologize, but I encountered an error: {str(e)}"

    async def send_to_tts_streaming(self, text_chunk):
        """Send text chunks to TTS for streaming audio generation"""
        # This will be implemented in the TTS section
        pass

async def main():
    llm = VoiceAgentLLM('your-openai-api-key')
    response = await llm.process_voice_input(
        "What's the weather like in New York?"
    )
    print(response)

asyncio.run(main())
```

### 2. Gemini 3.6 Flash with the current Google Gen AI SDK

The original article measured Gemini 2.5 Flash at 339 tokens/s and 0.39s time-to-first-token in a May 2025 benchmark. Those figures are historical and are not applied to Gemini 3.6 Flash.

**Pricing checked 22 July 2026**: Gemini 3.6 Flash is $1.50 input / $7.50 output per 1M tokens; output pricing includes thinking tokens. Cached input and cache storage are separate.

```python
import asyncio
from google import genai
from google.genai import types

class GeminiVoiceAgent:
    def __init__(self, api_key):
        self.client = genai.Client(api_key=api_key)

    async def process_voice_input(self, transcript, audio_data=None):
        """Stream text generated from a transcript and optional WAV bytes."""
        try:
            prompt = (
                "Respond conversationally in fewer than 50 words. "
                f"User transcript: {transcript}"
            )
            contents = [prompt]
            if audio_data is not None:
                contents.append(
                    types.Part.from_bytes(data=audio_data, mime_type="audio/wav")
                )

            response = await self.client.aio.models.generate_content_stream(
                model="gemini-3.6-flash",
                contents=contents,
                config=types.GenerateContentConfig(max_output_tokens=150),
            )

            # Stream response for low latency
            full_response = ""
            async for chunk in response:
                if chunk.text:
                    full_response += chunk.text
                    # Send to TTS immediately for lower latency
                    await self.stream_to_tts(chunk.text)

            return full_response

        except Exception as e:
            return f"I'm having trouble processing that. Could you try again?"

    async def close(self):
        await self.client.aio.aclose()

    async def stream_to_tts(self, text_chunk):
        """Stream text chunks to TTS service"""
        # Implementation in TTS section
        pass

async def main():
    gemini_agent = GeminiVoiceAgent('your-gemini-api-key')
    try:
        response = await gemini_agent.process_voice_input("Tell me a quick joke")
        print(response)
    finally:
        await gemini_agent.close()

asyncio.run(main())
```

## Text-to-Speech (TTS) Integrations

### 1. ElevenLabs Flash v2.5 streaming

ElevenLabs Flash v2.5 is a current streaming-capable model. The ~75ms figure below came from the article's May 2025 benchmark and is not a provider guarantee for this code path.

**Pricing**: $0.05/1,000 characters | **Latency**: ~75ms in a May 2025 benchmark snapshot

```python
import aiohttp
import asyncio

class ElevenLabsTTS:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.elevenlabs.io/v1"

    async def text_to_speech_streaming(self, text, voice_id="21m00Tcm4TlvDq8ikWAM"):
        """
        Convert text to speech with streaming for minimal latency
        """
        url = (
            f"{self.base_url}/text-to-speech/{voice_id}/stream"
            "?output_format=mp3_44100_128"
        )

        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key
        }

        data = {
            "text": text,
            "model_id": "eleven_flash_v2_5",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.5,
                "use_speaker_boost": True
            }
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data, headers=headers) as response:
                if response.status == 200:
                    # Stream audio chunks as they arrive
                    async for chunk in response.content.iter_chunked(1024):
                        # Can start playing audio immediately
                        yield chunk
                else:
                    raise Exception(f"TTS Error: {response.status}")

    async def generate_voice_streaming(self, text_stream):
        """
        Process streaming text input incrementally
        """
        sentence_buffer = ""

        async for text_chunk in text_stream:
            sentence_buffer += text_chunk

            # Send complete sentences to TTS immediately
            if any(punct in text_chunk for punct in '.!?'):
                async for audio_chunk in self.text_to_speech_streaming(sentence_buffer):
                    yield audio_chunk
                sentence_buffer = ""

        # Send remaining text
        if sentence_buffer.strip():
            async for audio_chunk in self.text_to_speech_streaming(sentence_buffer):
                yield audio_chunk

# Usage with streaming LLM
tts = ElevenLabsTTS('your-elevenlabs-api-key')

async def process_voice_conversation(transcript):
    """Complete voice processing pipeline"""
    # 1. Get an async iterator of text deltas from the LLM adapter.
    llm_response_stream = get_llm_streaming_response(transcript)

    # 2. Buffer deltas to sentence boundaries, then stream each TTS response.
    async for audio_chunk in tts.generate_voice_streaming(llm_response_stream):
        play_audio_chunk(audio_chunk)
```

### 2. Cartesia Sonic 3.5 raw PCM playback

**Pricing**: $50/1M characters is an effective Pro-plan rate only when the full included allowance is used; the $5 monthly commitment and unused credits still apply. **Latency**: ~100ms in the historical benchmark, not a guarantee. `sonic-3.5` follows the latest stable snapshot; pin `sonic-3.5-2026-05-04` when immutable behavior is required.

```javascript
class CartesiaTTS {
    constructor(accessToken) {
        // Mint a short-lived client token on your server; never ship a
        // long-lived Cartesia API key in browser JavaScript.
        this.accessToken = accessToken;
        this.baseUrl = 'https://api.cartesia.ai/tts/bytes';
        this.audioContext = null;
        this.nextStartTime = 0;
    }

    async synthesizeSpeech(text, options = {}) {
        const payload = {
            model_id: 'sonic-3.5',
            transcript: text,
            voice: {
                mode: 'id',
                id: 'a0e99841-438c-4a64-b679-ae501e7d6091' // Default voice
            },
            output_format: {
                container: 'raw',
                encoding: 'pcm_f32le',
                sample_rate: 44100
            },
            language: 'en',
            ...options
        };

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Cartesia-Version': '2026-03-01',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`TTS Error: ${response.status}`);
            }

            const audioBuffer = await response.arrayBuffer();
            return {
                audio: audioBuffer,
                format: 'pcm_f32le',
                sampleRate: 44100
            };

        } catch (error) {
            console.error('Cartesia TTS Error:', error);
            throw error;
        }
    }

    async streamingSynthesize(textStream) {
        // Process text chunks as they arrive from LLM
        const audioChunks = [];

        for await (const textChunk of textStream) {
            if (textChunk.trim()) {
                const audioResult = await this.synthesizeSpeech(textChunk);
                audioChunks.push(audioResult.audio);

                // Can start playing immediately
                this.playAudioChunk(audioResult.audio);
            }
        }

        return audioChunks;
    }

    playAudioChunk(audioBuffer) {
        // The endpoint above returns headerless mono Float32 little-endian PCM.
        // decodeAudioData() cannot decode raw PCM, so copy the samples into a
        // Web Audio AudioBuffer explicitly and schedule chunks in sequence.
        if (typeof window !== 'undefined') {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const samples = new Float32Array(audioBuffer);
            const decodedData = this.audioContext.createBuffer(1, samples.length, 44100);
            decodedData.copyToChannel(samples, 0);

            const source = this.audioContext.createBufferSource();
            source.buffer = decodedData;
            source.connect(this.audioContext.destination);

            const startAt = Math.max(this.audioContext.currentTime, this.nextStartTime);
            source.start(startAt);
            this.nextStartTime = startAt + decodedData.duration;
        }
    }
}

// Usage
const tts = new CartesiaTTS('short-lived-client-access-token');
```

## Complete End-to-End Integration Examples

### 1. Provider-neutral turn orchestrator

Provider SDKs do not share one event or media-stream interface. Keep each SDK
behind an adapter, and make the audio format part of that adapter's contract.
The orchestration below handles one finalized user turn; endpointing,
barge-in, and incremental sentence synthesis belong in transport-specific
adapters and require their own tests.

```python
from typing import Protocol


class STTAdapter(Protocol):
    async def transcribe(self, audio: bytes) -> str:
        """Return one final transcript for the adapter's documented codec."""
        ...


class LLMAdapter(Protocol):
    async def generate(self, transcript: str) -> str:
        """Return the complete assistant text for one turn."""
        ...


class TTSAdapter(Protocol):
    async def synthesize(self, text: str) -> bytes:
        """Return audio in the format agreed with the player."""
        ...


class AudioPlayer(Protocol):
    async def play(self, audio: bytes) -> None:
        """Play bytes in the TTS adapter's declared output format."""
        ...


class VoiceTurnPipeline:
    def __init__(self, stt, llm, tts, player):
        self.stt: STTAdapter = stt
        self.llm: LLMAdapter = llm
        self.tts: TTSAdapter = tts
        self.player: AudioPlayer = player

    async def process_turn(self, recorded_audio: bytes) -> dict[str, str]:
        transcript = (await self.stt.transcribe(recorded_audio)).strip()
        if not transcript:
            raise ValueError("STT returned an empty final transcript")

        response = (await self.llm.generate(transcript)).strip()
        if not response:
            raise ValueError("LLM returned an empty response")

        response_audio = await self.tts.synthesize(response)
        await self.player.play(response_audio)
        return {"transcript": transcript, "response": response}


# Supply tested adapters whose codecs and return types satisfy the protocols:
# result = await pipeline.process_turn(recorded_audio_bytes)
```

### 2. Historical OpenAI Realtime preview sketch (not for new integrations)

This block preserves the event flow used by an October 2024 preview SDK. Its model ID, import path, session schema, audio handling, and browser-auth pattern are retired and should not be copied into a new application. Start from the [current Realtime documentation](https://developers.openai.com/api/docs/guides/realtime) and a supported model such as GPT-Realtime-2.1, then measure cost and end-to-end latency for that architecture.

```javascript
// HISTORICAL, NON-RUNNABLE MIGRATION REFERENCE ONLY.
import { OpenAIRealtimeWS } from "openai/beta/realtime/ws";

class OpenAIRealtimeAgent {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            this.client = await OpenAIRealtimeWS.fromAPIKey(this.apiKey, {
                // Historical preview ID: replace with a currently supported Realtime model.
                model: "gpt-4o-realtime-preview-2024-10-01"
            });

            // Connection event handlers
            this.client.socket.on("open", () => {
                console.log("🔗 Connected to OpenAI Realtime API");
                this.isConnected = true;
                this.setupSession();
            });

            this.client.socket.on("close", () => {
                console.log("❌ Disconnected from OpenAI Realtime API");
                this.isConnected = false;
            });

            // Response handling
            this.client.on("conversation.item.input_audio_transcription.completed", (event) => {
                console.log("📝 Transcription:", event.transcript);
            });

            this.client.on("response.audio.delta", (event) => {
                // Historical example: forward each audio delta to the player
                this.playAudioDelta(event.delta);
            });

            this.client.on("response.text.delta", (event) => {
                console.log("💬 Text delta:", event.delta);
            });

            // Function calling support
            this.client.on("response.function_call_arguments.done", async (event) => {
                await this.handleFunctionCall(event);
            });

        } catch (error) {
            console.error("❌ Connection error:", error);
        }
    }

    setupSession() {
        // Configure the session
        this.client.send({
            type: "session.update",
            session: {
                modalities: ["text", "audio"],
                instructions: `You are a helpful voice assistant. 
                - Respond naturally and conversationally
                - Keep responses concise for voice interaction
                - Use function calls when needed to help users`,
                voice: "alloy",
                input_audio_format: "pcm16",
                output_audio_format: "pcm16",
                input_audio_transcription: {
                    model: "whisper-1"
                },
                turn_detection: {
                    type: "server_vad",
                    threshold: 0.5,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 800
                },
                tools: [
                    {
                        type: "function",
                        name: "get_weather",
                        description: "Get current weather information",
                        parameters: {
                            type: "object",
                            properties: {
                                location: { type: "string" }
                            },
                            required: ["location"]
                        }
                    }
                ]
            }
        });
    }

    async sendAudio(audioData) {
        if (!this.isConnected) {
            console.warn("⚠️ Not connected to Realtime API");
            return;
        }

        // Send audio data directly to the API
        this.client.send({
            type: "input_audio_buffer.append",
            audio: this.encodeAudio(audioData)
        });
    }

    async handleFunctionCall(event) {
        const { name, arguments: args } = event;

        console.log(`🔧 Function call: ${name}`, args);

        let result;
        switch (name) {
            case "get_weather":
                result = await this.getWeatherData(args.location);
                break;
            default:
                result = { error: "Unknown function" };
        }

        // Send function result back
        this.client.send({
            type: "conversation.item.create",
            item: {
                type: "function_call_output",
                call_id: event.call_id,
                output: JSON.stringify(result)
            }
        });
    }

    playAudioDelta(audioDelta) {
        // Decode base64 audio and play immediately
        const audioBuffer = atob(audioDelta);
        // Platform-specific audio playback implementation
        this.playAudioBuffer(audioBuffer);
    }

    encodeAudio(audioData) {
        // Convert audio to base64 for API
        return btoa(String.fromCharCode.apply(null, audioData));
    }

    async getWeatherData(location) {
        // Mock weather API call
        return {
            location: location,
            temperature: "72°F",
            conditions: "sunny",
            description: `It's currently 72 degrees and sunny in ${location}.`
        };
    }
}

// Usage
const agent = new OpenAIRealtimeAgent('your-openai-api-key');
await agent.connect();

// Send audio from microphone
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
            agent.sendAudio(event.data);
        };
        mediaRecorder.start(100); // Send audio every 100ms
    });
```

### 3. Telephony Integration with Twilio

Twilio bidirectional Media Streams can carry call audio to an application over
WebSocket. The media payload is headerless, base64-encoded 8 kHz mono mu-law,
not MP3. Twilio normally sends 160-byte (20 ms) inbound frames. Configure the
STT adapter for that exact format, and transcode TTS output to the same format
before sending it back. Production code must also validate Twilio webhook
signatures and define backpressure, interruption, and reconnect behavior.

```javascript
const express = require('express');
const http = require('node:http');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/media-stream' });
const publicHost = process.env.PUBLIC_HOST; // e.g. voice.example.com

if (!publicHost) throw new Error('PUBLIC_HOST is required');

app.post('/incoming', (_req, res) => {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://${publicHost}/media-stream" />
  </Connect>
</Response>`;
    res.type('text/xml').send(twiml);
});

const wait = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

class TwilioMediaSession {
    constructor(ws, onInboundMulaw) {
        this.ws = ws;
        this.onInboundMulaw = onInboundMulaw;
        this.streamSid = null;
    }

    async handle(message) {
        const event = JSON.parse(message.toString());

        if (event.event === 'start') {
            const format = event.start.mediaFormat;
            if (
                format.encoding !== 'audio/x-mulaw' ||
                format.sampleRate !== 8000 ||
                format.channels !== 1
            ) {
                throw new Error(`Unsupported Twilio media format: ${JSON.stringify(format)}`);
            }
            this.streamSid = event.start.streamSid;
        } else if (event.event === 'media' && event.media.track === 'inbound') {
            const mulaw8k = Buffer.from(event.media.payload, 'base64');
            await this.onInboundMulaw(mulaw8k);
        } else if (event.event === 'stop') {
            this.streamSid = null;
        }
    }

    async sendMulaw8k(audio) {
        if (!this.streamSid) throw new Error('Twilio stream has not started');

        // Pace headerless mu-law audio as 20 ms frames: 8,000 bytes/s × 0.02 s.
        for (let offset = 0; offset < audio.length; offset += 160) {
            const frame = audio.subarray(offset, offset + 160);
            this.ws.send(JSON.stringify({
                event: 'media',
                streamSid: this.streamSid,
                media: { payload: frame.toString('base64') }
            }));
            await wait(20);
        }
    }
}

wss.on('connection', (ws) => {
    const session = new TwilioMediaSession(ws, async (mulaw8k) => {
        // Forward each frame to a streaming STT adapter configured for
        // audio/x-mulaw, 8,000 Hz, mono. Do not pass it to a file-upload API.
        console.log(`Received ${mulaw8k.length} bytes of inbound mu-law audio`);
    });

    ws.on('message', (message) => {
        session.handle(message).catch((error) => {
            console.error('Twilio media error:', error);
            ws.close(1011, 'Media processing failed');
        });
    });
});

server.listen(3000, () => console.log('Listening on port 3000'));
```

## Advanced Integration Patterns

### 1. Semantic Caching for Cost Optimization

Semantic caching can avoid some repeated LLM calls by matching queries by intent rather than exact wording. Measure hit rate on your workload and add authorization scope, expiry, invalidation, and human review for responses that can become stale or user-specific.

```python
import asyncio
import numpy as np
import time
from openai import AsyncOpenAI
from sklearn.metrics.pairwise import cosine_similarity

class SemanticCache:
    def __init__(self, openai_client, similarity_threshold=0.85):
        self.client = openai_client
        self.cache = []  # [(embedding, query, response, timestamp)]
        self.threshold = similarity_threshold

    async def get_embedding(self, text):
        """Get embedding for text using OpenAI's embedding model"""
        response = await self.client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return np.array(response.data[0].embedding)

    async def get_cached_response(self, query):
        """Check if we have a cached response for similar queries"""
        if not self.cache:
            return None

        query_embedding = await self.get_embedding(query)

        # Calculate similarities with cached queries
        cached_embeddings = np.array([item[0] for item in self.cache])
        similarities = cosine_similarity([query_embedding], cached_embeddings)[0]

        # Find most similar cached query
        max_similarity_idx = np.argmax(similarities)
        max_similarity = similarities[max_similarity_idx]

        if max_similarity >= self.threshold:
            cached_item = self.cache[max_similarity_idx]
            print(f"🎯 Cache hit! Similarity: {max_similarity:.3f}")
            print(f"   Original query: {cached_item[1]}")
            print(f"   Current query: {query}")
            return cached_item[2]  # Return cached response

        return None

    async def add_to_cache(self, query, response):
        """Add query-response pair to cache"""
        embedding = await self.get_embedding(query)
        timestamp = time.time()

        self.cache.append((embedding, query, response, timestamp))

        # Keep cache size manageable
        if len(self.cache) > 1000:
            self.cache = self.cache[-800:]  # Keep most recent 800 items

class CachedVoiceAgent:
    def __init__(self, openai_key):
        self.client = AsyncOpenAI(api_key=openai_key)
        self.cache = SemanticCache(self.client)

    async def process_voice_input(self, transcript):
        """Process voice input with semantic caching"""

        # 1. Check cache first
        cached_response = await self.cache.get_cached_response(transcript)
        if cached_response:
            return cached_response

        # 2. Generate new response if not cached
        response = await self.client.chat.completions.create(
            model="gpt-5.6-luna",
            messages=[
                {"role": "system", "content": "You are a helpful voice assistant."},
                {"role": "user", "content": transcript}
            ],
            max_completion_tokens=150
        )

        response_text = response.choices[0].message.content

        # 3. Add to cache for future use
        await self.cache.add_to_cache(transcript, response_text)

        return response_text

async def main():
    agent = CachedVoiceAgent('your-openai-key')

    # Similar queries may hit depending on the embedding model and threshold.
    responses = []
    for query in (
        "What's the weather like?",
        "How's the weather today?",
        "Tell me about today's weather",
    ):
        responses.append(await agent.process_voice_input(query))
    print(responses)

asyncio.run(main())
```

### 2. Multi-Provider Fallback Strategy

Use adapters with the same mode and return contract. A realtime STT fallback cannot consume an already-drained stream unless the application buffers audio and can replay it; do not silently substitute a pre-recorded URL API in the middle of a live session.

```python
import asyncio


class AllProvidersFailed(RuntimeError):
    def __init__(self, service, primary_error, fallback_error):
        super().__init__(f"Both {service} providers failed")
        self.service = service
        self.primary_error = primary_error
        self.fallback_error = fallback_error


class ProviderCallError(RuntimeError):
    """An adapter-normalized provider or transport failure."""


class MultiProviderVoiceAgent:
    def __init__(
        self,
        primary_stt,
        fallback_stt,
        primary_llm,
        fallback_llm,
        primary_tts,
        fallback_tts,
    ):
        # Adapters expose transcribe(), generate(), or synthesize(). Paired
        # providers must use the same mode and return type.
        self.primary_stt = primary_stt
        self.fallback_stt = fallback_stt
        self.primary_llm = primary_llm
        self.fallback_llm = fallback_llm
        self.primary_tts = primary_tts
        self.fallback_tts = fallback_tts

        # Request and fallback monitoring
        self.provider_stats = {
            service: {
                'requests': 0,
                'primary_failures': 0,
                'fallback_usage': 0,
                'total_failures': 0,
            }
            for service in ('stt', 'llm', 'tts')
        }

    async def _call_with_fallback(
        self,
        service,
        primary_call,
        fallback_call,
        timeout_seconds,
    ):
        """Return one adapter result or raise after both providers fail."""
        stats = self.provider_stats[service]
        stats['requests'] += 1
        try:
            return await asyncio.wait_for(primary_call(), timeout_seconds)
        except (asyncio.TimeoutError, ProviderCallError) as primary_error:
            stats['primary_failures'] += 1
            stats['fallback_usage'] += 1
            try:
                return await asyncio.wait_for(fallback_call(), timeout_seconds)
            except (asyncio.TimeoutError, ProviderCallError) as fallback_error:
                stats['total_failures'] += 1
                raise AllProvidersFailed(
                    service,
                    primary_error,
                    fallback_error,
                ) from fallback_error

    async def transcribe_with_fallback(self, audio_source_factory):
        """STT fallback using a fresh/replayable source for each attempt."""
        return await self._call_with_fallback(
            'stt',
            lambda: self.primary_stt.transcribe(audio_source_factory()),
            lambda: self.fallback_stt.transcribe(audio_source_factory()),
            timeout_seconds=5.0,
        )

    async def process_llm_with_fallback(self, transcript):
        """Return one LLM adapter result or raise AllProvidersFailed."""
        return await self._call_with_fallback(
            'llm',
            lambda: self.primary_llm.generate(transcript),
            lambda: self.fallback_llm.generate(transcript),
            timeout_seconds=10.0,
        )

    async def synthesize_with_fallback(self, text):
        """Return same-format audio bytes or raise AllProvidersFailed."""
        return await self._call_with_fallback(
            'tts',
            lambda: self.primary_tts.synthesize(text),
            lambda: self.fallback_tts.synthesize(text),
            timeout_seconds=8.0,
        )

    def get_provider_health(self):
        """Monitor provider performance"""
        health_report = {}

        for service, stats in self.provider_stats.items():
            requests = stats['requests']
            failure_rate = stats['total_failures'] / requests if requests else 0
            fallback_rate = stats['fallback_usage'] / requests if requests else 0

            health_report[service] = {
                'requests': requests,
                'unrecovered_failure_rate': f"{failure_rate:.2%}",
                'fallback_usage_rate': f"{fallback_rate:.2%}",
            }

        return health_report

# Construct this class with mode-compatible adapters for the selected current
# providers, then test forced timeouts and malformed responses before launch.
# For live STT, audio_source_factory must return a fresh buffered stream.
# Catch AllProvidersFailed at the user-experience boundary; log both underlying
# errors there, then decide whether to reprompt, transfer, or end the session.
```

## Cost Optimization Strategies

The configurations below use source-linked catalog rates checked on 22 July 2026. They are billing examples, not quality rankings or quotes. Every STT option is a streaming/session product; subscription-derived TTS rows are intentionally excluded because their monthly commitments and unused credits cannot be represented by one universal per-character charge.

### Cost-Effective Provider Combinations

```python
from math import ceil, floor

CURRENT_CONFIGS = {
    'configuration_a': {
        'stt': {
            'name': 'AssemblyAI Universal-Streaming',
            'usd_per_minute': 0.0025,  # Connected session, including idle time
            'minimum_billable_seconds': 0,
            'rounding_seconds': 0,
        },
        'llm': {
            'name': 'DeepSeek V4 Flash',
            'input_usd_per_million': 0.14,  # Conservative cache-miss rate
            'output_usd_per_million': 0.28,
        },
        'tts': {
            'name': 'Amazon Polly Standard',
            'usd_per_million_characters': 4.00,
        },
    },
    'configuration_b': {
        'stt': {
            'name': 'Deepgram Nova-3 monolingual streaming',
            'usd_per_minute': 0.0048,  # Provider labels this promotional
            'minimum_billable_seconds': 0,
            'rounding_seconds': 0,
        },
        'llm': {
            'name': 'GPT-5.6 Luna',
            'input_usd_per_million': 1.00,
            'output_usd_per_million': 6.00,
            'long_context_threshold_tokens': 272_000,
            'long_input_usd_per_million': 2.00,
            'long_output_usd_per_million': 9.00,
        },
        'tts': {
            'name': 'OpenAI TTS-1',
            'usd_per_million_characters': 15.00,
        },
    },
    'configuration_c': {
        'stt': {
            'name': 'Gladia Solaria-3 realtime Starter',
            'usd_per_minute': 0.0125,
            'minimum_billable_seconds': 0,
            'rounding_seconds': 0,
        },
        'llm': {
            'name': 'Claude Sonnet 5',
            # Introductory price through 31 August 2026; refresh after that date.
            'input_usd_per_million': 2.00,
            'output_usd_per_million': 10.00,
        },
        'tts': {
            'name': 'ElevenLabs Flash v2.5',
            'usd_per_million_characters': 50.00,
        },
    },
}


def calculate_session_cost(
    config,
    duration_minutes,
    words_per_minute=130,
    assistant_speech_ratio=0.5,
    tokens_per_word=1.3,
    turns_per_minute=4,
    billable_characters_per_word=6,
    fixed_input_tokens_per_request=0,
    non_speech_output_tokens_per_request=0,
):
    """Mirror the calculator's full-history-resend cost scenario."""
    if duration_minutes <= 0:
        raise ValueError('duration_minutes must be positive')

    total_words = words_per_minute * duration_minutes
    assistant_words = total_words * assistant_speech_ratio
    user_words = total_words - assistant_words
    assistant_tokens = assistant_words * tokens_per_word
    user_tokens = user_words * tokens_per_word
    # Match JavaScript Math.round for the calculator's non-negative turn count.
    turns = max(1, floor(turns_per_minute * duration_minutes + 0.5))

    user_tokens_per_turn = user_tokens / turns
    assistant_tokens_per_turn = assistant_tokens / turns
    accumulated_input_tokens = 0
    llm_output_tokens = 0
    llm_cost = 0
    llm = config['llm']

    for turn in range(1, turns + 1):
        request_input_tokens = (
            fixed_input_tokens_per_request
            + user_tokens_per_turn * turn
            + assistant_tokens_per_turn * (turn - 1)
        )
        request_output_tokens = (
            assistant_tokens_per_turn + non_speech_output_tokens_per_request
        )
        use_long_rate = (
            llm.get('long_context_threshold_tokens') is not None
            and request_input_tokens > llm['long_context_threshold_tokens']
        )
        input_rate = (
            llm['long_input_usd_per_million']
            if use_long_rate else llm['input_usd_per_million']
        )
        output_rate = (
            llm['long_output_usd_per_million']
            if use_long_rate else llm['output_usd_per_million']
        )
        accumulated_input_tokens += request_input_tokens
        llm_output_tokens += request_output_tokens
        llm_cost += (
            request_input_tokens * input_rate
            + request_output_tokens * output_rate
        ) / 1_000_000

    raw_seconds = duration_minutes * 60
    rounding_seconds = config['stt']['rounding_seconds']
    rounded_seconds = (
        ceil(raw_seconds / rounding_seconds) * rounding_seconds
        if rounding_seconds > 0 else raw_seconds
    )
    billable_seconds = max(
        rounded_seconds,
        config['stt']['minimum_billable_seconds'],
    )
    stt_cost = config['stt']['usd_per_minute'] * billable_seconds / 60

    billable_characters = assistant_words * billable_characters_per_word
    tts_cost = (
        config['tts']['usd_per_million_characters']
        * billable_characters / 1_000_000
    )
    costs = {'stt': stt_cost, 'llm': llm_cost, 'tts': tts_cost}
    total_cost = sum(costs.values())

    return {
        'total': total_cost,
        'breakdown': costs,
        'cost_per_minute': total_cost / duration_minutes,
        'billable_stt_minutes': billable_seconds / 60,
        'llm_input_tokens': accumulated_input_tokens,
        'llm_output_tokens': llm_output_tokens,
        'tts_characters': billable_characters,
    }

# Usage
cost_analysis = calculate_session_cost(
    CURRENT_CONFIGS['configuration_a'],
    duration_minutes=10,
)

print(f"Session cost: ${cost_analysis['total']:.4f}")
print(f"Cost per minute: ${cost_analysis['cost_per_minute']:.4f}")
```

## Best Practices & Recommendations

### 1. Latency Optimization

There is no universal end-to-end latency target. Define whether you are measuring endpoint detection to first audio, microphone input to first audio, or a full turn, then set p50/p95 objectives from the task and user research. The items below are experiments to measure, not promised savings.

```python
# Latency optimization checklist
LATENCY_OPTIMIZATIONS = {
    'streaming_everywhere': {
        'description': 'Enable streaming for STT, LLM, and TTS',
        'measurement': 'Compare time to first stable transcript/token/audio and interruption behavior'
    },
    'service_placement': {
        'description': 'Keep app services near users and compatible managed-API regions',
        'measurement': 'Compare network RTT and end-to-end p50/p95 by region'
    },
    'semantic_caching': {
        'description': 'Cache common responses',
        'measurement': 'Record hit rate, lookup latency, answer freshness, and total cost'
    },
    'prompt_optimization': {
        'description': 'Keep prompts concise and context minimal',
        'measurement': 'Compare billed tokens, TTFT, task success, and tool-call accuracy'
    },
    'regional_deployment': {
        'description': 'Deploy services close to users',
        'measurement': 'Measure client-to-edge and edge-to-provider RTT in each region'
    }
}
```

### 2. Error Handling & Resilience

Retry only operations that are safe to repeat, and have each adapter classify
transient provider failures. Permanent authentication, validation, and codec
errors should escape immediately. The delay below is exponential backoff with
bounded jitter; it is not a substitute for an end-to-end turn deadline or a
circuit breaker.

```python
import asyncio
import random


class RetryableProviderError(RuntimeError):
    """Raised by an adapter only for a transient, repeatable failure."""


class RetryExhausted(RuntimeError):
    pass


async def call_with_retry(
    operation,
    *,
    attempts=3,
    timeout_seconds,
    base_delay_seconds=0.5,
):
    for attempt in range(attempts):
        try:
            return await asyncio.wait_for(operation(), timeout_seconds)
        except (asyncio.TimeoutError, RetryableProviderError) as error:
            if attempt == attempts - 1:
                raise RetryExhausted(
                    f"Operation failed after {attempts} attempts"
                ) from error

            exponential_delay = base_delay_seconds * (2 ** attempt)
            jitter = random.uniform(0, exponential_delay * 0.2)
            await asyncio.sleep(exponential_delay + jitter)


async def process_voice_turn(audio_data, transcribe, generate, synthesize):
    """Call three same-contract adapters; raise failures to the caller."""
    transcript = await call_with_retry(
        lambda: transcribe(audio_data),
        timeout_seconds=5,
    )
    transcript = transcript.strip()
    if not transcript:
        raise ValueError("STT returned an empty final transcript")

    response = await call_with_retry(
        lambda: generate(transcript),
        timeout_seconds=10,
    )
    audio_response = await call_with_retry(
        lambda: synthesize(response),
        timeout_seconds=8,
    )
    return {
        'transcript': transcript,
        'response': response,
        'audio': audio_response,
    }


# The session boundary catches RetryExhausted and chooses a tested user-facing
# action such as reprompting, transferring the call, or ending the session.
```

## Conclusion

Building production-ready voice AI agents requires careful integration of multiple AI services, with attention to latency, cost, and reliability. The examples in this guide provide practical starting points for:

- **Traditional Pipeline**: Adapter-separated STT → LLM → TTS orchestration
- **Realtime migration reference**: a retired preview flow plus a link to the current OpenAI Realtime documentation
- **Cost Optimization**: Provider selection and semantic caching
- **Production Resilience**: Multi-provider fallbacks and error handling

Key takeaways:
1. **Evaluate streaming** across the components where earlier partial results improve the user experience
2. **Measure caching** for hit rate, freshness, latency, and provider-specific read/write/storage cost
3. **Test provider fallbacks** and calculate availability from observed failures and recovery behavior; a fallback alone does not guarantee an uptime percentage
4. **Monitor billable units actively** because provider combinations use different minutes, tokens, characters, credits, and request rules
5. **Test thoroughly** with real audio conditions and network variability

The voice AI landscape changes frequently. Use the source-linked catalog at [CompareVoiceAI.com](https://comparevoiceai.com) for pricing checked on the date shown, and run your own performance tests; the site does not publish a current universal performance ranking.

---

*Want to build your own voice AI agent? Try our [Voice Agent Pricing Calculator](https://comparevoiceai.com) to estimate costs and compare different provider combinations.*
