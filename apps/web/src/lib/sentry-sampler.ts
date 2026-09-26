interface RootSamplingContext {
  name: string;
  inheritOrSampleWith: (fallbackSampleRate: number) => number;
}

/**
 * Next.js reports middleware as its own root transaction ("middleware GET") next to the
 * page or API transaction for the same request. In September 2026 those duplicates were
 * ~67% of this project's transactions (258k of ~385k in one week) and carried no signal
 * the request transaction does not already have.
 */
export function tracesSampler(
  { name, inheritOrSampleWith }: RootSamplingContext,
  rate: number,
): number {
  if (name.startsWith("middleware ")) {
    return 0;
  }
  return inheritOrSampleWith(rate);
}
