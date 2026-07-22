import { useState } from "react";
import { Calculator } from "@/hooks/useCalculator";
import { DownloadIcon, HelpCircleIcon, Share2Icon, TwitterIcon, LinkedinIcon, CheckIcon } from "lucide-react";
import { formatNumber, formatCurrency, exportToCSV, copyToClipboard, createShareableUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PRICING_VERIFIED_DATE } from "@shared/providers";
import CostChart from "./CostChart";

interface ResultsProps {
  calculator: Calculator;
}

export default function Results({ calculator }: ResultsProps) {
  const { state, results, llmProviders, sttProviders, ttsProviders, sharedCatalogVerifiedAt } = calculator;
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const selectedLLMProvider = llmProviders.find((provider) => provider.id === state.selectedLLMProvider);
  const selectedSTTProvider = sttProviders.find((provider) => provider.id === state.selectedSTTProvider);
  const selectedTTSProvider = ttsProviders.find((provider) => provider.id === state.selectedTTSProvider);
  const selectedLongContextInput = selectedLLMProvider?.longContextInputCostPerMillion !== undefined
    ? selectedLLMProvider.longContextInputCostPerMillion / 1_000_000
    : null;
  const selectedLongContextOutput = selectedLLMProvider?.longContextOutputCostPerMillion !== undefined
    ? selectedLLMProvider.longContextOutputCostPerMillion / 1_000_000
    : null;
  const llmRatesMatchCatalog = Boolean(
    selectedLLMProvider &&
    state.llmInputCost === selectedLLMProvider.inputCost &&
    state.llmOutputCost === selectedLLMProvider.outputCost &&
    state.llmContextThresholdTokens === (selectedLLMProvider.contextThresholdTokens ?? null) &&
    state.llmLongContextInputCost === selectedLongContextInput &&
    state.llmLongContextOutputCost === selectedLongContextOutput,
  );
  const sttRatesMatchCatalog = Boolean(
    selectedSTTProvider &&
    state.transcriptionCost === selectedSTTProvider.costPerMinute &&
    state.transcriptionMinimumBillableSeconds === (selectedSTTProvider.minimumBillableSeconds ?? 0) &&
    state.transcriptionRoundingSeconds === (selectedSTTProvider.roundingSeconds ?? 0),
  );
  const ttsRatesMatchCatalog = Boolean(
    selectedTTSProvider && state.voiceCost === selectedTTSProvider.costPerCharacter,
  );
  const sttBillingUnit = selectedSTTProvider?.billingMetric === "session_minute"
    ? "connected streaming-session minute"
    : selectedSTTProvider?.billingMetric === "audio_minute"
      ? "processed audio minute"
      : "manual or unavailable";
  const hasManualRateOverride = !llmRatesMatchCatalog || !sttRatesMatchCatalog || !ttsRatesMatchCatalog;

  const handleExport = () => {
    const csvContent = [
      "Parameter,Value",
      `Catalog Verified,${sharedCatalogVerifiedAt ?? PRICING_VERIFIED_DATE}`,
      `Rate Attribution,${hasManualRateOverride ? "One or more rates or billing rules are manual overrides; selected-row sources are references only" : "All exported provider rates and billing rules match the selected catalog rows"}`,
      `LLM Provider ID,${state.selectedLLMProvider ?? "historical/unavailable"}`,
      `LLM Provider Name,${selectedLLMProvider?.name ?? "historical/unavailable"}`,
      `LLM Selected Row Source,${selectedLLMProvider?.sourceUrl ?? "unavailable"}`,
      `LLM Rates Match Selected Catalog Row,${llmRatesMatchCatalog}`,
      `STT Provider ID,${state.selectedSTTProvider ?? "historical/unavailable"}`,
      `STT Provider Name,${selectedSTTProvider?.name ?? "historical/unavailable"}`,
      `STT Selected Row Source,${selectedSTTProvider?.sourceUrl ?? "unavailable"}`,
      `STT Rates Match Selected Catalog Row,${sttRatesMatchCatalog}`,
      `STT Billing Unit,${sttBillingUnit}`,
      `TTS Provider ID,${state.selectedTTSProvider ?? "historical/unavailable"}`,
      `TTS Provider Name,${selectedTTSProvider?.name ?? "historical/unavailable"}`,
      `TTS Selected Row Source,${selectedTTSProvider?.sourceUrl ?? "unavailable"}`,
      `TTS Rates Match Selected Catalog Row,${ttsRatesMatchCatalog}`,
      `Transcription Cost Per Minute,${state.transcriptionCost}`,
      `Transcription Minimum Billable Seconds,${state.transcriptionMinimumBillableSeconds}`,
      `Transcription Rounding Seconds,${state.transcriptionRoundingSeconds}`,
      `LLM Input Token Cost,${state.llmInputCost}`,
      `LLM Output Token Cost,${state.llmOutputCost}`,
      `LLM Long-context Threshold,${state.llmContextThresholdTokens ?? "disabled"}`,
      `LLM Long-context Input Token Cost,${state.llmLongContextInputCost ?? "disabled"}`,
      `LLM Long-context Output Token Cost,${state.llmLongContextOutputCost ?? "disabled"}`,
      `Fixed Input Tokens Per Request,${state.fixedInputTokensPerRequest}`,
      `Non-speech Output Tokens Per Request,${state.nonSpeechOutputTokensPerRequest}`,
      `Voice Model Cost Per Character,${state.voiceCost}`,
      `vCPU Cost Per Minute,${state.vcpuCost}`,
      `Spoken Words Per Minute,${state.wordsPerMinute}`,
      `Tokens Per Word,${state.tokensPerWord}`,
      `Characters Per Word,${state.charsPerWord}`,
      `Turns Per Minute,${state.turnsPerMinute}`,
      `LLM vs User Speech Ratio,${state.llmSpeechRatio}`,
      `Conversation Length,${state.conversationLength}`,
      `Agents Per vCPU,${state.agentsPerVcpu}`,
      `Mic Input Latency (ms),${state.micInputLatency}`,
      `Opus Encoding Latency Per Direction (ms),${state.opusEncodingLatency}`,
      `Network Latency Per Direction (ms),${state.networkLatency}`,
      `Packet Handling Latency Per Direction (ms),${state.packetHandlingLatency}`,
      `Jitter Buffer Latency Per Direction (ms),${state.jitterBufferLatency}`,
      `Opus Decoding Latency Per Direction (ms),${state.opusDecodingLatency}`,
      `Transcription and Endpointing Latency (ms),${state.transcriptionLatency}`,
      `LLM Time to First Token (ms),${state.llmLatency}`,
      `Sentence Aggregation Latency (ms),${state.sentenceAggregationLatency}`,
      `TTS Time to First Audio (ms),${state.ttsLatency}`,
      `Speaker Output Latency (ms),${state.speakerOutputLatency}`,
      "",
      "Results,Value",
      `Billed Input Tokens,${results.llmInputTokens}`,
      `Billed Output Tokens,${results.llmOutputTokens}`,
      `Transcription Cost,${results.transcriptionTotal}`,
      `Transcription Billable Minutes,${results.transcriptionBillableMinutes}`,
      `LLM Cost,${results.llmTotal}`,
      `Long-context Turns,${results.longContextTurns}`,
      `Voice Cost,${results.voiceTotal}`,
      `Hosting Cost,${results.hostingTotal}`,
      `Total Cost,${results.totalCost}`,
      `Cost Per Minute,${results.costPerMinute}`,
      `Total Latency (ms),${results.totalLatency}`
    ].join("\n");
    
    exportToCSV(csvContent, "voice_agent_pricing.csv");
  };

  const handleShare = async () => {
    const llmProviderName = selectedLLMProvider ? selectedLLMProvider.name : undefined;
    const sttProviderName = selectedSTTProvider ? selectedSTTProvider.name : undefined;
    const ttsProviderName = selectedTTSProvider ? selectedTTSProvider.name : undefined;
    
    // Create the shareable URL
    const shareUrl = createShareableUrl(
      state, 
      results, 
      llmProviderName,
      sttProviderName,
      ttsProviderName,
      sharedCatalogVerifiedAt ?? PRICING_VERIFIED_DATE,
    );
    
    // Copy the URL to clipboard
    const copied = await copyToClipboard(shareUrl);
    
    if (copied) {
      setIsCopied(true);
      toast({
        title: "URL Copied!",
        description: "The shareable URL has been copied to your clipboard.",
        duration: 3000,
      });
      
      // Reset copied state after 3 seconds
      setTimeout(() => setIsCopied(false), 3000);
    } else {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const shareOnTwitter = async () => {
    const text = `Check out my voice agent pricing calculation results! Total cost: ${formatCurrency(results.totalCost)} for a ${state.conversationLength}-minute conversation.`;
    
    const url = createShareableUrl(
      state,
      results,
      selectedLLMProvider?.name,
      selectedSTTProvider?.name,
      selectedTTSProvider?.name,
      sharedCatalogVerifiedAt ?? PRICING_VERIFIED_DATE,
    );
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnLinkedIn = () => {
    const text = `Check out my voice agent pricing calculation results! Total cost: ${formatCurrency(results.totalCost)} for a ${state.conversationLength}-minute conversation.`;
    
    const url = createShareableUrl(
      state,
      results,
      selectedLLMProvider?.name,
      selectedSTTProvider?.name,
      selectedTTSProvider?.name,
      sharedCatalogVerifiedAt ?? PRICING_VERIFIED_DATE,
    );
    
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, '_blank');
  };

  return (
    <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-full">
      <div className="flex justify-between items-center mb-4 border-b-4 border-black pb-2">
        <h2 className="font-mono text-xl font-bold text-black uppercase">Results</h2>
        <Button 
          asChild
          className="font-mono text-xs font-bold border-2 border-black py-1 px-3 transition-all duration-200 bg-white text-black rounded-none h-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <a href="#faq-section">
            <HelpCircleIcon className="mr-1 h-3 w-3" /> VIEW DOCS
          </a>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Total Costs Section - Dashboard Style */}
        <div className="bg-black p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-2 border-black p-3 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-mono font-bold bg-black text-white py-1 mb-2 uppercase">Total Cost</p>
              <p className="text-2xl font-mono font-bold">{formatCurrency(results.totalCost)}</p>
            </div>
            <div className="bg-white border-2 border-black p-3 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-mono font-bold bg-black text-white py-1 mb-2 uppercase">Cost Per Minute</p>
              <p className="text-2xl font-mono font-bold">{formatCurrency(results.costPerMinute)}</p>
              <p className="text-[10px] font-mono italic text-right mt-1">Actual invoices may differ.</p>
            </div>
          </div>
        </div>
        
        {/* Pie Chart - Made Larger */}
        <div className="border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-mono font-bold mb-3 text-center text-black uppercase bg-black text-white py-1">Cost Breakdown</p>
          <div className="h-[180px]">
            <CostChart results={results} />
          </div>
        </div>
        
        {/* Itemized Costs - Dashboard Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border-2 border-black p-3 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-mono font-bold bg-black text-white py-1 mb-2 uppercase">Transcription</p>
            <p className="text-sm font-mono font-bold">{formatCurrency(results.transcriptionTotal)}</p>
            <p className="text-[10px] font-mono mt-1">{results.transcriptionBillableMinutes.toFixed(3)} billable min</p>
          </div>
          <div className="bg-white border-2 border-black p-3 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-mono font-bold bg-black text-white py-1 mb-2 uppercase">LLM</p>
            <p className="text-sm font-mono font-bold">{formatCurrency(results.llmTotal)}</p>
            {results.longContextTurns > 0 && <p className="text-[10px] font-mono mt-1">{results.longContextTurns} long-context turns</p>}
          </div>
          <div className="bg-white border-2 border-black p-3 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-mono font-bold bg-black text-white py-1 mb-2 uppercase">Voice</p>
            <p className="text-sm font-mono font-bold">{formatCurrency(results.voiceTotal)}</p>
          </div>
          <div className="bg-white border-2 border-black p-3 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-mono font-bold bg-black text-white py-1 mb-2 uppercase">Hosting</p>
            <p className="text-sm font-mono font-bold">{formatCurrency(results.hostingTotal)}</p>
          </div>
        </div>
        
        {/* Token Information */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border-2 border-black p-3 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-mono font-bold bg-black text-white py-1 mb-2 uppercase">Billed Input Tokens</p>
            <p className="text-lg font-mono font-bold">{formatNumber(Math.round(results.llmInputTokens))}</p>
          </div>
          <div className="bg-white border-2 border-black p-3 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-mono font-bold bg-black text-white py-1 mb-2 uppercase">Billed Output Tokens</p>
            <p className="text-lg font-mono font-bold">{formatNumber(Math.round(results.llmOutputTokens))}</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-3 flex-wrap">
          <Button 
            onClick={handleExport}
            className="font-mono text-xs font-bold border-2 border-black py-2 px-4 transition-all duration-200 bg-white text-black rounded-none h-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase"
          >
            <DownloadIcon className="mr-1 h-3 w-3" /> Export CSV
          </Button>
          
          <Button 
            onClick={handleShare}
            className="font-mono text-xs font-bold border-2 border-black py-2 px-4 transition-all duration-200 bg-black text-white rounded-none h-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase"
          >
            {isCopied ? (
              <>
                <CheckIcon className="mr-1 h-3 w-3" /> Copied!
              </>
            ) : (
              <>
                <Share2Icon className="mr-1 h-3 w-3" /> Share
              </>
            )}
          </Button>
          
          <Button 
            onClick={shareOnTwitter}
            className="font-mono text-xs font-bold border-2 border-black py-2 px-4 transition-all duration-200 bg-white text-black rounded-none h-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase"
          >
            <TwitterIcon className="mr-1 h-3 w-3" /> Twitter
          </Button>
          
          <Button 
            onClick={shareOnLinkedIn}
            className="font-mono text-xs font-bold border-2 border-black py-2 px-4 transition-all duration-200 bg-white text-black rounded-none h-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase"
          >
            <LinkedinIcon className="mr-1 h-3 w-3" /> LinkedIn
          </Button>
        </div>
      </div>
    </div>
  );
}
