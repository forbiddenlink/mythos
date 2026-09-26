/**
 * Whether the Oracle is switched on for this deployment.
 *
 * Server-side check: the public flag must be on AND a model provider must be
 * usable. Client components cannot see provider keys, so they gate on
 * {@link isOracleFlagEnabled} alone.
 */

import { resolveOracleProvider } from "@/lib/oracle/provider";

export function isOracleFlagEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ORACLE_ENABLED === "true";
}

export function isOracleEnabled(): boolean {
  return isOracleFlagEnabled() && resolveOracleProvider() !== null;
}
