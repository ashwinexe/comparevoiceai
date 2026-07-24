import { Link } from "wouter";
import SEOHead from "../components/seo/SEOHead";
import BreadcrumbNav from "../components/seo/BreadcrumbNav";
import Footer from "../components/Footer";
import { Shield } from "lucide-react";
import { SITE_URL, siteCoreContent } from "@shared/site-core";

export default function PrivacyPolicy() {
  const copy = siteCoreContent.privacy;
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
                CompareVoiceAI is a static, client-side application. It has no user accounts, calculator database, or server API. Google Analytics is used to measure page views and internal navigation.
              </p>
              <div className="space-y-2">
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">NO USER ACCOUNTS: </span>
                  <span className="font-mono text-xs">We do not require registration or login</span>
                </div>
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">LOCAL CALCULATIONS: </span>
                  <span className="font-mono text-xs">Calculator inputs and results are processed locally in your browser</span>
                </div>
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">SANITIZED PAGE VIEWS: </span>
                  <span className="font-mono text-xs">Shared calculator parameters and URL fragments are removed; recognized campaign and advertising click parameters may be retained for attribution</span>
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
                <li>Third-party authentication tokens</li>
              </ul>
              <p className="font-mono text-xs mt-4">Google Analytics processes limited site-usage information described below. The hosting provider or content-delivery network may also retain ordinary request logs such as IP address, path, timestamp, and user agent under its own policy.</p>
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xl font-bold mb-4 uppercase tracking-tight border-b-4 border-black pb-2">
              THIRD-PARTY SERVICES
            </h2>
            <div className="bg-gray-50 border-4 border-black p-4">
              <p className="font-mono text-sm leading-relaxed mb-4">
                Pricing and blog data are embedded in the static build. The calculator does not fetch provider APIs. External provider documentation is contacted only when you follow one of its links. Google Analytics is contacted when the site loads and as you move between site pages.
              </p>
              <div className="space-y-2">
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">GOOGLE ANALYTICS: </span>
                  <span className="font-mono text-xs">May process sanitized page locations, referrers, timestamps, browser and device information, approximate location, interaction events, and cookie or session identifiers</span>
                </div>
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">COOKIES: </span>
                  <span className="font-mono text-xs">Analytics loads when the site opens and may set or access cookies unless they are blocked by browser or privacy settings</span>
                </div>
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">HOSTING: </span>
                  <span className="font-mono text-xs">The static host may keep standard request logs under its own policy</span>
                </div>
              </div>
              <p className="font-mono text-xs mt-4">See <a className="underline" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a> for information about Google's processing.</p>
            </div>
          </section>

          <section>
            <h2 className="font-mono text-xl font-bold mb-4 uppercase tracking-tight border-b-4 border-black pb-2">
              YOUR RIGHTS
            </h2>
            <div className="bg-gray-50 border-4 border-black p-4">
              <p className="font-mono text-sm leading-relaxed mb-4">
                The site has no user account or calculator database record to access, modify, or delete. Google Analytics processes usage events associated with cookie or session identifiers; CompareVoiceAI does not link them to a user account.
              </p>
              <div className="space-y-2">
                <div className="bg-white border-2 border-black p-2">
                  <span className="font-mono font-bold text-xs uppercase tracking-tight">ANALYTICS CONTROL: </span>
                  <span className="font-mono text-xs">You can block analytics scripts or clear analytics cookies using browser or privacy tools</span>
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
                <span className="font-mono text-xs">July 24, 2026</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
