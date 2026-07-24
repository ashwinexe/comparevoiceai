import Calculator from "@/components/calculator/Calculator";
import SEOHead from "../components/seo/SEOHead";
import { WebApplicationSchema, OrganizationSchema } from "../components/seo/StructuredData";
import FAQSection from "../components/seo/FAQSection";
import RelatedContent, { voiceAIRelatedContent } from "../components/seo/RelatedContent";
import UseCasesSection from "../components/UseCasesSection";
import Footer from "../components/Footer";
import { voiceAIFAQs } from "@shared/site-core";
import { siteContent } from "@shared/site-content";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <TooltipProvider>
      <Toaster />
      <div className="min-h-screen bg-[#f7f7f7] font-sans">
      <SEOHead
        title={siteContent.home.title}
        description={siteContent.home.description}
        canonicalUrl={`https://comparevoiceai.com${siteContent.home.path}`}
      />
      <WebApplicationSchema />
      <OrganizationSchema />

      <div className="container mx-auto px-4 py-8">
        <Calculator />
        
        {/* SEO Outgoing Links Section */}
        <section className="py-8 bg-gray-50 border-t border-black">
          <div className="container mx-auto px-4">
            <h3 className="font-mono font-bold text-lg uppercase tracking-tight mb-4 text-center">
              Provider Websites
            </h3>
            <p className="font-mono text-xs text-center mb-4">Quick links to providers represented in the catalog; inclusion is not an endorsement.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <a 
                href="https://openai.com/api/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 border-2 border-black hover:bg-gray-100 transition-colors"
              >
                <span className="font-mono text-sm font-bold">OpenAI API</span>
                <p className="font-mono text-xs text-gray-600 mt-1">GPT & Whisper</p>
              </a>
              <a 
                href="https://deepgram.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 border-2 border-black hover:bg-gray-100 transition-colors"
              >
                <span className="font-mono text-sm font-bold">Deepgram</span>
                <p className="font-mono text-xs text-gray-600 mt-1">Speech-to-Text</p>
              </a>
              <a 
                href="https://elevenlabs.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 border-2 border-black hover:bg-gray-100 transition-colors"
              >
                <span className="font-mono text-sm font-bold">ElevenLabs</span>
                <p className="font-mono text-xs text-gray-600 mt-1">Text-to-Speech</p>
              </a>
              <a 
                href="https://anthropic.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 border-2 border-black hover:bg-gray-100 transition-colors"
              >
                <span className="font-mono text-sm font-bold">Anthropic</span>
                <p className="font-mono text-xs text-gray-600 mt-1">Claude LLM</p>
              </a>
            </div>
          </div>
        </section>
        
        <UseCasesSection />
      </div>

      {/* SEO-optimized content sections */}
      <div className="container mx-auto px-4">
        <RelatedContent items={voiceAIRelatedContent} />
        <FAQSection faqs={voiceAIFAQs} />
      </div>

      <Footer />
      </div>
    </TooltipProvider>
  );
}
