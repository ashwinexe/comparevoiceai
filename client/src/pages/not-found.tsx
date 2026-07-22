
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import SEOHead from "@/components/seo/SEOHead";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans bg-[radial-gradient(#5E17EB_1px,transparent_1px),radial-gradient(#5E17EB_1px,transparent_1px)] bg-[length:40px_40px] bg-[0_0,20px_20px] bg-fixed">
      <SEOHead title="Page Not Found | CompareVoiceAI" description="The requested CompareVoiceAI page could not be found." robots="noindex, follow" />
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <header className="mb-8">
            <Link href="/" className="block border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0)] mb-6">
              <div className="flex items-center justify-center gap-4">
                <h1 className="font-mono text-3xl md:text-4xl font-bold text-center text-black uppercase tracking-tight mb-0">404 PAGE NOT FOUND</h1>
                <div className="w-16 h-16 rounded-none border-4 border-black bg-white p-1 flex justify-center items-center">
                  <AlertCircle className="w-8 h-8" />
                </div>
              </div>
            </Link>
          </header>

          {/* Main Content */}
          <Card className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0)]">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center mb-6">
                  <AlertCircle className="h-16 w-16 text-black" />
                </div>
                
                <h2 className="font-mono text-2xl font-bold text-black uppercase tracking-tight">
                  OOPS! PAGE NOT FOUND
                </h2>
                
                <div className="bg-gray-50 border-4 border-black p-4">
                  <p className="font-mono text-sm leading-relaxed text-black">
                    The page you're looking for doesn't exist or has been moved. 
                    Don't worry - you can always go back to our main calculator to 
                    compare source-linked voice AI pricing for your needs.
                  </p>
                </div>

                <div className="pt-4">
                  <Link 
                    href="/" 
                    className="inline-block px-6 py-3 bg-[#5E17EB] text-white font-mono font-bold uppercase tracking-tight border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0)] transition-all duration-200"
                  >
                    GO BACK TO VOICE AI PRICING CALCULATOR
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
