/**
 * Name of the UI message stream data part that carries grounding metadata
 * (entity pages + primary sources). Sent as `data-oracle-sources` before the
 * answer text so it is never subject to response-header size limits.
 */
export const ORACLE_SOURCES_DATA_PART = "oracle-sources";

/** The `type` of that part on the wire. */
export const ORACLE_SOURCES_CHUNK_TYPE =
  `data-${ORACLE_SOURCES_DATA_PART}` as const;

/**
 * Request limits shared by `/api/oracle` (which rejects anything over them with
 * a 400) and the chat client (which must stay under them as a conversation
 * grows past the server's 20-message cap).
 */
export const ORACLE_MAX_REQUEST_MESSAGES = 20;
export const ORACLE_MAX_MESSAGE_CONTENT_CHARS = 4_000;
