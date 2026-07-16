import type { AppConfig } from "./default.js";

export const productionConfig: Partial<AppConfig> = {
  styles: {
    entry: "main.scss",
    sourceMaps: false,
    minify: true,
  },
  scripts: {
    entry: "main.js",
    target: "es2020",
    sourceMaps: false,
    minify: true,
  },
  markup: {
    minify: true,
  },
  assets: {
    images: {
      optimize: true,
      quality: 80,
    },
  },
  build: {
    hashing: true,
    hashLength: 10,
    manifestFileName: "manifest.json",
  },
};
