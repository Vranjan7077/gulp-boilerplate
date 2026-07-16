import path from "node:path";

import * as esbuild from "esbuild";

import type { AppConfig } from "../../config/index.js";
import { createLogger } from "../../lib/logger.js";

const logger = createLogger("scripts");

function formatBuildFailure(failure: esbuild.BuildFailure): string {
  return failure.errors
    .map((error) => {
      const location = error.location
        ? ` (${error.location.file}:${error.location.line}:${error.location.column})`
        : "";
      return `${error.text}${location}`;
    })
    .join("\n");
}

function isBuildFailure(error: unknown): error is esbuild.BuildFailure {
  return typeof error === "object" && error !== null && "errors" in error;
}

export function bundleScripts(config: AppConfig) {
  async function scripts(): Promise<void> {
    const entry = path.posix.join(config.paths.src.scripts, config.scripts.entry);

    try {
      await esbuild.build({
        entryPoints: [entry],
        outdir: config.paths.dist.scripts,
        bundle: true,
        format: "esm",
        target: config.scripts.target,
        sourcemap: config.scripts.sourceMaps,
        minify: config.scripts.minify,
        logLevel: "silent",
      });
    } catch (error) {
      logger.error(isBuildFailure(error) ? formatBuildFailure(error) : String(error));
      throw new Error("scripts task failed");
    }
  }

  scripts.displayName = "scripts";
  return scripts;
}
