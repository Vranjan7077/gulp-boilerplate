import path from "node:path";
import { Transform } from "node:stream";

import gulp from "gulp";
import sharp from "sharp";
import type Vinyl from "vinyl";

import type { AppConfig } from "../../config/index.js";

const RASTER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function optimizeRasterImages(quality: number): Transform {
  return new Transform({
    objectMode: true,
    async transform(file: Vinyl, _encoding, callback) {
      if (!file.isBuffer() || !RASTER_EXTENSIONS.has(path.extname(file.path).toLowerCase())) {
        callback(null, file);
        return;
      }

      try {
        const image = sharp(file.contents);
        const { format } = await image.metadata();
        const optimized = await (
          format === "png"
            ? image.png({ quality, compressionLevel: 9 })
            : format === "webp"
              ? image.webp({ quality })
              : format === "avif"
                ? image.avif({ quality })
                : image.jpeg({ quality, mozjpeg: true })
        ).toBuffer();

        // Never let "optimization" make a file bigger.
        if (optimized.length < file.contents.length) {
          file.contents = optimized;
        }
        callback(null, file);
      } catch (error) {
        callback(error as Error);
      }
    },
  });
}

export function optimizeImages(config: AppConfig) {
  function images(): NodeJS.ReadWriteStream {
    let stream: NodeJS.ReadWriteStream = gulp.src(path.posix.join(config.paths.src.assets, "images/**/*"), {
      encoding: false,
    });

    if (config.assets.images.optimize) {
      stream = stream.pipe(optimizeRasterImages(config.assets.images.quality));
    }

    return stream.pipe(gulp.dest(path.posix.join(config.paths.dist.assets, "images")));
  }

  images.displayName = "assets:images";
  return images;
}
