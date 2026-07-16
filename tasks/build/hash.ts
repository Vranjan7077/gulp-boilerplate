import { createHash } from "node:crypto";
import { readFile, rename } from "node:fs/promises";
import path from "node:path";

import fastGlob from "fast-glob";

import type { AppConfig } from "../../config/index.js";

export type AssetManifest = Record<string, string>;

const HASHABLE_EXTENSIONS = [".css", ".js", ".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"];

function hashContent(buffer: Buffer, length: number): string {
  return createHash("sha256").update(buffer).digest("hex").slice(0, length);
}

function toPosix(relativePath: string): string {
  return relativePath.split(path.sep).join("/");
}

/**
 * Fingerprints every fingerprintable dist file in place (content hash in the
 * filename) and records original -> hashed paths in `manifest`, shared with
 * the reference-rewrite and manifest-write tasks that run after this one.
 */
export function createHashTask(config: AppConfig, manifest: AssetManifest) {
  async function hashAssets(): Promise<void> {
    const patterns = HASHABLE_EXTENSIONS.map((ext) => `**/*${ext}`);
    const files = await fastGlob(patterns, { cwd: config.paths.dist.root });

    for (const relativePath of files) {
      const absolutePath = path.join(config.paths.dist.root, relativePath);
      const contents = await readFile(absolutePath);
      const hash = hashContent(contents, config.build.hashLength);
      const { dir, name, ext } = path.parse(relativePath);
      const hashedRelativePath = path.join(dir, `${name}.${hash}${ext}`);

      await rename(absolutePath, path.join(config.paths.dist.root, hashedRelativePath));
      manifest[toPosix(relativePath)] = toPosix(hashedRelativePath);
    }
  }

  hashAssets.displayName = "build:hash";
  return hashAssets;
}
