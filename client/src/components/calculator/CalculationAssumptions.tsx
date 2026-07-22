import { Calculator } from "@/hooks/useCalculator";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, LockIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface CalculationAssumptionsProps {
  calculator: Calculator;
}

// Component for input field with tooltip
function ParameterInput({ 
  id, 
  label, 
  tooltip, 
  value, 
  onChange, 
  step = "1", 
  min = "1", 
  max, 
  suffix,
  prefix,
  disabled = false
}: { 
  id: string;
  label: string;
  tooltip: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
  min?: string;
  max?: string;
  suffix?: string;
  prefix?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col mb-1">
      <div className="flex justify-between items-center mb-1">
        <Label htmlFor={id} className="font-mono text-xs uppercase">{label}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={`More information about ${label}`}
              className="inline-flex h-6 w-6 items-center justify-center border-2 border-transparent focus-visible:border-black focus-visible:outline-none"
            >
              <InfoIcon aria-hidden="true" className="h-3.5 w-3.5 text-black" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-white text-black text-sm py-2 px-3 border-2 border-black w-64 font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex relative">
        {prefix && <span className="bg-white border-2 border-r-0 border-black px-1 py-0.5 text-xs font-mono h-8 flex items-center">{prefix}</span>}
        {disabled && (
          <div className="absolute top-1/2 right-1 transform -translate-y-1/2 z-10">
            <LockIcon className="h-3 w-3 text-gray-500" />
          </div>
        )}
        <Input 
          id={id}
          type="number" 
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          className={cn(
            "bg-white border-2 border-black px-1 py-0.5 h-8 text-xs w-full focus:outline-none focus:ring-1 focus:ring-black rounded-none font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
            disabled && suffix ? "pr-6" : disabled ? "pr-6 bg-gray-50" : ""
          )}
        />
        {suffix && <span className="bg-white border-2 border-l-0 border-black px-1 py-0.5 text-xs font-mono h-8 flex items-center">{suffix}</span>}
      </div>
    </div>
  );
}

export default function CalculationAssumptions({ calculator }: CalculationAssumptionsProps) {
  const { state, updateValue, isSharedView } = calculator;

  return (
    <Accordion type="single" collapsible defaultValue="parameters" className="border-0 mt-5">
      <AccordionItem value="parameters" className="border-0">
        <AccordionTrigger className="font-mono text-md font-bold py-2 px-3 border-2 border-black bg-white hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
          Calculation Assumptions
        </AccordionTrigger>
        <AccordionContent>
          <div className="pt-4 border-2 border-t-0 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {/* Conversation Parameters - Grid layout with 2-3 columns */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
              <ParameterInput 
                id="conversationLength"
                label="Conversation Length"
                tooltip="Duration of the conversation in minutes"
                value={state.conversationLength}
                onChange={(value) => updateValue("conversationLength", value)}
                step="0.1"
                min="0.1"
                suffix="min"
                disabled={isSharedView}
              />
              
              <ParameterInput 
                id="agentsPerVcpu"
                label="Agents Per vCPU"
                tooltip="Number of agent processes that can run on a single vCPU"
                value={state.agentsPerVcpu}
                onChange={(value) => updateValue("agentsPerVcpu", value)}
                disabled={isSharedView}
              />
              
              <ParameterInput 
                id="wordsPerMinute"
                label="Words Per Minute"
                tooltip="Average number of words spoken per minute"
                value={state.wordsPerMinute}
                onChange={(value) => updateValue("wordsPerMinute", value)}
                disabled={isSharedView}
              />
              
              <ParameterInput 
                id="tokensPerWord"
                label="Tokens Per Word"
                tooltip="Average number of tokens used to represent one word"
                value={state.tokensPerWord}
                onChange={(value) => updateValue("tokensPerWord", value)}
                step="0.1"
                min="0.1"
                disabled={isSharedView}
              />
              
              <ParameterInput 
                id="charsPerWord"
                label="Characters/Word"
                tooltip="Average billable TTS characters per spoken word, including spaces, punctuation, or markup when the provider counts them"
                value={state.charsPerWord}
                onChange={(value) => updateValue("charsPerWord", value)}
                disabled={isSharedView}
              />
              
              <ParameterInput 
                id="turnsPerMinute"
                label="Turns Per Minute"
                tooltip="Average conversation turns per minute. Total turns are rounded to the nearest whole number, with a minimum of one turn per conversation."
                value={state.turnsPerMinute}
                onChange={(value) => updateValue("turnsPerMinute", value)}
                step="0.1"
                min="0.1"
                disabled={isSharedView}
              />
              
              <ParameterInput 
                id="llmSpeechRatio"
                label="LLM Speech Ratio"
                tooltip="Proportion of time the LLM speaks (0.5 means LLM speaks 50% of the time)"
                value={state.llmSpeechRatio}
                onChange={(value) => updateValue("llmSpeechRatio", value)}
                step="0.1"
                min="0"
                max="1"
                disabled={isSharedView}
              />

              <ParameterInput
                id="fixedInputTokensPerRequest"
                label="Fixed Input Tokens/Turn"
                tooltip="System instructions, tool definitions, and other input tokens sent on every LLM request. Set to zero only when there is no fixed prompt overhead."
                value={state.fixedInputTokensPerRequest}
                onChange={(value) => updateValue("fixedInputTokensPerRequest", value)}
                min="0"
                disabled={isSharedView}
              />

              <ParameterInput
                id="nonSpeechOutputTokensPerRequest"
                label="Extra Output Tokens/Turn"
                tooltip="Billed output tokens not represented by spoken words, such as provider-reported reasoning tokens. These are billed but are not added to later visible conversation context."
                value={state.nonSpeechOutputTokensPerRequest}
                onChange={(value) => updateValue("nonSpeechOutputTokensPerRequest", value)}
                min="0"
                disabled={isSharedView}
              />

              <ParameterInput
                id="transcriptionMinimumBillableSeconds"
                label="STT Request Minimum"
                tooltip="Minimum billable duration for one transcription request. Model multiple requests separately when each request has its own minimum."
                value={state.transcriptionMinimumBillableSeconds}
                onChange={(value) => updateValue("transcriptionMinimumBillableSeconds", value)}
                min="0"
                suffix="sec"
                disabled={isSharedView}
              />

              <ParameterInput
                id="transcriptionRoundingSeconds"
                label="STT Billing Increment"
                tooltip="Duration increment used to round this transcription request up before applying its request minimum. Zero disables rounding."
                value={state.transcriptionRoundingSeconds}
                onChange={(value) => updateValue("transcriptionRoundingSeconds", value)}
                min="0"
                suffix="sec"
                disabled={isSharedView}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
