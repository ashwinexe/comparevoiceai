import { Link } from "wouter";
import SEOHead from "../components/seo/SEOHead";
import BreadcrumbNav from "../components/seo/BreadcrumbNav";
import Footer from "../components/Footer";
import { Shield } from "lucide-react";
import { SITE_URL, siteCoreContent } from "@shared/site-core";

export default function PrivacyPolicy() {
  const copy = siteCoreContent.privacy;
  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans bg-[radial-gradient(#5E17EB_1px,transparent_1px),radial-gradient(#5E17EB_1px,transparent_1px)] bg-[length:40px_40px] bg-[0_0,20px_20px] bg-fixed">
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
                <Shield className="w-8 h-8" />
              </div>
            </div>
          </Link>
        </header>

        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <section>
            <h2 className="font-mono text-xl font-bold mb-4 uppercase tracking-tight border-b-4 border-black pb-2">
              DATA COLLECTION
            </h2>
            <div className="bg-gray-50 border-4 border-black p-4">
              <p className="font-mono text-sm leading-relaxed mb-4">
                CompareVoiceAI is a static, client-side application. It has no accounts, database, analytics scripts, advertising trackers, or server API operated by this site.
              </p>
              <div className="space-y-2">
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">NO USER ACCOUNTS: </span>
                  <span className="font-mono text-xs">We do not require registration or login</span>
                </div>
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">NO DATA STORAGE: </span>
                  <span className="font-mono text-xs">Calculator inputs are processed locally in your browser</span>
                </div>
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">NO SITE TRACKING: </span>
                  <span className="font-mono text-xs">The shipped site does not set cookies or load analytics scripts</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xl font-bold mb-4 uppercase tracking-tight border-b-4 border-black pb-2">
              INFORMATION THE SITE DOES NOT STORE
            </h2>
            <div className="bg-gray-50 border-4 border-black p-4">
              <ul className="list-disc pl-4 font-mono text-sm space-y-2">
                <li>Personal identification information (name, email, phone)</li>
                <li>Calculator inputs or calculation results</li>
                <li>Usage patterns or behavioral data</li>
                <li>Third-party authentication tokens</li>
              </ul>
              <p className="font-mono text-xs mt-4">Your chosen hosting provider or content-delivery network may independently retain ordinary request logs such as IP address, path, timestamp, and user agent. Its policy and configuration control those logs.</p>
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xl font-bold mb-4 uppercase tracking-tight border-b-4 border-black pb-2">
              THIRD-PARTY SERVICES
            </h2>
            <div className="bg-gray-50 border-4 border-black p-4">
              <p className="font-mono text-sm leading-relaxed mb-4">
                Pricing and blog data are embedded in the static build. The calculator does not fetch provider APIs. External provider documentation is contacted only when you follow one of its links.
              </p>
              <div className="bg-white border-2 border-black p-2">
                <span className="font-mono font-bold text-xs uppercase tracking-tight">HOSTING: </span>
                <span className="font-mono text-xs">The deployer chooses the static host; that host may keep standard request logs</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xl font-bold mb-4 uppercase tracking-tight border-b-4 border-black pb-2">
              YOUR RIGHTS
            </h2>
            <div className="bg-gray-50 border-4 border-black p-4">
              <p className="font-mono text-sm leading-relaxed mb-4">
                The site itself has no account or database record to access, modify, or delete. Contact the deployment host about any request logs it controls.
              </p>
              <div className="space-y-2">
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">BROWSER CONTROL: </span>
                  <span className="font-mono text-xs">All calculations happen in your browser</span>
                </div>
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">CLEAR THE URL: </span>
                  <span className="font-mono text-xs">Shared calculations are encoded in the URL; remove the share query parameter to discard them</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xl font-bold mb-4 uppercase tracking-tight border-b-4 border-black pb-2">
              CHANGES TO POLICY
            </h2>
            <div className="bg-gray-50 border-4 border-black p-4">
              <p className="font-mono text-sm leading-relaxed">
                We may update this privacy policy to reflect changes in our practices. 
                Any changes will be posted on this page with an updated effective date.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xl font-bold mb-4 uppercase tracking-tight border-b-4 border-black pb-2">
              CONTACT
            </h2>
            <div className="bg-gray-50 border-4 border-black p-4">
              <p className="font-mono text-sm leading-relaxed">
                If you have questions about this privacy policy, email <a className="underline" href="mailto:contact@rnikhil.com">contact@rnikhil.com</a>.
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
