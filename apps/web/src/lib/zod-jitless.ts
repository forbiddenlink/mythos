import { z } from "zod";

/**
 * Zod 4 probes `new Function("")` when a schema is built, to decide whether it
 * can compile a fast path. The site's CSP has no 'unsafe-eval', so on every
 * page that loaded the client bundle the probe was blocked: a
 * `securitypolicyviolation`, a report to /api/csp-report, and a failed
 * Lighthouse "issues logged in DevTools" audit. Turning the JIT off skips the
 * probe and gives identical parse results.
 *
 * Import this module (side-effect only) BEFORE any module that builds a zod
 * schema, in every file that ships to the browser.
 */
z.config({ jitless: true });
