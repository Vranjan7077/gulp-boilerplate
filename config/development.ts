import type { AppConfig } from "./default.js";

export const developmentConfig: Partial<AppConfig> = {
  styles: {
    entry: "main.scss",
    sourceMaps: true,
    minify: false,
  },
  scripts: {
    entry: "main.js",
    target: "es2020",
    sourceMaps: true,
    minify: false,
  },
  markup: {
    minify: false,
  },
  assets: {
    images: {
      optimize: false,
      quality: 80,
    },
  },
  build: {
    hashing: false,
    hashLength: 10,
    manifestFileName: "manifest.json",
  },
};
