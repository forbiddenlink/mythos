/**
 * Posts a small JSON body that must survive the page being closed. Browser
 * only. Nothing is reported back: a beacon that fails is dropped.
 */
export function postBeacon(url: string, body: string): void {
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
    return;
  }
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
