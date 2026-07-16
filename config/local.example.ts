// Copy this file to `config/local.ts` for machine-specific overrides.
// `config/local.ts` is gitignored and is merged in last, after mode overrides.
import type { AppConfig } from "./default.js";

export const localConfig: Partial<AppConfig> = {
  server: {
    port: 3000,
    open: false,
  },
};
