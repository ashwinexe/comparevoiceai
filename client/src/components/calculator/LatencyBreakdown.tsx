import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { InfoIcon, PlayIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator } from "@/hooks/useCalculator";
import { calculateLatencySegments, type NumericCalculatorStateKey } from "@/lib/calculator";
import { formatNumber, cn } from "@/lib/utils";

interface LatencyBreakdownProps {
  calculator: Calculator;
}

interface LatencyStageProps {
  id: string;
  label: string;
  value: number;
  maxValue: number;
  description: string;
  onChange: (value: number) => void;
  disabled: boolean;
}

function LatencyStage({ id, label, value, maxValue, description, onChange, disabled }: LatencyStageProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1">
          <Label htmlFor={id} className="font-semibold text-xs">
            {label}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`More information about ${label}`}
                className="inline-flex h-6 w-6 items-center justify-center border-2 border-transparent focus-visible:border-black focus-visible:outline-none"
              >
                <InfoIcon aria-hidden="true" className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-black text-white text-xs py-2 px-3 rounded-none border-2 border-white w-64">
              {description}
            </TooltipContent>
          </Tooltip>
        </div>
        <span className="text-xs font-mono font-medium">{value} ms</span>
      </div>
      <div className="flex items-center gap-2 w-full">
        <Slider
          value={[value]}
          min={0}
          max={maxValue}
          step={1}
          className="latency-slider flex-grow"
          aria-label={`${label} latency`}
          aria-valuetext={`${value} milliseconds`}
          onValueChange={(values) => onChange(values[0])}
          disabled={disabled}
        />
        <Input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="bg-white border-2 border-black px-2 py-0 h-6 text-xs w-16 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono"
          min="0"
          step="1"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export default function LatencyBreakdown({ calculator }: LatencyBreakdownProps) {
  const { state, updateValue, results, isSharedView } = calculator;
  const maxLatency = 500; // For scaling the progress bars
  const [simulationState, setSimulationState] = useState<'idle' | 'waiting' | 'playing'>('idle');
  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const latencySegments = calculateLatencySegments(state);
  
  // Initialize audio elements
  useEffect(() => {
    audioRefs.current = Array.from({ length: 4 }, (_, i) => {
      const audio = new Audio(`/audiofiles/${i + 1}.wav`);
      audio.preload = "auto";
      return audio;
    });
    
    // Cleanup function to remove audio elements when component unmounts
    return () => {
      audioRefs.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);
  
  // Function to simulate latency and play sounds in sequence
  const simulateLatency = async () => {
    if (simulationState !== 'idle') return;

    const latency = results.totalLatency;
    setSimulationState('waiting');

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // Unlock each clip during the user's click gesture so delayed playback also
      // works in browsers with stricter autoplay policies.
      const unlocks = audioRefs.current.map((audio) => {
        audio.muted = true;
        const attempt = audio.play();
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
        return attempt.catch(() => undefined);
      });
      await Promise.all(unlocks);

      // Simulate the conversation with latency
      for (let i = 0; i < 4; i++) {
        // Wait for the latency period
        await wait(latency);
        
        // Update state to playing during audio playback
        setSimulationState('playing');
        
        // Play the audio
        await playAudio(audioRefs.current[i]);
        
        // Set back to waiting state unless it's the last audio
        if (i < 3) {
          setSimulationState('waiting');
        }
      }
      
      // Reset state when done
      setSimulationState('idle');
    } catch (error) {
      console.error('Error in latency simulation:', error);
      setSimulationState('idle');
    }
  };
  
  // Helper function to play audio and wait for it to complete
  const playAudio = (audio: HTMLAudioElement): Promise<void> => {
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
      };
      const handleEnded = () => {
        cleanup();
        resolve();
      };
      const handleError = () => {
        cleanup();
        reject(new Error(`Unable to play ${audio.src}`));
      };
      audio.addEventListener("ended", handleEnded, { once: true });
      audio.addEventListener("error", handleError, { once: true });
      audio.currentTime = 0;
      audio.play().catch(handleError);
    });
  };

  const latencyItems = [
    {
      id: "input",
      title: "Input Path",
      stages: [
        {
          label: "Mic Input",
          key: "micInputLatency",
          value: state.micInputLatency,
          description: "Time for audio to be processed by the operating system's audio stack"
        },
        {
          label: "Opus Encoding",
          key: "opusEncodingLatency",
          value: state.opusEncodingLatency,
          description: "Time to compress audio using the Opus codec"
        },
        {
          label: "Network Transit",
          key: "networkLatency",
          value: state.networkLatency,
          description: "Time for data packets to travel across the network"
        },
        {
          label: "Packet Handling",
          key: "packetHandlingLatency",
          value: state.packetHandlingLatency,
          description: "Server processing time for incoming packets"
        },
        {
          label: "Jitter Buffer",
          key: "jitterBufferLatency",
          value: state.jitterBufferLatency,
          description: "Buffer time to ensure smooth audio despite network variations"
        },
        {
          label: "Opus Decoding",
          key: "opusDecodingLatency",
          value: state.opusDecodingLatency,
          description: "Time to decompress the audio"
        }
      ]
    },
    {
      id: "processing",
      title: "AI Processing",
      stages: [
        {
          label: "Transcription & Endpointing",
          key: "transcriptionLatency",
          value: state.transcriptionLatency,
          description: "Time to convert speech to text and detect the end of a phrase"
        },
        {
          label: "LLM Time to First Token",
          key: "llmLatency",
          value: state.llmLatency,
          description: "Time to first token from the large language model"
        },
        {
          label: "Sentence Aggregation",
          key: "sentenceAggregationLatency",
          value: state.sentenceAggregationLatency,
          description: "Processing time to form complete sentences"
        },
        {
          label: "TTS Time to First Audio",
          key: "ttsLatency",
          value: state.ttsLatency,
          description: "Time from sending text to receiving the first playable audio from text-to-speech"
        }
      ]
    },
    {
      id: "output",
      title: "Output Path",
      stages: [
        {
          label: "Opus Encoding",
          key: "opusEncodingLatency",
          value: state.opusEncodingLatency,
          description: "Time to compress the response audio using the Opus codec"
        },
        {
          label: "Packet Handling",
          key: "packetHandlingLatency",
          value: state.packetHandlingLatency,
          description: "Server processing time for outgoing packets"
        },
        {
          label: "Network Transit",
          key: "networkLatency",
          value: state.networkLatency,
          description: "Time for response data to travel back across the network"
        },
        {
          label: "Jitter Buffer",
          key: "jitterBufferLatency",
          value: state.jitterBufferLatency,
          description: "Client-side buffer to ensure smooth audio playback"
        },
        {
          label: "Opus Decoding",
          key: "opusDecodingLatency",
          value: state.opusDecodingLatency,
          description: "Time to decompress the audio response"
        },
        {
          label: "Speaker Output",
          key: "speakerOutputLatency",
          value: state.speakerOutputLatency,
          description: "Time for audio to be processed by the device and played through speakers"
        }
      ]
    }
  ] satisfies Array<{
    id: string;
    title: string;
    stages: Array<{ label: string; key: NumericCalculatorStateKey; value: number; description: string }>;
  }>;

  return (
    <div className="bg-white border-4 border-black p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 mb-4">
      <h2 className="font-mono text-xl font-bold mb-2 border-b-4 border-[#FFDE59] pb-2">LATENCY BUDGET & AUDIO SIMULATOR</h2>
      <p className="text-sm mb-4">Enter measurements from your own regions and providers. These defaults are illustrative assumptions, not live latency benchmarks.</p>
      
      <div className="mb-6 border-4 border-black p-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-6">
          <span className="font-bold text-lg">Total Voice-to-Voice Latency:</span>
          <div className="flex items-center gap-3">
            <Button 
              onClick={simulateLatency}
              disabled={simulationState !== 'idle'}
              className="font-mono text-xs font-bold border-2 border-black py-1 px-3 transition-all duration-200 bg-white text-black rounded-none h-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase"
            >
              {simulationState === 'idle' ? (
                <>
                  <PlayIcon className="mr-1 h-3 w-3" /> Simulate
                </>
              ) : simulationState === 'waiting' ? (
                'Waiting for bot!'
              ) : (
                'Playing...'
              )}
            </Button>
            <span className={cn(
              "font-bold text-2xl font-mono"
            )} aria-live="polite">
              {formatNumber(results.totalLatency)} ms
            </span>
          </div>
        </div>
        
        {/* Calculate segment latencies */}
        {(() => {
          const inputLatency = latencySegments.input;
          const processingLatency = latencySegments.processing;
          const outputLatency = latencySegments.output;
          
          // Calculate percentages for width
          const totalWidth = Math.min((results.totalLatency / 1200) * 100, 100);
          const inputPercentage = results.totalLatency > 0 ? (inputLatency / results.totalLatency) * totalWidth : 0;
          const processingPercentage = results.totalLatency > 0 ? (processingLatency / results.totalLatency) * totalWidth : 0;
          const outputPercentage = results.totalLatency > 0 ? (outputLatency / results.totalLatency) * totalWidth : 0;
          
          return (
            <>
              <div className="relative h-10 w-full overflow-hidden bg-gray-200 border-2 border-black">
                <div 
                  className="absolute left-0 h-full bg-blue-400 transition-all"
                  style={{ width: `${inputPercentage}%` }}
                  title={`Input Path: ${formatNumber(inputLatency)} ms`}
                />
                <div 
                  className="absolute h-full bg-purple-500 transition-all"
                  style={{ left: `${inputPercentage}%`, width: `${processingPercentage}%` }}
                  title={`AI Processing: ${formatNumber(processingLatency)} ms`}
                />
                <div 
                  className="absolute h-full bg-teal-500 transition-all"
                  style={{ left: `${inputPercentage + processingPercentage}%`, width: `${outputPercentage}%` }}
                  title={`Output Path: ${formatNumber(outputLatency)} ms`}
                />
              </div>
              
              {/* Color legend */}
              <div className="flex flex-wrap gap-x-6 text-xs mt-4 mb-2 font-mono">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-400 mr-2 border border-black"></div>
                  <span>Input Path: {formatNumber(inputLatency)} ms</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 mr-2 border border-black"></div>
                  <span>AI Processing: {formatNumber(processingLatency)} ms</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-teal-500 mr-2 border border-black"></div>
                  <span>Output Path: {formatNumber(outputLatency)} ms</span>
                </div>
              </div>
            </>
          );
        })()}
        
        <p className="text-xs mt-6 pt-3 border-t-2 border-black">The simulator inserts the calculated delay before each local sample clip. It does not call or benchmark any provider.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {latencyItems.map((item, index) => {
          // Define color styles based on the item's id
          const borderColor = 
            item.id === "input" ? "border-blue-400" : 
            item.id === "processing" ? "border-purple-500" : 
            "border-teal-500";
          
          const titleColor = 
            item.id === "input" ? "text-blue-700 border-b-4 border-blue-400" : 
            item.id === "processing" ? "text-purple-700 border-b-4 border-purple-500" : 
            "text-teal-700 border-b-4 border-teal-500";
            
          return (
            <div key={item.id} className={`border-4 border-black bg-white p-4 ${borderColor} shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]`}>
              <h3 className={`text-base font-bold mb-5 pb-1 ${titleColor}`}>{item.title}</h3>
              <div className="space-y-1">
                {item.stages.map((stage) => (
                  <LatencyStage
                    key={stage.key}
                    id={`${item.id}-${stage.key}`}
                    label={stage.label}
                    value={stage.value}
                    maxValue={maxLatency}
                    description={stage.description}
                    onChange={(value) => updateValue(stage.key, value)}
                    disabled={isSharedView}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 border-4 border-black bg-gray-100">
        <p className="mb-2 font-bold">About Voice-to-Voice Latency:</p>
        <p className="font-mono text-sm">
          This editable budget adds the configured capture, codec, network, buffering, combined endpointing/STT, LLM time to first token, sentence aggregation, TTS time to first audio, and playback stages as a sequential estimate. Real streaming stages can overlap, so measure the complete path and its individual stages in production rather than treating these illustrative defaults as a benchmark.
        </p>
      </div>
    </div>
  );
}
