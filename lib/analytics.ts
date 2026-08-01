export type AnalyticsEvent =
  | "workbench_viewed"
  | "contract_analyzed"
  | "contract_copied"
  | "team_interest"
  | "feedback_intent";

declare global {
  interface Window {
    plausible?: { (event: string): void; q?: unknown[][] };
  }
}

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("envparity:analytics", { detail: { event } }),
  );
  if (!process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) return;
  window.plausible ??= (...args: unknown[]) => {
    window.plausible!.q ??= [];
    window.plausible!.q!.push(args);
  };
  window.plausible(event);
}
