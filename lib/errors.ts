import type { Logger } from "./logger.js";

interface BuildError extends Error {
  relativePath?: string;
  file?: string;
  line?: number;
  column?: number;
}

function formatLocation(err: BuildError): string {
  const file = err.relativePath ?? err.file;
  if (!file) return "";
  const position = err.line ? `:${err.line}${err.column ? `:${err.column}` : ""}` : "";
  return ` (${file}${position})`;
}

/**
 * Returns a gulp-plumber compatible error handler: logs a readable message
 * and location, then ends the stream instead of crashing the whole watcher.
 */
export function createErrorHandler(logger: Logger) {
  return function handleStreamError(this: { emit: (event: string) => void }, err: BuildError): void {
    logger.error(`${err.message}${formatLocation(err)}`);
    this.emit("end");
  };
}
