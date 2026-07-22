import { Calculator } from "@/hooks/useCalculator";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalLinkIcon, InfoIcon, LockIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CalculationAssumptions from "./CalculationAssumptions";
import { cn } from "@/lib/utils";

interface ApiCostsProps {
  calculator: Calculator;
}

export default function ApiCosts({ calculator }: ApiCostsProps) {
  const { state, updateValue, updateProvider, llmProviders, sttProviders, ttsProviders, isLoading, isSharedView, sharedCatalogVerifiedAt } = calculator;
  const selectedLLMRecord = llmProviders.find((provider) => provider.id === state.selectedLLMProvider);
  const selectedSTTRecord = sttProviders.find((provider) => provider.id === state.selectedSTTProvider);
  const selectedTTSRecord = ttsProviders.find((provider) => provider.id === state.selectedTTSProvider);
  const selectedRecords = [
    selectedLLMRecord,
    selectedSTTRecord,
    selectedTTSRecord,
  ].filter((provider) => provider !== undefined);
  const transcriptionCostDescription = selectedSTTRecord?.billingMetric === "session_minute"
    ? "Cost per connected streaming-session minute. The calculator bills the full configured conversation duration, including idle time, under the selected row's billing basis"
    : selectedSTTRecord?.billingMetric === "audio_minute"
      ? "Cost per processed audio minute. The calculator assumes the full configured conversation duration is sent and billable; provider-side silence handling can differ"
      : "Select a fixed-minute streaming row or enter a manual rate and document its billing unit separately";

  return (
    <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="font-mono text-xl font-bold mb-4 border-b-4 border-black pb-2 text-black uppercase">API Providers & Costs</h2>
      
      <div className="space-y-4">
        {/* Provider Selection Section */}
        <div className="mb-5">
          <h3 className="font-mono text-lg font-bold mb-3 text-black uppercase">Select Providers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* LLM Provider */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="llmProvider" className="font-mono text-sm uppercase">LLM Provider</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="More information about LLM providers" className="inline-flex h-7 w-7 items-center justify-center border-2 border-transparent focus-visible:border-black focus-visible:outline-none">
                      <InfoIcon aria-hidden="true" className="h-4 w-4 text-black" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white text-black text-sm py-2 px-3 border-2 border-black w-64 font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    Select a language model provider
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                {isSharedView && (
                  <div className="absolute top-1/2 right-3 transform -translate-y-1/2 z-10">
                    <LockIcon className="h-3 w-3 text-gray-500" />
                  </div>
                )}
                <Select
                  value={state.selectedLLMProvider || undefined}
                  onValueChange={(value) => updateProvider('llm', value)}
                  disabled={isLoading || llmProviders.length === 0 || isSharedView}
                >
                  <SelectTrigger id="llmProvider" className={cn(
                    "bg-white border-2 border-black px-3 py-1 h-auto text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    isSharedView && "pr-8 bg-gray-50"
                  )}>
                    <SelectValue placeholder="Select LLM" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black rounded-none font-mono">
                    {llmProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id} className="focus:bg-green-50 focus:text-black">
                        {provider.name} ({provider.provider} · {provider.tier}{provider.status === "preview" ? " · preview" : ""})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* STT Provider */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="sttProvider" className="font-mono text-sm uppercase">STT Provider</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="More information about STT providers" className="inline-flex h-7 w-7 items-center justify-center border-2 border-transparent focus-visible:border-black focus-visible:outline-none">
                      <InfoIcon aria-hidden="true" className="h-4 w-4 text-black" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white text-black text-sm py-2 px-3 border-2 border-black w-64 font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    Select a streaming speech-to-text row. Batch and pre-recorded products remain on the comparison page but are excluded from this voice-agent total.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                {isSharedView && (
                  <div className="absolute top-1/2 right-3 transform -translate-y-1/2 z-10">
                    <LockIcon className="h-3 w-3 text-gray-500" />
                  </div>
                )}
                <Select
                  value={state.selectedSTTProvider || undefined}
                  onValueChange={(value) => updateProvider('stt', value)}
                  disabled={isLoading || sttProviders.length === 0 || isSharedView}
                >
                  <SelectTrigger id="sttProvider" className={cn(
                    "bg-white border-2 border-black px-3 py-1 h-auto text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    isSharedView && "pr-8 bg-gray-50"
                  )}>
                    <SelectValue placeholder="Select STT" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black rounded-none font-mono">
                    {sttProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id} className="focus:bg-green-50 focus:text-black">
                        {provider.name} ({provider.provider} · {provider.mode} · {provider.tier})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* TTS Provider */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="ttsProvider" className="font-mono text-sm uppercase">TTS Provider</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="More information about TTS providers" className="inline-flex h-7 w-7 items-center justify-center border-2 border-transparent focus-visible:border-black focus-visible:outline-none">
                      <InfoIcon aria-hidden="true" className="h-4 w-4 text-black" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white text-black text-sm py-2 px-3 border-2 border-black w-64 font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    Select a fixed-USD character-billed TTS row. Plan-derived, starting, runtime, native-currency, and compound-token rows stay on the comparison page.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                {isSharedView && (
                  <div className="absolute top-1/2 right-3 transform -translate-y-1/2 z-10">
                    <LockIcon className="h-3 w-3 text-gray-500" />
                  </div>
                )}
                <Select
                  value={state.selectedTTSProvider || undefined}
                  onValueChange={(value) => updateProvider('tts', value)}
                  disabled={isLoading || ttsProviders.length === 0 || isSharedView}
                >
                  <SelectTrigger id="ttsProvider" className={cn(
                    "bg-white border-2 border-black px-3 py-1 h-auto text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    isSharedView && "pr-8 bg-gray-50"
                  )}>
                    <SelectValue placeholder="Select TTS" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black rounded-none font-mono">
                    {ttsProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id} className="focus:bg-green-50 focus:text-black">
                        {provider.name} ({provider.provider} · {provider.tier}{provider.status === "preview" ? " · preview" : ""})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <h3 className="font-mono text-lg font-bold mb-1 text-black uppercase">Normalized calculator rates</h3>
        <p className="text-xs text-gray-700 mb-3">Provider selection fills ordinary public USD rates. STT choices are streaming-only; TTS subscription-derived and “starting at” rows are kept in the catalog but excluded here. All displayed rates and billing assumptions can be overridden to model a contract.</p>
        <p className="text-xs text-gray-700 mb-3">Fixed system/tool input and non-spoken output tokens default to zero because they are workload- and provider-specific. LLM input is priced at the uncached rate; catalog cache rates are informational and are not applied. Add workload-specific tokens under Calculation Assumptions when they are billed.</p>
        <p className="border-2 border-black bg-yellow-50 p-2 text-xs font-mono mb-3">Scope: this calculator models a cascaded STT → LLM → TTS pipeline. It excludes telephony and media transport, voice-platform fees, native speech-to-speech products, cache discounts, and provider-specific multichannel billing unless you incorporate them into manual inputs.</p>
        {isSharedView && (
          <p className="border-2 border-black bg-yellow-50 p-2 text-xs font-mono mb-3">
            Read-only shared calculation{sharedCatalogVerifiedAt ? ` · catalog snapshot ${sharedCatalogVerifiedAt}` : " · legacy pricing rules preserved"}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          {/* Left column */}
          <div>
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="transcriptionCost" className="font-mono text-sm uppercase">Transcription Cost/Min</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="More information about transcription cost" className="inline-flex h-7 w-7 items-center justify-center border-2 border-transparent focus-visible:border-black focus-visible:outline-none">
                      <InfoIcon aria-hidden="true" className="h-4 w-4 text-black" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white text-black text-sm py-2 px-3 border-2 border-black w-64 font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {transcriptionCostDescription}
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex relative">
                <span className="bg-white border-2 border-r-0 border-black px-2 py-1 text-sm font-mono">$</span>
                {isSharedView && (
                  <div className="absolute top-1/2 right-3 transform -translate-y-1/2 z-10">
                    <LockIcon className="h-3 w-3 text-gray-500" />
                  </div>
                )}
                <Input 
                  id="transcriptionCost"
                  type="number"
                  value={state.transcriptionCost}
                  onChange={(e) => updateValue("transcriptionCost", parseFloat(e.target.value))}
                  step="any"
                  min="0"
                  disabled={isSharedView}
                  className={cn(
                    "bg-white border-2 border-black px-2 py-1 h-auto text-sm w-full focus:outline-none focus:ring-2 focus:ring-black rounded-none font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    isSharedView && "pr-8 bg-gray-50"
                  )}
                />
              </div>
            </div>
            
            <div className="flex flex-col mt-4">
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="llmInputCost" className="font-mono text-sm uppercase">LLM Input / 1M Tokens</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="More information about LLM input cost" className="inline-flex h-7 w-7 items-center justify-center border-2 border-transparent focus-visible:border-black focus-visible:outline-none">
                      <InfoIcon aria-hidden="true" className="h-4 w-4 text-green-700" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white text-black text-sm py-2 px-3 rounded border border-gray-200 w-64 font-sans shadow-md">
                    USD per one million uncached input tokens, converted to a per-token value internally
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex relative">
                <span className="bg-white border-2 border-r-0 border-black px-2 py-1 text-sm font-mono">$</span>
                {isSharedView && (
                  <div className="absolute top-1/2 right-3 transform -translate-y-1/2 z-10">
                    <LockIcon className="h-3 w-3 text-gray-500" />
                  </div>
                )}
                <Input 
                  id="llmInputCost"
                  type="number" 
                  value={state.llmInputCost * 1_000_000}
                  onChange={(e) => updateValue("llmInputCost", (parseFloat(e.target.value) || 0) / 1_000_000)}
                  step="any"
                  min="0"
                  disabled={isSharedView}
                  className={cn(
                    "bg-white border-2 border-black px-2 py-1 h-auto text-sm w-full focus:outline-none focus:ring-2 focus:ring-black rounded-none font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    isSharedView && "pr-8 bg-gray-50"
                  )}
                />
              </div>
            </div>
            
            <div className="flex flex-col mt-4">
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="llmOutputCost" className="font-mono text-sm uppercase">LLM Output / 1M Tokens</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="More information about LLM output cost" className="inline-flex h-7 w-7 items-center justify-center border-2 border-transparent focus-visible:border-black focus-visible:outline-none">
                      <InfoIcon aria-hidden="true" className="h-4 w-4 text-green-700" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white text-black text-sm py-2 px-3 rounded border border-gray-200 w-64 font-sans shadow-md">
                    USD per one million output tokens, converted to a per-token value internally
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex relative">
                <span className="bg-white border-2 border-r-0 border-black px-2 py-1 text-sm font-mono">$</span>
                {isSharedView && (
                  <div className="absolute top-1/2 right-3 transform -translate-y-1/2 z-10">
                    <LockIcon className="h-3 w-3 text-gray-500" />
                  </div>
                )}
                <Input 
                  id="llmOutputCost"
                  type="number" 
                  value={state.llmOutputCost * 1_000_000}
                  onChange={(e) => updateValue("llmOutputCost", (parseFloat(e.target.value) || 0) / 1_000_000)}
                  step="any"
                  min="0"
                  disabled={isSharedView}
                  className={cn(
                    "bg-white border-2 border-black px-2 py-1 h-auto text-sm w-full focus:outline-none focus:ring-2 focus:ring-black rounded-none font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    isSharedView && "pr-8 bg-gray-50"
                  )}
                />
              </div>
            </div>
          </div>
          
          {/* Right column */}
          <div>
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="voiceCost" className="font-mono text-sm uppercase">Voice / 1M Characters</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="More information about voice cost" className="inline-flex h-7 w-7 items-center justify-center border-2 border-transparent focus-visible:border-black focus-visible:outline-none">
                      <InfoIcon aria-hidden="true" className="h-4 w-4 text-green-700" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white text-black text-sm py-2 px-3 rounded border border-gray-200 w-64 font-sans shadow-md">
                    USD per one million generated characters, converted to a per-character value internally
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex relative">
                <span className="bg-white border-2 border-r-0 border-black px-2 py-1 text-sm font-mono">$</span>
                {isSharedView && (
                  <div className="absolute top-1/2 right-3 transform -translate-y-1/2 z-10">
                    <LockIcon className="h-3 w-3 text-gray-500" />
                  </div>
                )}
                <Input 
                  id="voiceCost"
                  type="number" 
                  value={state.voiceCost * 1_000_000}
                  onChange={(e) => updateValue("voiceCost", (parseFloat(e.target.value) || 0) / 1_000_000)}
                  step="any"
                  min="0"
                  disabled={isSharedView}
                  className={cn(
                    "bg-white border-2 border-black px-2 py-1 h-auto text-sm w-full focus:outline-none focus:ring-2 focus:ring-black rounded-none font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    isSharedView && "pr-8 bg-gray-50"
                  )}
                />
              </div>
            </div>
            
            <div className="flex flex-col mt-4">
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="vcpuCost" className="font-mono text-sm uppercase">vCPU Cost/Minute</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="More information about vCPU cost" className="inline-flex h-7 w-7 items-center justify-center border-2 border-transparent focus-visible:border-black focus-visible:outline-none">
                      <InfoIcon aria-hidden="true" className="h-4 w-4 text-green-700" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white text-black text-sm py-2 px-3 rounded border border-gray-200 w-64 font-sans shadow-md">
                    Cost of compute resources per minute
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex relative">
                <span className="bg-white border-2 border-r-0 border-black px-2 py-1 text-sm font-mono">$</span>
                {isSharedView && (
                  <div className="absolute top-1/2 right-3 transform -translate-y-1/2 z-10">
                    <LockIcon className="h-3 w-3 text-gray-500" />
                  </div>
                )}
                <Input 
                  id="vcpuCost"
                  type="number" 
                  value={state.vcpuCost}
                  onChange={(e) => updateValue("vcpuCost", parseFloat(e.target.value))}
                  step="any"
                  min="0"
                  disabled={isSharedView}
                  className={cn(
                    "bg-white border-2 border-black px-2 py-1 h-auto text-sm w-full focus:outline-none focus:ring-2 focus:ring-black rounded-none font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    isSharedView && "pr-8 bg-gray-50"
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {state.llmContextThresholdTokens !== null && state.llmLongContextInputCost !== null && state.llmLongContextOutputCost !== null && (
          <div className="border-2 border-black bg-purple-50 p-3 mt-4">
            <h4 className="font-mono text-sm font-bold uppercase mb-1">Long-context LLM tier</h4>
            <p className="text-xs text-gray-700 mb-3">These rates replace the base LLM rates for each request whose input exceeds the selected threshold.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="llmContextThresholdTokens" className="font-mono text-xs uppercase">Threshold tokens</Label>
                <Input
                  id="llmContextThresholdTokens"
                  type="number"
                  value={state.llmContextThresholdTokens}
                  onChange={(event) => updateValue("llmContextThresholdTokens", parseFloat(event.target.value) || 0)}
                  min="0"
                  step="any"
                  disabled={isSharedView}
                  className="mt-1 bg-white border-2 border-black rounded-none font-mono h-9"
                />
              </div>
              <div>
                <Label htmlFor="llmLongContextInputCost" className="font-mono text-xs uppercase">Input / 1M tokens</Label>
                <Input
                  id="llmLongContextInputCost"
                  type="number"
                  value={state.llmLongContextInputCost * 1_000_000}
                  onChange={(event) => updateValue("llmLongContextInputCost", (parseFloat(event.target.value) || 0) / 1_000_000)}
                  min="0"
                  step="any"
                  disabled={isSharedView}
                  className="mt-1 bg-white border-2 border-black rounded-none font-mono h-9"
                />
              </div>
              <div>
                <Label htmlFor="llmLongContextOutputCost" className="font-mono text-xs uppercase">Output / 1M tokens</Label>
                <Input
                  id="llmLongContextOutputCost"
                  type="number"
                  value={state.llmLongContextOutputCost * 1_000_000}
                  onChange={(event) => updateValue("llmLongContextOutputCost", (parseFloat(event.target.value) || 0) / 1_000_000)}
                  min="0"
                  step="any"
                  disabled={isSharedView}
                  className="mt-1 bg-white border-2 border-black rounded-none font-mono h-9"
                />
              </div>
            </div>
          </div>
        )}

        <div className="border-2 border-black bg-gray-50 p-3 mt-4">
          <p className="font-mono text-xs font-bold uppercase mb-2">Official sources for selected rows</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {selectedRecords.map((provider) => (
              <a key={provider.id} href={provider.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs underline font-bold">
                {provider.provider}: {provider.name} <ExternalLinkIcon className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
        
        {/* Calculation Assumptions - Added as a collapsible section */}
        <CalculationAssumptions calculator={calculator} />
      </div>
    </div>
  );
}
