import path from "node:path";
import { Transform } from "node:stream";

import gulp from "gulp";
import { optimize } from "svgo";
import type Vinyl from "vinyl";

import type { AppConfig } from "../../config/index.js";

function optimizeSvg(): Transform {
  return new Transform({
    objectMode: true,
    transform(file: Vinyl, _encoding, callback) {
      if (!file.isBuffer()) {
        callback(null, file);
        return;
      }

      try {
        const result = optimize(file.contents.toString("utf8"), { multipass: true });
        file.contents = Buffer.from(result.data);
        callback(null, file);
      } catch (error) {
        callback(error as Error);
      }
    },
  });
}

export function optimizeSvgAssets(config: AppConfig) {
  function svg(): NodeJS.ReadWriteStream {
    return gulp
      .src(path.posix.join(config.paths.src.assets, "svg/**/*.svg"))
      .pipe(optimizeSvg())
      .pipe(gulp.dest(path.posix.join(config.paths.dist.assets, "svg")));
  }

  svg.displayName = "assets:svg";
  return svg;
}
