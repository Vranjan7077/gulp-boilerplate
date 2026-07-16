import path from "node:path";

import gulp from "gulp";

import type { AppConfig } from "../../config/index.js";

/** Root-level files (favicon, robots.txt, manifest, …) copied as-is to the dist root. */
export function copyStaticAssets(config: AppConfig) {
  function staticAssets(): NodeJS.ReadWriteStream {
    return gulp
      .src(path.posix.join(config.paths.src.assets, "static/**/*"), { encoding: false, allowEmpty: true })
      .pipe(gulp.dest(config.paths.dist.root));
  }

  staticAssets.displayName = "assets:static";
  return staticAssets;
}
