import browserSync from "browser-sync";

import type { AppConfig } from "../../config/index.js";

export const bs = browserSync.create();

export function createServeTask(config: AppConfig) {
  function serve(done: () => void): void {
    bs.init(
      {
        server: { baseDir: config.paths.dist.root },
        port: config.server.port,
        open: config.server.open,
        notify: false,
        ui: false,
        logLevel: "silent",
        logSnippet: false,
      },
      done,
    );
  }

  serve.displayName = "serve";
  return serve;
}

export function reload(done: () => void): void {
  bs.reload();
  done();
}
