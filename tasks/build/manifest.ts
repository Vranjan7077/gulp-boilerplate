import { writeFile } from "node:fs/promises";
import path from "node:path";

import type { AppConfig } from "../../config/index.js";
import type { AssetManifest } from "./hash.js";

export function createWriteManifestTask(config: AppConfig, manifest: AssetManifest) {
  async function writeManifest(): Promise<void> {
    const manifestPath = path.join(config.paths.dist.root, config.build.manifestFileName);
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  }

  writeManifest.displayName = "build:manifest";
  return writeManifest;
}
