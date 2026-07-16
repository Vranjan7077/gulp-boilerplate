import { rm } from "node:fs/promises";

import type { AppConfig } from "../../config/index.js";

export function createCleanTask(config: AppConfig) {
  async function clean(): Promise<void> {
    await rm(config.paths.dist.root, { recursive: true, force: true });
  }

  clean.displayName = "clean";
  return clean;
}
