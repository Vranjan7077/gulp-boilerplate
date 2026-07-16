import pc from "picocolors";

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/** Logs how long a build run took, from process start or a given start time. */
export function reportDuration(label: string, startedAt: number): void {
  const duration = formatDuration(performance.now() - startedAt);
  console.log(pc.dim(`${label} finished in ${pc.bold(duration)}`));
}
