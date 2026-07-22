import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CalculatorState, CalculatorResults } from "@/lib/calculator";
import { PRICING_VERIFIED_DATE } from "@shared/providers";

/**
 * Combines multiple class values into a single string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency with 4 decimal places
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Math.abs(value) < 0.01 ? 6 : 4,
    maximumFractionDigits: 8,
  }).format(value);
}

/**
 * Formats a number with commas for thousands
 */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

/**
 * Exports data as a CSV file
 */
export function exportToCSV(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy text to clipboard
 */
export function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => resolve(true))
        .catch(() => resolve(false));
    } else {
      // Fallback for browsers that don't support the clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand("copy");
        resolve(true);
      } catch (err) {
        console.error("Failed to copy: ", err);
        resolve(false);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  });
}

/**
 * Creates a shareable URL with calculator state and results
 */
export function createShareableUrl(
  state: CalculatorState, 
  results: CalculatorResults, 
  llmProviderName?: string, 
  sttProviderName?: string, 
  ttsProviderName?: string,
  catalogVerifiedAt = PRICING_VERIFIED_DATE,
): string {
  // Create an object with the data we want to share
  const shareData = {
    version: 3,
    catalogVerifiedAt,
    state: {
      transcriptionCost: state.transcriptionCost,
      llmInputCost: state.llmInputCost,
      llmOutputCost: state.llmOutputCost,
      llmContextThresholdTokens: state.llmContextThresholdTokens,
      llmLongContextInputCost: state.llmLongContextInputCost,
      llmLongContextOutputCost: state.llmLongContextOutputCost,
      fixedInputTokensPerRequest: state.fixedInputTokensPerRequest,
      nonSpeechOutputTokensPerRequest: state.nonSpeechOutputTokensPerRequest,
      voiceCost: state.voiceCost,
      transcriptionMinimumBillableSeconds: state.transcriptionMinimumBillableSeconds,
      transcriptionRoundingSeconds: state.transcriptionRoundingSeconds,
      vcpuCost: state.vcpuCost,
      wordsPerMinute: state.wordsPerMinute,
      tokensPerWord: state.tokensPerWord,
      charsPerWord: state.charsPerWord,
      turnsPerMinute: state.turnsPerMinute,
      llmSpeechRatio: state.llmSpeechRatio,
      conversationLength: state.conversationLength,
      agentsPerVcpu: state.agentsPerVcpu,
      micInputLatency: state.micInputLatency,
      opusEncodingLatency: state.opusEncodingLatency,
      networkLatency: state.networkLatency,
      packetHandlingLatency: state.packetHandlingLatency,
      jitterBufferLatency: state.jitterBufferLatency,
      opusDecodingLatency: state.opusDecodingLatency,
      transcriptionLatency: state.transcriptionLatency,
      llmLatency: state.llmLatency,
      sentenceAggregationLatency: state.sentenceAggregationLatency,
      ttsLatency: state.ttsLatency,
      speakerOutputLatency: state.speakerOutputLatency,
    },
    results: {
      llmInputTokens: results.llmInputTokens,
      llmOutputTokens: results.llmOutputTokens,
      transcriptionTotal: results.transcriptionTotal,
      transcriptionBillableMinutes: results.transcriptionBillableMinutes,
      llmTotal: results.llmTotal,
      longContextTurns: results.longContextTurns,
      voiceTotal: results.voiceTotal,
      hostingTotal: results.hostingTotal,
      totalCost: results.totalCost,
      costPerMinute: results.costPerMinute
    },
    providers: {
      llm: state.selectedLLMProvider || llmProviderName,
      stt: state.selectedSTTProvider || sttProviderName,
      tts: state.selectedTTSProvider || ttsProviderName
    }
  };
  
  // Encode the data as a base64 string
  const bytes = new TextEncoder().encode(JSON.stringify(shareData));
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  const encodedData = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  
  // Create the URL with the data as a query parameter
  const baseUrl = window.location.origin;
  return `${baseUrl}?share=${encodedData}`;
}

/**
 * Ensures a value is within a specific range
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Ensures a value is not less than the minimum
 */
export function ensureMinimum(value: number, min: number): number {
  return Math.max(value, min);
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}
