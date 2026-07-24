import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_NAME,
  SITE_URL,
} from "@shared/site-core";
import { trackBrowserPageView } from "@/lib/analytics";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogType?: string;
  robots?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: object;
}

const baseUrl = SITE_URL;

function absoluteUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
}

function canonicalize(value: string) {
  const url = new URL(value, baseUrl);
  if (url.origin === baseUrl && url.pathname !== "/" && !/\.[a-z0-9]+$/i.test(url.pathname)) {
    url.pathname = `${url.pathname.replace(/\/$/, "")}/`;
  }
  url.search = "";
  url.hash = "";
  return url.toString();
}

export default function SEOHead({
  title = "Voice AI Cost Calculator | Compare STT, LLM & TTS Pricing",
  description = "Estimate voice agent costs using source-linked STT, LLM, and TTS prices verified against provider documentation.",
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE_PATH,
  ogImageAlt = DEFAULT_OG_IMAGE_ALT,
  ogImageWidth = DEFAULT_OG_IMAGE_WIDTH,
  ogImageHeight = DEFAULT_OG_IMAGE_HEIGHT,
  ogType = "website",
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  publishedTime,
  modifiedTime,
  structuredData,
}: SEOHeadProps) {
  const [location] = useLocation();
  const pathname = location.split(/[?#]/)[0] || "/";
  const fullUrl = canonicalize(canonicalUrl ?? `${baseUrl}${pathname}`);

  useEffect(() => {
    document.title = title;

    const updateMeta = (key: string, content: string | undefined, property = false) => {
      const selector = property ? `meta[property="${key}"]` : `meta[name="${key}"]`;
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!content) {
        element?.remove();
        return;
      }
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(property ? "property" : "name", key);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    updateMeta("description", description);
    updateMeta("robots", robots);
    updateMeta("og:title", title, true);
    updateMeta("og:description", description, true);
    updateMeta("og:url", fullUrl, true);
    updateMeta("og:image", absoluteUrl(ogImage), true);
    updateMeta("og:image:alt", ogImageAlt, true);
    updateMeta("og:image:width", String(ogImageWidth), true);
    updateMeta("og:image:height", String(ogImageHeight), true);
    updateMeta("og:type", ogType, true);
    updateMeta("og:site_name", SITE_NAME, true);
    updateMeta("article:published_time", publishedTime, true);
    updateMeta("article:modified_time", modifiedTime, true);
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", title);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", absoluteUrl(ogImage));

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = fullUrl;

    const schemaId = "seo-head-schema";
    let schema = document.head.querySelector<HTMLScriptElement>(`script[data-json-ld="${schemaId}"]`);
    if (structuredData) {
      if (!schema) {
        schema = document.createElement("script");
        schema.type = "application/ld+json";
        schema.dataset.jsonLd = schemaId;
        document.head.appendChild(schema);
      }
      schema.textContent = JSON.stringify(structuredData);
    } else {
      schema?.remove();
    }

    // SEO metadata is now current, so SPA page views receive the new title and
    // a sanitized location instead of stale metadata or shared calculator inputs.
    trackBrowserPageView(window.location.href, title);
  }, [description, fullUrl, modifiedTime, ogImage, ogImageAlt, ogImageHeight, ogImageWidth, ogType, pathname, publishedTime, robots, structuredData, title]);

  return null;
}
