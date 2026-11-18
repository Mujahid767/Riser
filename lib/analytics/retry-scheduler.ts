/**
 * lib/analytics/retry-scheduler.ts
 * Lightweight in-process retry worker for Railway's long-lived Node server.
 * Sweeps due Meta CAPI events every 60s with overlap protection and .unref() timers.
 */
import { processDueTrackingRetries } from "./order-tracking";

const SCHEDULER_STARTED_KEY = "__riserCapiRetrySchedulerStarted";
const SWEEP_INTERVAL_MS = 60_000;
const INITIAL_DELAY_MS = 15_000;

export function startCapiRetryScheduler(): void {
  const g = globalThis as Record<string, unknown>;
  if (g[SCHEDULER_STARTED_KEY]) return;
  g[SCHEDULER_STARTED_KEY] = true;

  const runSweep = async () => {
    try {
      const res = await processDueTrackingRetries(20);
      if (res.checked > 0) {
        console.info(
          `[capi-worker] checked=${res.checked} sent=${res.sent} failed=${res.failed} expired=${res.expired} skipped=${res.skipped}`
        );
      }
    } catch (error) {
      console.error("[capi-worker] scheduled retry sweep failed", error);
    }
  };

  const warmup = setTimeout(() => {
    void runSweep();
  }, INITIAL_DELAY_MS);
  warmup.unref?.();

  const timer = setInterval(() => {
    void runSweep();
  }, SWEEP_INTERVAL_MS);
  timer.unref?.();
}
