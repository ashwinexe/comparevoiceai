import { Separator } from "@/components/ui/separator";

export default function FAQ() {
  return (
    <section id="faq-section" className="bg-white border-4 border-black p-3 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 mt-4">
      <h2 className="font-mono text-xl font-bold mb-3 border-b-4 border-black pb-1 uppercase tracking-tight">FORMULA DOCUMENTATION</h2>

      <div className="space-y-3">
        {/* How Costs Are Calculated - Made more compact */}
        <div>
          <h3 className="font-mono text-md font-bold uppercase tracking-tight">How Results Are Calculated</h3>
          <div className="border-4 border-black p-2 mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-tight">LLM Input Tokens</h4>
              <p className="font-mono bg-gray-100 p-1 mt-1 overflow-x-auto text-xs">
                user_tokens × (turns + 1) / 2 + spoken_assistant_tokens × (turns - 1) / 2 + fixed_input_tokens_per_turn × turns
              </p>
              <p className="font-mono text-xs mt-1">
                One modeled turn equals one LLM request. The formula includes the full visible conversation history plus system instructions, tool definitions, or other fixed input sent on every turn. Total turns are max(1, round(turns per minute × conversation length)).
              </p>
            </div>

            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-tight">LLM Output Tokens</h4>
              <p className="font-mono bg-gray-100 p-1 mt-1 overflow-x-auto text-xs">
                spoken_assistant_tokens + non_speech_output_tokens_per_request × turns
              </p>
              <p className="font-mono text-xs mt-1">
                Spoken output comes from the assistant speech ratio. Add provider-reported reasoning or other billed, non-spoken output tokens separately.
              </p>
            </div>

            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-tight">Transcription Cost ($)</h4>
              <p className="font-mono bg-gray-100 p-1 mt-1 overflow-x-auto text-xs">
                rate_per_min × max(round_up(duration_seconds, increment_seconds), minimum_seconds) / 60
              </p>
              <p className="font-mono text-xs mt-1">
                Applies the selected streaming row's published request minimum and rounding increment once to the modeled stream. The calculator assumes the full configured conversation duration is sent and billable.
              </p>
            </div>

            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-tight">LLM Cost ($)</h4>
              <p className="font-mono bg-gray-100 p-1 mt-1 overflow-x-auto text-xs">
                sum each turn's input and output tokens × that turn's applicable base or long-context rate
              </p>
              <p className="font-mono text-xs mt-1">
                A request that crosses a structured context threshold prices that request at the provider's long-context input and output rates.
              </p>
            </div>

            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-tight">Voice Cost ($)</h4>
              <p className="font-mono bg-gray-100 p-1 mt-1 overflow-x-auto text-xs">
                cost_per_character × words_per_min × chars_per_word × assistant_speech_ratio × convo_length
              </p>
              <p className="font-mono text-xs mt-1">
                Cost for synthesizing the assistant's share of speech. The calculator UI displays the same rate per one million characters.
              </p>
            </div>

            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-tight">Hosting Cost ($)</h4>
              <p className="font-mono bg-gray-100 p-1 mt-1 overflow-x-auto text-xs">
                (vcpu_cost * convo_length) / agents_per_vcpu
              </p>
              <p className="font-mono text-xs mt-1">
                Infrastructure cost divided by the number of concurrent agents sharing resources.
              </p>
            </div>

            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-tight">Total Cost ($)</h4>
              <p className="font-mono bg-gray-100 p-1 mt-1 overflow-x-auto text-xs">
                transcription_cost + llm_cost + voice_cost + hosting_cost
              </p>
              <p className="font-mono text-xs mt-1">
                Sum of all component costs for the complete conversation.
              </p>
            </div>

            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-tight">Cost Per Minute ($)</h4>
              <p className="font-mono bg-gray-100 p-1 mt-1 overflow-x-auto text-xs">
                total_cost / convo_length
              </p>
              <p className="font-mono text-xs mt-1">
                Average cost normalized to a per-minute rate.
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-2 bg-black h-0.5" />

        {/* Latency Calculation */}
        <div>
          <h3 className="font-mono text-md font-bold uppercase tracking-tight">How Latency is Calculated</h3>
          <div className="border-4 border-black p-2 mt-2 grid grid-cols-1 gap-2">
            <div>
              <h4 className="font-mono font-bold text-xs uppercase tracking-tight">Total Voice-to-Voice Latency (ms)</h4>
              <p className="font-mono bg-gray-100 p-1 mt-1 overflow-x-auto text-xs">
                mic_input + opus_encoding + network + packet_handling + jitter_buffer + opus_decoding + 
                endpointing_and_transcription + llm_time_to_first_token + sentence_aggregation + tts_time_to_first_audio +
                opus_encoding + packet_handling + network + jitter_buffer + opus_decoding + speaker_output
              </p>
              <p className="font-mono text-xs mt-1">
                This is an editable sequential budget from voice input to first agent audio. Real streaming stages can overlap, so validate the complete path and each stage with production traces.
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-2 bg-black h-0.5" />

        <div className="mb-6">
          <h3 className="font-mono font-bold text-sm uppercase tracking-tight mb-3">Helpful Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <a 
              href="https://platform.openai.com/docs/guides/speech-to-text"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs hover:bg-gray-100 p-2 border border-gray-300 block"
            >
              OpenAI Speech-to-Text Guide →
            </a>
            <a 
              href="https://docs.anthropic.com/claude/docs/intro-to-claude"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs hover:bg-gray-100 p-2 border border-gray-300 block"
            >
              Claude LLM Documentation →
            </a>
            <a 
              href="https://developers.deepgram.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs hover:bg-gray-100 p-2 border border-gray-300 block"
            >
              Deepgram API Getting Started →
            </a>
            <a 
              href="https://docs.elevenlabs.io/api-reference/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs hover:bg-gray-100 p-2 border border-gray-300 block"
            >
              ElevenLabs API Reference →
            </a>
          </div>
        </div>

        <Separator className="my-2 bg-black h-0.5" />

        <div>
          <h3 className="font-mono font-bold text-sm uppercase tracking-tight mb-3">Cost Formula Breakdown</h3>
          <div className="border-4 border-black p-2 mt-2">
            <p className="font-mono text-xs text-gray-600">
              Calculations run locally in your browser as inputs change. The cost model covers a cascaded STT → LLM → TTS pipeline plus optional hosting. It does not separately price telephony or media transport, voice-platform fees, native speech-to-speech products, cached input, or provider-specific multichannel billing. Published prices are normalized only when a fixed USD unit is defensible; provider request minimums, subscription utilization, taxes, and add-ons can still change an invoice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
