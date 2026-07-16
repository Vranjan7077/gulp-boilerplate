import { createRequire } from "node:module";
import path from "node:path";
import { Transform } from "node:stream";

import gulp from "gulp";
import { type ConfigData, HtmlValidate } from "html-validate";
import type Vinyl from "vinyl";

import type { AppConfig } from "../../config/index.js";
import { createLogger } from "../../lib/logger.js";

const require = createRequire(import.meta.url);
const logger = createLogger("markup:validate");
// The Node API doesn't auto-discover .htmlvalidate.json, so load it explicitly —
// it stays the single source of truth, and editor integrations pick it up too.
const htmlValidate = new HtmlValidate(require("../../.htmlvalidate.json") as ConfigData);

function reportValidationResults(): Transform {
  let hasErrors = false;

  return new Transform({
    objectMode: true,
    async transform(file: Vinyl, _encoding, callback) {
      if (file.isBuffer()) {
        const report = await htmlValidate.validateString(file.contents.toString("utf8"), file.relative);
        for (const result of report.results) {
          for (const message of result.messages) {
            const location = `${file.relative}:${message.line}:${message.column}`;
            const text = `${message.message} (${location}) [${message.ruleId}]`;
            if (message.severity === 2) {
              hasErrors = true;
              logger.error(text);
            } else {
              logger.warn(text);
            }
          }
        }
      }
      callback(null, file);
    },
    flush(callback) {
      if (hasErrors) {
        callback(new Error("HTML validation failed — see errors above"));
        return;
      }
      logger.success("No HTML validation errors");
      callback();
    },
  });
}

/** Standalone advisory/CI task — not wired into the default build or dev pipeline. */
export function validateMarkup(config: AppConfig) {
  function validateHtml(): NodeJS.ReadWriteStream {
    return gulp.src(path.posix.join(config.paths.src.markup, "**/*.html")).pipe(reportValidationResults());
  }

  validateHtml.displayName = "validate:html";
  return validateHtml;
}
