import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { type AppConfig, type BuildMode, defaultConfig } from "./default.js";
import { developmentConfig } from "./development.js";
import { productionConfig } from "./production.js";

export type { AppConfig, BuildMode } from "./default.js";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T extends object>(base: T, override: Partial<T> | undefined): T {
  if (!override) return base;
  const result = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(override)) {
    const existing = result[key];
    result[key] = isPlainObject(existing) && isPlainObject(value) ? deepMerge(existing, value) : value;
  }
  return result as T;
}

function loadLocalOverride(): Partial<AppConfig> | undefined {
  const localPath = path.join(configDir, "local.ts");
  if (!existsSync(localPath)) return undefined;
  const module = require(localPath) as { localConfig?: Partial<AppConfig> };
  return module.localConfig;
}

/**
 * Resolved synchronously (rather than returning a Promise) because the Gulp CLI
 * loads gulpfile.ts via CommonJS `require`, which cannot await top-level code.
 */
export function resolveConfig(mode: BuildMode): AppConfig {
  const modeConfig = mode === "production" ? productionConfig : developmentConfig;
  const merged = deepMerge(deepMerge(defaultConfig, modeConfig), loadLocalOverride());
  merged.mode = mode;
  return Object.freeze(merged);
}
