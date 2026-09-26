/**
 * Name of the UI message stream data part that carries grounding metadata
 * (entity pages + primary sources). Sent as `data-oracle-sources` before the
 * answer text so it is never subject to response-header size limits.
 */
export const ORACLE_SOURCES_DATA_PART = "oracle-sources";

/** The `type` of that part on the wire. */
export const ORACLE_SOURCES_CHUNK_TYPE =
  `data-${ORACLE_SOURCES_DATA_PART}` as const;
