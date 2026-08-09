type DataLayerValue = string | number | boolean;

declare global {
  interface Window {
    dataLayer?: Record<string, DataLayerValue>[];
  }
}

// Never pass name, email, or free-text answers through here — GA4's terms
// prohibit PII in event parameters and free text routinely leaks it.
export function trackEvent(
  event: string,
  params: Record<string, DataLayerValue> = {},
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}
