import path from "node:path";

import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import gulp from "gulp";
import gulpPlumber from "gulp-plumber";
import gulpPostcss from "gulp-postcss";
import type { AcceptedPlugin } from "postcss";

import type { AppConfig } from "../../config/index.js";
import { createErrorHandler } from "../../lib/errors.js";
import { createLogger } from "../../lib/logger.js";
import { compileSass } from "./sass-transform.js";

const logger = createLogger("styles");

export function compileStyles(config: AppConfig) {
  function styles(): NodeJS.ReadWriteStream {
    const postcssPlugins: AcceptedPlugin[] = [autoprefixer({ overrideBrowserslist: config.browserslist })];
    if (config.styles.minify) postcssPlugins.push(cssnano());

    const entry = path.posix.join(config.paths.src.styles, config.styles.entry);

    return gulp
      .src(entry, { sourcemaps: config.styles.sourceMaps })
      .pipe(gulpPlumber({ errorHandler: createErrorHandler(logger) }))
      .pipe(
        compileSass({ style: config.styles.minify ? "compressed" : "expanded", sourceMaps: config.styles.sourceMaps }),
      )
      .pipe(gulpPostcss(postcssPlugins))
      .pipe(gulp.dest(config.paths.dist.styles, { sourcemaps: config.styles.sourceMaps ? "." : undefined }));
  }

  styles.displayName = "styles";
  return styles;
}
