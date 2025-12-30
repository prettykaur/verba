// lib/analytics.ts
type PlausibleProps = Record<string, string | number | boolean>;

export function track(event: string, props?: PlausibleProps) {
  if (typeof window === 'undefined') return;

  if (window.plausible) {
    window.plausible(event, props ? { props } : undefined);
  }
}
