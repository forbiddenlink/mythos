/** The confirm token encodes the subscriber's email, so it never leaves the browser. */
const CONFIRM_QUERY = /(\/newsletter\/confirm)\?[^\s#]*/g;

const SECTIONS = ["properties", "$set", "$set_once"] as const;

type RedactableEvent = Partial<
  Record<(typeof SECTIONS)[number], Record<string, unknown> | undefined>
>;

/** PostHog `before_send`: strip the query from confirm URLs in every URL field. */
export function redactConfirmToken<Event extends RedactableEvent>(
  event: Event | null,
): Event | null {
  if (!event) return event;
  for (const section of SECTIONS) {
    const fields = event[section];
    if (!fields) continue;
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === "string") {
        fields[key] = value.replace(CONFIRM_QUERY, "$1");
      }
    }
  }
  return event;
}
