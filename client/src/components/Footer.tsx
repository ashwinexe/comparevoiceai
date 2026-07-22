import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t-4 border-black mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Info */}
          <div>
            <h3 className="font-mono font-bold text-lg uppercase tracking-tight mb-4">
              VOICE AI PRICING CALCULATOR
            </h3>
            <p className="font-mono text-sm leading-relaxed mb-4">
              Estimate speech-to-text, language-model, text-to-speech, and infrastructure costs alongside an editable latency budget.
            </p>
            <p className="font-mono text-xs">
              Source-linked catalog verified July 22, 2026. Provider prices can change; confirm the linked source before purchasing.
            </p>
          </div>

          {/* Providers */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-mono font-bold text-md uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
              PROVIDERS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* LLM Providers */}
              <div>
                <h5 className="font-mono font-bold text-xs uppercase tracking-tight mb-3 text-gray-700">
                  LLM PROVIDERS
                </h5>
                <div className="space-y-1 font-mono text-xs">
                  <a href="https://openai.com" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    OpenAI
                  </a>
                  <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    Google
                  </a>
                  <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    Anthropic
                  </a>
                  <a href="https://meta.ai" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    Meta
                  </a>
                  <a href="https://deepseek.com" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    DeepSeek
                  </a>
                  <a href="https://mistral.ai" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    Mistral
                  </a>
                </div>
              </div>

              {/* STT Providers */}
              <div>
                <h5 className="font-mono font-bold text-xs uppercase tracking-tight mb-3 text-gray-700">
                  STT PROVIDERS
                </h5>
                <div className="space-y-1 font-mono text-xs">
                  <a href="https://openai.com" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    OpenAI
                  </a>
                  <a href="https://cloud.google.com/speech-to-text" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    Google
                  </a>
                  <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    ElevenLabs
                  </a>
                  <a href="https://aws.amazon.com/transcribe" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    AWS
                  </a>
                  <a href="https://deepgram.com" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    Deepgram
                  </a>
                  <a href="https://assemblyai.com" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    AssemblyAI
                  </a>
                </div>
              </div>

              {/* TTS Providers */}
              <div>
                <h5 className="font-mono font-bold text-xs uppercase tracking-tight mb-3 text-gray-700">
                  TTS PROVIDERS
                </h5>
                <div className="space-y-1 font-mono text-xs">
                  <a href="https://openai.com" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    OpenAI
                  </a>
                  <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    ElevenLabs
                  </a>
                  <a href="https://cartesia.ai" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    Cartesia
                  </a>
                  <a href="https://azure.microsoft.com/en-us/products/ai-services/ai-speech" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    Microsoft
                  </a>
                  <a href="https://cloud.google.com/text-to-speech" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    Google
                  </a>
                  <a href="https://aws.amazon.com/polly" target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-100 px-1 py-0.5 border-2 border-transparent hover:border-black">
                    Amazon
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-mono font-bold text-md uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
              SERVICES
            </h4>
            <div className="space-y-2 font-mono text-sm">
              <Link href="/stt/" className="block hover:bg-gray-100 p-1 border-2 border-transparent hover:border-black">
                Speech-to-Text (STT)
              </Link>
              <Link href="/tts/" className="block hover:bg-gray-100 p-1 border-2 border-transparent hover:border-black">
                Text-to-Speech (TTS)
              </Link>
              <Link href="/blog/speech-to-speech-ai-models/" className="block hover:bg-gray-100 p-1 border-2 border-transparent hover:border-black">
                Speech to Speech AI
              </Link>
              <Link href="/llm/" className="block hover:bg-gray-100 p-1 border-2 border-transparent hover:border-black">
                Large Language Models (LLM)
              </Link>
              <Link href="/providers/" className="block hover:bg-gray-100 p-1 border-2 border-transparent hover:border-black">
                Provider directory
              </Link>
              <Link href="/blog/" className="block hover:bg-gray-100 p-1 border-2 border-transparent hover:border-black">
                Engineering blog
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t-4 border-black mt-8 pt-6">
          <div className="text-center mb-4">
            <p className="font-mono text-sm mb-1 font-bold">Voice Agent Pricing Calculator</p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="font-mono text-xs mb-4 md:mb-0">
              © {new Date().getFullYear()} CompareVoiceAI | Built by <a href="https://rnikhil.com" target="_blank" rel="noopener noreferrer" className="underline hover:bg-gray-100 p-1">Nikhil R.</a>
            </p>
            <div className="flex gap-4 font-mono text-xs">
              <Link href="/privacy/" className="hover:bg-gray-100 p-2 border-2 border-transparent hover:border-black">
                Privacy Policy
              </Link>
              <Link href="/terms/" className="hover:bg-gray-100 p-2 border-2 border-transparent hover:border-black">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
