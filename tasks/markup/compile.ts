import path from "node:path";
import { Transform } from "node:stream";

import gulp from "gulp";
import { minify } from "html-minifier-terser";
import type Vinyl from "vinyl";

import type { AppConfig } from "../../config/index.js";

function injectBuildMetadata(mode: AppConfig["mode"]): Transform {
  const meta = [
    '  <meta name="generator" content="gulp-boilerplate" />',
    `  <meta name="build-mode" content="${mode}" />`,
    `  <meta name="build-time" content="${new Date().toISOString()}" />`,
    "</head>",
  ].join("\n");

  return new Transform({
    objectMode: true,
    transform(file: Vinyl, _encoding, callback) {
      if (file.isBuffer()) {
        file.contents = Buffer.from(file.contents.toString("utf8").replace("</head>", meta));
      }
      callback(null, file);
    },
  });
}

function injectDevClientScript(scriptSrc: string): Transform {
  const scriptTag = `  <script async src="${scriptSrc}"></script>\n</body>`;
  return new Transform({
    objectMode: true,
    transform(file: Vinyl, _encoding, callback) {
      if (file.isBuffer()) {
        file.contents = Buffer.from(file.contents.toString("utf8").replace("</body>", scriptTag));
      }
      callback(null, file);
    },
  });
}

function minifyHtml(): Transform {
  return new Transform({
    objectMode: true,
    async transform(file: Vinyl, _encoding, callback) {
      if (!file.isBuffer()) {
        callback(null, file);
        return;
      }
      try {
        const minified = await minify(file.contents.toString("utf8"), {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          minifyCSS: true,
          minifyJS: true,
        });
        file.contents = Buffer.from(minified);
        callback(null, file);
      } catch (error) {
        callback(error as Error);
      }
    },
  });
}

/**
 * Plain HTML processing: build-metadata injection, minification in production,
 * and (in dev only) the BrowserSync client script. Template/partial support
 * (Nunjucks) is a separate opt-in module, not part of this default pipeline.
 */
export function compileMarkup(config: AppConfig, devClientScriptSrc?: string) {
  function markup(): NodeJS.ReadWriteStream {
    let stream: NodeJS.ReadWriteStream = gulp
      .src(path.posix.join(config.paths.src.markup, "**/*.html"))
      .pipe(injectBuildMetadata(config.mode));

    if (devClientScriptSrc) {
      stream = stream.pipe(injectDevClientScript(devClientScriptSrc));
    }
    if (config.markup.minify) {
      stream = stream.pipe(minifyHtml());
    }

    return stream.pipe(gulp.dest(config.paths.dist.markup));
  }

  markup.displayName = "markup";
  return markup;
}
