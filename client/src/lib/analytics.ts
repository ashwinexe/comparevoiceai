import {
  GOOGLE_ANALYTICS_CAMPAIGN_PARAMETERS,
  GOOGLE_ANALYTICS_MEASUREMENT_ID,
} from "@shared/site-core";

export type GoogleTag = (...args: unknown[]) => void;

export interface PageViewTrackerOptions {
  gtag: GoogleTag;
  origin: string;
  initialReferrer?: string;
}

export interface PageViewParameters {
  send_to: string;
  page_title: string;
  page_location: string;
  page_path: string;
  page_referrer?: string;
}

export function normalizeAnalyticsPath(location: string): string {
  const pathOnly = location.trim().split(/[?#]/, 1)[0] || "/";
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, "/");

  if (collapsed === "/" || /\.[a-z0-9]+$/i.test(collapsed)) return collapsed;
  return `${collapsed.replace(/\/+$/, "")}/`;
}

export function sanitizeReferrerUrl(value: string): string {
  if (!value) return "";

  try {
    const url = new URL(value);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

export function sanitizeAnalyticsPageLocation(value: string, origin?: string): string {
  try {
    const url = new URL(value, origin);
    const retainedParameters = new URLSearchParams();

    for (const parameter of GOOGLE_ANALYTICS_CAMPAIGN_PARAMETERS) {
      for (const parameterValue of url.searchParams.getAll(parameter)) {
        retainedParameters.append(parameter, parameterValue);
      }
    }

    url.pathname = normalizeAnalyticsPath(url.pathname);
    url.search = retainedParameters.toString();
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

export function createPageViewTracker({
  gtag,
  origin,
  initialReferrer = "",
}: PageViewTrackerOptions) {
  let lastPath: string | undefined;
  let previousPageLocation = sanitizeReferrerUrl(initialReferrer);

  return (location: string, pageTitle: string): boolean => {
    const currentUrl = new URL(location, origin);
    const pagePath = normalizeAnalyticsPath(currentUrl.pathname);
    if (pagePath === lastPath) return false;

    currentUrl.pathname = pagePath;
    const pageLocation = sanitizeAnalyticsPageLocation(currentUrl.toString());
    const pageDefaults = {
      page_title: pageTitle,
      page_location: pageLocation,
      page_path: pagePath,
    };
    const pageView: PageViewParameters = {
      send_to: GOOGLE_ANALYTICS_MEASUREMENT_ID,
      ...pageDefaults,
      ...(previousPageLocation ? { page_referrer: previousPageLocation } : {}),
    };

    // Keep enhanced events such as scroll and engagement associated with the
    // current virtual page, then emit one explicit page view for this path.
    gtag("set", pageDefaults);
    gtag("event", "page_view", pageView);

    lastPath = pagePath;
    previousPageLocation = pageLocation;
    return true;
  };
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GoogleTag;
    __compareVoiceAIGtagConfigured?: boolean;
  }
}

let browserPageViewTracker: ReturnType<typeof createPageViewTracker> | undefined;

function configureBrowserGoogleTag(): GoogleTag {
  window.dataLayer ??= [];
  window.gtag ??= (...args: unknown[]) => {
    window.dataLayer!.push(args);
  };

  if (!window.__compareVoiceAIGtagConfigured) {
    const pageLocation = sanitizeAnalyticsPageLocation(window.location.href);
    const pageReferrer = sanitizeReferrerUrl(document.referrer);
    window.gtag("js", new Date());
    window.gtag("config", GOOGLE_ANALYTICS_MEASUREMENT_ID, {
      send_page_view: false,
      page_location: pageLocation,
      page_path: normalizeAnalyticsPath(window.location.pathname),
      ...(pageReferrer ? { page_referrer: pageReferrer } : {}),
    });
    window.__compareVoiceAIGtagConfigured = true;
  }

  return window.gtag;
}

export function trackBrowserPageView(location: string, pageTitle: string): boolean {
  if (typeof window === "undefined") return false;

  browserPageViewTracker ??= createPageViewTracker({
    gtag: configureBrowserGoogleTag(),
    origin: window.location.origin,
    initialReferrer: document.referrer,
  });

  const tracked = browserPageViewTracker(location, pageTitle);

  // Local previews expose a DOM-only counter so browser smoke tests can verify
  // the real React/Wouter integration without waiting for Analytics reports.
  if (tracked && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)) {
    const currentCount = Number(document.documentElement.dataset.analyticsSmokeCount ?? "0");
    document.documentElement.dataset.analyticsSmokeCount = String(currentCount + 1);
    document.documentElement.dataset.analyticsSmokePath = normalizeAnalyticsPath(window.location.pathname);
  }

  return tracked;
}
