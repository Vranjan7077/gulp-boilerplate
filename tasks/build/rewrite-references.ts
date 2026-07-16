import path from "node:path";
import { Transform } from "node:stream";

import gulp from "gulp";
import type Vinyl from "vinyl";

import type { AppConfig } from "../../config/index.js";
import type { AssetManifest } from "./hash.js";

function rewriteReferencesInFile(manifest: AssetManifest): Transform {
  return new Transform({
    objectMode: true,
    transform(file: Vinyl, _encoding, callback) {
      if (file.isBuffer()) {
        let contents = file.contents.toString("utf8");
        for (const [original, hashed] of Object.entries(manifest)) {
          contents = contents.replaceAll(`"${original}"`, `"${hashed}"`);
        }
        file.contents = Buffer.from(contents);
      }
      callback(null, file);
    },
  });
}

/**
 * Rewrites href/src attributes in dist HTML files from original asset paths to
 * their hashed equivalents, using the manifest built by the hash task.
 *
 * Scope note: only rewrites references in HTML. CSS `url()` references to
 * hashed images/fonts are not rewritten yet — a documented gap, not silent.
 */
export function createRewriteReferencesTask(config: AppConfig, manifest: AssetManifest) {
  function rewriteReferences(): NodeJS.ReadWriteStream {
    return gulp
      .src(path.posix.join(config.paths.dist.markup, "**/*.html"))
      .pipe(rewriteReferencesInFile(manifest))
      .pipe(gulp.dest(config.paths.dist.markup));
  }

  rewriteReferences.displayName = "build:rewrite-references";
  return rewriteReferences;
}
