import pc from "picocolors";

export interface Logger {
  info: (message: string) => void;
  success: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

export function createLogger(scope: string): Logger {
  const prefix = pc.cyan(`[${scope}]`);
  return {
    info: (message) => console.log(`${prefix} ${message}`),
    success: (message) => console.log(`${prefix} ${pc.green(message)}`),
    warn: (message) => console.log(`${prefix} ${pc.yellow(message)}`),
    error: (message) => console.error(`${prefix} ${pc.red(message)}`),
  };
}
