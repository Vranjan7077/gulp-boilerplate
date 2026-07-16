import path from "node:path";

import gulp from "gulp";

import type { AppConfig } from "../../config/index.js";

/** Pass-through copy — font subsetting is a documented future enhancement, not core. */
export function copyFonts(config: AppConfig) {
  function fonts(): NodeJS.ReadWriteStream {
    return gulp
      .src(path.posix.join(config.paths.src.assets, "fonts/**/*"), { encoding: false })
      .pipe(gulp.dest(path.posix.join(config.paths.dist.assets, "fonts")));
  }

  fonts.displayName = "assets:fonts";
  return fonts;
}
