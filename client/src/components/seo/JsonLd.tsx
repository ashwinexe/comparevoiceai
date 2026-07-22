import { useEffect } from "react";

interface JsonLdProps {
  data: object;
  id?: string;
}

export default function JsonLd({ data, id = "default" }: JsonLdProps) {
  const serialized = JSON.stringify(data);

  useEffect(() => {
    let script = document.head.querySelector<HTMLScriptElement>(`script[data-json-ld="${id}"]`);
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.jsonLd = id;
      document.head.appendChild(script);
    }
    script.textContent = serialized;
    return () => script?.remove();
  }, [id, serialized]);

  return null;
}

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CompareVoiceAI",
  url: "https://comparevoiceai.com",
  description: "Source-linked voice AI model pricing comparisons and a voice-agent cost calculator.",
};

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});
