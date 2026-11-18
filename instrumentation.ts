export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.NODE_ENV === "test") return;

  const { startCapiRetryScheduler } = await import(
    "./lib/analytics/retry-scheduler"
  );
  startCapiRetryScheduler();
}
