import { Link } from "wouter";
import SEOHead from "../components/seo/SEOHead";
import BreadcrumbNav from "../components/seo/BreadcrumbNav";
import Footer from "../components/Footer";
import { FileText } from "lucide-react";
import { SITE_URL, siteCoreContent } from "@shared/site-core";

export default function TermsOfService() {
  const copy = siteCoreContent.terms;
  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans">
      <SEOHead
        title={copy.title}
        description={copy.description}
        canonicalUrl={`${SITE_URL}${copy.path}`}
      />
      
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbNav currentLabel={copy.breadcrumbLabel} />
        {/* Header */}
        <header className="mb-8">
          <Link href="/" className="block border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0)] mb-6">
            <div className="flex items-center justify-center gap-4">
              <h1 className="font-mono text-3xl md:text-4xl font-bold text-center text-black uppercase tracking-tight mb-0">{copy.h1}</h1>
              <div className="w-16 h-16 rounded-none border-4 border-black bg-white p-1 flex justify-center items-center">
                <FileText className="w-8 h-8" />
              </div>
            </div>
          </Link>
        </header>

        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <section>
            <h2 className="font-mono text-xl font-bold mb-4 uppercase tracking-tight border-b-4 border-black pb-2">
              ACCEPTANCE OF TERMS
            </h2>
            <div className="bg-gray-50 border-4 border-black p-4">
              <p className="font-mono text-sm leading-relaxed">
                By accessing and using Voice AI Pricing Calculator, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xl font-bold mb-4 uppercase tracking-tight border-b-4 border-black pb-2">
              SERVICE DESCRIPTION
            </h2>
            <div className="bg-gray-50 border-4 border-black p-4">
              <p className="font-mono text-sm leading-relaxed mb-4">
                Voice AI Pricing Calculator is a free tool that provides cost estimates for voice AI services 
                including speech-to-text, text-to-speech, and language models.
              </p>
              <div className="space-y-2">
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">FREE TO USE: </span>
                  <span className="font-mono text-xs">No registration or payment required</span>
                </div>
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">EDUCATIONAL PURPOSE: </span>
                  <span className="font-mono text-xs">Estimates for planning and comparison</span>
                </div>
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">NO GUARANTEES: </span>
                  <span className="font-mono text-xs">Calculations are estimates, not guarantees</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xl font-bold mb-4 uppercase tracking-tight border-b-4 border-black pb-2">
              ACCEPTABLE USE
            </h2>
            <div className="bg-gray-50 border-4 border-black p-4">
              <p className="font-mono text-sm leading-relaxed mb-4">You agree to use this service only for lawful purposes and in accordance with these terms.</p>
              <div className="space-y-2">
                <div className="bg-red-50 border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">PROHIBITED: </span>
                  <span className="font-mono text-xs">Excessive automated scraping</span>
                </div>
                <div className="bg-red-50 border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">PROHIBITED: </span>
                  <span className="font-mono text-xs">Malicious use or attempts to harm the service</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xl font-bold mb-4 uppercase tracking-tight border-b-4 border-black pb-2">
              ACCURACY DISCLAIMER
            </h2>
            <div className="bg-gray-50 border-4 border-black p-4">
              <p className="font-mono text-sm leading-relaxed mb-4">
                Catalog rows were checked against their linked sources on the displayed verification date, but all calculations remain estimates rather than quotes.
              </p>
              <div className="space-y-2">
                <div className="bg-yellow-50 border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">ESTIMATES ONLY: </span>
                  <span className="font-mono text-xs">Results are approximations for planning purposes</span>
                </div>
                <div className="bg-yellow-50 border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">PRICING CHANGES: </span>
                  <span className="font-mono text-xs">Provider pricing may change without notice</span>
                </div>
                <div className="bg-yellow-50 border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">VERIFY COSTS: </span>
                  <span className="font-mono text-xs">Always confirm pricing with providers directly</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xl font-bold mb-4 uppercase tracking-tight border-b-4 border-black pb-2">
              LIMITATION OF LIABILITY
            </h2>
            <div className="bg-gray-50 border-4 border-black p-4">
              <p className="font-mono text-sm leading-relaxed mb-4">
                Voice AI Pricing Calculator is provided "as is" without warranty of any kind.
              </p>
              <div className="space-y-2">
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">NO WARRANTY: </span>
                  <span className="font-mono text-xs">Service provided without guarantees</span>
                </div>
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">NO LIABILITY: </span>
                  <span className="font-mono text-xs">Not responsible for decisions based on estimates</span>
                </div>
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">USE AT YOUR RISK: </span>
                  <span className="font-mono text-xs">Users are responsible for their own decisions</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xl font-bold mb-4 uppercase tracking-tight border-b-4 border-black pb-2">
              INTELLECTUAL PROPERTY
            </h2>
            <div className="bg-gray-50 border-4 border-black p-4">
              <p className="font-mono text-sm leading-relaxed mb-4">
                The calculator design, code, and content are protected by intellectual property rights.
              </p>
              <div className="bg-white border-2 border-black p-2">
                <span className="font-mono font-bold text-xs uppercase tracking-tight">REUSE: </span>
                <span className="font-mono text-xs">You may share links to the site. Reproduction, redistribution, or adaptation of the site code or editorial content requires prior written permission unless a repository license explicitly grants broader rights.</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xl font-bold mb-4 uppercase tracking-tight border-b-4 border-black pb-2">
              CHANGES TO TERMS
            </h2>
            <div className="bg-gray-50 border-4 border-black p-4">
              <p className="font-mono text-sm leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be posted on this page 
                with an updated effective date. Continued use constitutes acceptance of modified terms.
              </p>
              <div className="bg-white border-2 border-black p-2 mt-2">
                <span className="font-mono font-bold text-xs uppercase tracking-tight">EFFECTIVE DATE: </span>
                <span className="font-mono text-xs">July 22, 2026</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
