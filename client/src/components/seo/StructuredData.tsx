import JsonLd from "./JsonLd";
import { publisherOrganization } from "@shared/site-core";
import { siteContent } from "@shared/site-content";

interface StructuredDataProps {
  id: string;
  type: "WebApplication" | "SoftwareApplication" | "Article" | "BlogPosting" | "Organization";
  data: object;
}

export default function StructuredData({ id, type, data }: StructuredDataProps) {
  return <JsonLd id={id} data={{ "@context": "https://schema.org", "@type": type, ...data }} />;
}

export const WebApplicationSchema = () => (
  <StructuredData
    id="voice-calculator-app"
    type="WebApplication"
    data={{
      name: "Voice AI Cost Calculator",
      description: siteContent.home.description,
      url: `https://comparevoiceai.com${siteContent.home.path}`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any web browser",
      isAccessibleForFree: true,
      dateModified: siteContent.home.lastModified,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Source-linked provider pricing",
        "Conversation-history token modeling",
        "Voice-to-voice latency simulation",
        "Shareable and CSV-exportable estimates",
      ],
    }}
  />
);

export const OrganizationSchema = () => (
  <StructuredData
    id="organization"
    type="Organization"
    data={{
      ...publisherOrganization,
    }}
  />
);
