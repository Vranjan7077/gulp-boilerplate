export type BuildMode = "development" | "production";

export interface AppConfig {
  mode: BuildMode;
  paths: {
    src: {
      root: string;
      styles: string;
      scripts: string;
      markup: string;
      assets: string;
    };
    dist: {
      root: string;
      styles: string;
      scripts: string;
      markup: string;
      assets: string;
    };
  };
  browserslist: string[];
  styles: {
    entry: string;
    sourceMaps: boolean;
    minify: boolean;
  };
  scripts: {
    entry: string;
    target: string;
    sourceMaps: boolean;
    minify: boolean;
  };
  markup: {
    minify: boolean;
  };
  assets: {
    images: {
      optimize: boolean;
      quality: number;
    };
  };
  build: {
    hashing: boolean;
    hashLength: number;
    manifestFileName: string;
  };
  server: {
    port: number;
    open: boolean;
  };
  features: {
    templates: boolean;
    criticalCss: boolean;
    rtl: boolean;
    purgeCss: boolean;
  };
}

export const defaultConfig: AppConfig = {
  mode: "development",
  paths: {
    src: {
      root: "src",
      styles: "src/styles",
      scripts: "src/scripts",
      markup: "src/markup",
      assets: "src/assets",
    },
    dist: {
      root: "dist",
      styles: "dist/styles",
      scripts: "dist/scripts",
      markup: "dist",
      assets: "dist/assets",
    },
  },
  browserslist: [">0.5%", "last 2 versions", "Firefox ESR", "not dead"],
  styles: {
    entry: "main.scss",
    sourceMaps: true,
    minify: false,
  },
  scripts: {
    // Name this `main.ts` instead to opt into TypeScript — esbuild transpiles it
    // for free, no extra config or dependency needed.
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
      // Off by default in dev for fast rebuilds; production.ts turns this on.
      optimize: false,
      quality: 80,
    },
  },
  build: {
    // Off by default in dev — stable filenames are easier to debug and cheaper
    // to rebuild; production.ts turns this on.
    hashing: false,
    hashLength: 10,
    manifestFileName: "manifest.json",
  },
  server: {
    port: 3000,
    open: false,
  },
  features: {
    templates: false,
    criticalCss: false,
    rtl: false,
    purgeCss: false,
  },
};
