import path from "node:path";

import gulp, { type TaskFunction } from "gulp";

import type { AppConfig } from "../../config/index.js";
import { bs, reload } from "./serve.js";

interface WatchTasks {
  styles: TaskFunction;
  scripts: TaskFunction;
  markup: TaskFunction;
  assets: TaskFunction;
}

export function createWatchTask(config: AppConfig, tasks: WatchTasks) {
  function streamStyles(): NodeJS.ReadWriteStream {
    return gulp.src(path.posix.join(config.paths.dist.styles, "**/*.css")).pipe(bs.stream());
  }

  function watch(done: () => void): void {
    gulp.watch(path.posix.join(config.paths.src.styles, "**/*.scss"), gulp.series(tasks.styles, streamStyles));
    gulp.watch(path.posix.join(config.paths.src.scripts, "**/*.js"), gulp.series(tasks.scripts, reload));
    gulp.watch(path.posix.join(config.paths.src.markup, "**/*.html"), gulp.series(tasks.markup, reload));
    gulp.watch(path.posix.join(config.paths.src.assets, "**/*"), gulp.series(tasks.assets, reload));
    done();
  }

  watch.displayName = "watch";
  return watch;
}
