import assert from "node:assert/strict";
import test from "node:test";

import {
  createPageViewTracker,
  normalizeAnalyticsPath,
  sanitizeAnalyticsPageLocation,
  sanitizeReferrerUrl,
} from "../client/src/lib/analytics.ts";
import { GOOGLE_ANALYTICS_MEASUREMENT_ID } from "../shared/site-core.ts";

test("analytics paths exclude shared state while retaining campaign attribution", () => {
  assert.equal(normalizeAnalyticsPath("/?share=secret#results"), "/");
  assert.equal(normalizeAnalyticsPath("stt?utm_source=test"), "/stt/");
  assert.equal(normalizeAnalyticsPath("/blog/example/#section"), "/blog/example/");
  assert.equal(normalizeAnalyticsPath("/404.html?source=broken"), "/404.html");
  assert.equal(
    sanitizeReferrerUrl("https://example.com/search?q=private#result"),
    "https://example.com/search",
  );
  assert.equal(
    sanitizeAnalyticsPageLocation("https://comparevoiceai.com/?share=private&utm_source=newsletter&gclid=click#results"),
    "https://comparevoiceai.com/?utm_source=newsletter&gclid=click",
  );
});

test("page-view tracker records initial and SPA path changes exactly once", () => {
  const calls: unknown[][] = [];
  const track = createPageViewTracker({
    gtag: (...args: unknown[]) => calls.push(args),
    origin: "https://comparevoiceai.com",
    initialReferrer: "https://www.google.com/search?q=voice+pricing#results",
  });

  assert.equal(track("/?share=encoded-state&utm_source=smoke", "Calculator"), true);
  assert.equal(track("/?share=different-state#results", "Calculator"), false);
  assert.equal(track("/stt?utm_source=test", "STT pricing"), true);
  assert.equal(track("/stt/#models", "STT pricing"), false);
  assert.equal(track("/", "Calculator"), true);

  const events = calls.filter((call) => call[0] === "event");
  assert.equal(events.length, 3);
  assert.deepEqual(events.map((call) => (call[2] as { page_path: string }).page_path), ["/", "/stt/", "/"]);

  const first = events[0][2] as Record<string, string>;
  assert.equal(first.send_to, GOOGLE_ANALYTICS_MEASUREMENT_ID);
  assert.equal(first.page_location, "https://comparevoiceai.com/?utm_source=smoke");
  assert.equal(first.page_referrer, "https://www.google.com/search");
  assert.ok(!JSON.stringify(events).includes("encoded-state"));
  assert.ok(JSON.stringify(events).includes("utm_source=smoke"));

  const second = events[1][2] as Record<string, string>;
  assert.equal(second.page_referrer, "https://comparevoiceai.com/?utm_source=smoke");
  assert.equal(second.page_location, "https://comparevoiceai.com/stt/?utm_source=test");

  assert.equal(calls.filter((call) => call[0] === "set").length, 3);
});
