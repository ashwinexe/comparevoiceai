import { useCalculator } from "@/hooks/useCalculator";
import ApiCosts from "./ApiCosts";
import Results from "./Results";
import LatencyBreakdown from "./LatencyBreakdown";
import FAQ from "./FAQ";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, LinkIcon, BookIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { siteContent } from "@shared/site-content";

export default function Calculator() {
  const calculator = useCalculator();

  // Reset shared URL (remove the share parameter)
  const resetSharedView = () => {
    window.history.pushState({}, document.title, window.location.pathname);
    window.location.reload();
  };

  return (
    <>
      {/* Header - Neo-brutalist style with original logo */}
      <header className="mb-3">
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 mb-4 flex items-center justify-center gap-4">
          <h1 className="font-mono text-3xl md:text-4xl font-bold text-center text-black uppercase tracking-tight mb-0">{siteContent.home.h1}</h1>
          {/* Voice wave visualization icon */}
          <div className="w-16 h-16 rounded-none border-4 border-black bg-white p-1 flex justify-center items-center">
            <svg aria-hidden="true" width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="64" height="64" fill="#5E17EB" />
              <path d="M32 12V52" stroke="black" strokeWidth="4" />
              <path d="M24 18V46" stroke="black" strokeWidth="4" />
              <path d="M16 24V40" stroke="black" strokeWidth="4" />
              <path d="M8 28V36" stroke="black" strokeWidth="4" />
              <path d="M40 18V46" stroke="black" strokeWidth="4" />
              <path d="M48 24V40" stroke="black" strokeWidth="4" />
              <path d="M56 28V36" stroke="black" strokeWidth="4" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-2xl text-center font-mono font-bold tracking-tight mb-2">Calculate the total cost and latency of running voice AI conversations</p>
          <p className="text-sm text-center max-w-3xl mb-4">Static, source-linked pricing snapshot verified July 22, 2026. This calculator estimates a cascaded STT → LLM → TTS pipeline; telephony, platform fees, native speech-to-speech billing, cache discounts, taxes, negotiated rates, and other add-ons are excluded unless manually incorporated.</p>

          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <Link href="/providers/" className="flex items-center px-4 py-2 bg-[#5E17EB] text-white font-medium border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0)] transition-all">
              VIEW PRICING SOURCES
            </Link>
            <Link href="/blog/" className="flex items-center px-4 py-2 bg-white text-black font-medium border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0)] transition-all">
              <BookIcon className="mr-2 h-4 w-4" /> READ THE BLOG
            </Link>
          </div>
          
        </div>

        {/* Shared View Alert */}
        {calculator.isSharedView && (
          <Alert className="my-4 border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-white">
            <InfoIcon className="h-5 w-5 text-[#5E17EB]" />
            <AlertTitle className="font-['Space_Grotesk'] font-bold text-md">Shared Results View</AlertTitle>
            <AlertDescription className="flex flex-col space-y-2">
              <p>You're viewing a shared calculation. The parameters can't be modified in this view.</p>
              <Button 
                onClick={resetSharedView}
                className="self-start font-['Space_Grotesk'] text-xs font-bold border-2 border-black py-1 px-2 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-[#5E17EB] text-white rounded-none h-auto"
              >
                <LinkIcon className="mr-1 h-3 w-3" /> CREATE YOUR OWN CALCULATION
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </header>

      {/* Top Row: API Costs and Results side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" style={{ minHeight: '400px' }}>
        {/* API Costs */}
        <section>
          <ApiCosts calculator={calculator} />
        </section>

        {/* Results Section */}
        <section>
          <Results calculator={calculator} />
        </section>
      </div>

      {/* Latency Breakdown Section */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <section>
          <LatencyBreakdown calculator={calculator} />
        </section>
      </div>
      <picture>
        <source srcSet="/img/voiceaiflow.webp" type="image/webp" />
        <img 
          src="/voiceaiflow.png" 
          alt="Voice AI agent pipeline from microphone through speech-to-text, language model, and text-to-speech to speaker output"
          width="3232"
          height="736"
          className="max-w-full h-auto shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" 
          loading="lazy"
          decoding="async"
        />
      </picture>
      {/* FAQ Section */}
      <FAQ />

      
    </>
  );
}
