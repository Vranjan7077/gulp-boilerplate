import gulp from "gulp";

import type { AppConfig } from "../../config/index.js";
import { copyFonts } from "./fonts.js";
import { optimizeImages } from "./images.js";
import { copyStaticAssets } from "./static.js";
import { optimizeSvgAssets } from "./svg.js";

export function createAssetsTask(config: AppConfig) {
  const assets = gulp.parallel(
    optimizeImages(config),
    optimizeSvgAssets(config),
    copyFonts(config),
    copyStaticAssets(config),
  );
  assets.displayName = "assets";
  return assets;
}
