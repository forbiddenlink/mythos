/**
 * Browser-safe vocabulary for the anonymous daily counts.
 *
 * A page view is reduced to a page TYPE and the KIND of place the visitor came
 * from before anything leaves the browser. The address of the page and the
 * referrer are never sent, so two visits to different entries cannot be told
 * apart once counted.
 *
 * No server imports: the count beacon loads this file in the browser.
 */

export const PAGE_TYPES = [
  "home",
  "deity",
  "story",
  "creature",
  "artifact",
  "location",
  "pantheon",
  "pantheon-sub",
  "gods-of",
  "compare",
  "collection",
  "guide",
  "teachers",
  "newsletter",
  "other",
] as const;
type PageType = (typeof PAGE_TYPES)[number];

export const ARRIVAL_SOURCES = [
  "search",
  "internal",
  "direct",
  "other",
] as const;
type ArrivalSource = (typeof ARRIVAL_SOURCES)[number];

/** `arrive`: a page load. `onward`: the first move to a second page after it. */
export const PAGE_STEPS = ["arrive", "onward"] as const;

/** The only bodies /api/count accepts. */
export type CountBeacon =
  | { step: (typeof PAGE_STEPS)[number]; page: PageType; source: ArrivalSource }
  | { step: "confirm-view" };

const FIRST_SEGMENT_TYPES: Readonly<Record<string, PageType>> = {
  deities: "deity",
  stories: "story",
  creatures: "creature",
  artifacts: "artifact",
  locations: "location",
  "gods-of": "gods-of",
  compare: "compare",
  collections: "collection",
  guides: "guide",
  teachers: "teachers",
  newsletter: "newsletter",
};

/** Reduces a path to its page type. */
export function pageTypeForPath(pathname: string): PageType {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first === undefined) return "home";
  if (first === "pantheons") {
    // /pantheons/greek/goddesses and its siblings are their own search target.
    return segments.length >= 3 ? "pantheon-sub" : "pantheon";
  }
  return FIRST_SEGMENT_TYPES[first] ?? "other";
}

const SEARCH_HOST =
  /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|yandex|baidu|startpage|kagi|qwant)\.|(^|\.)search\.brave\.com$/;
/** The Google app on Android reports itself this way instead of a web host. */
const ANDROID_SEARCH_APP =
  "android-app://com.google.android.googlequicksearchbox";

function withoutWww(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

/** Reduces `document.referrer` to one of four kinds. */
export function arrivalSource(
  referrer: string,
  ownHostname: string,
): ArrivalSource {
  if (!referrer) return "direct";
  if (referrer.startsWith(ANDROID_SEARCH_APP)) return "search";
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return "other";
  }
  if (withoutWww(host) === withoutWww(ownHostname)) return "internal";
  return SEARCH_HOST.test(host) ? "search" : "other";
}

/** A crawler that runs scripts is not a reader. Checked in the browser only. */
export function isAutomatedUserAgent(userAgent: string): boolean {
  return (
    !userAgent ||
    /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|scan/i.test(
      userAgent,
    )
  );
}
