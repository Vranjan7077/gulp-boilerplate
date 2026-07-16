import path from "node:path";
import { Transform } from "node:stream";
import { fileURLToPath } from "node:url";

import * as sass from "sass";
import type Vinyl from "vinyl";

interface SassTransformOptions {
  style: "expanded" | "compressed";
  sourceMaps: boolean;
}

interface SassError extends Error {
  file?: string;
  line?: number;
  column?: number;
}

interface RawSourceMap {
  sources: string[];
  [key: string]: unknown;
}

function toSassError(error: unknown, file: Vinyl): SassError {
  const raw = error as { message?: string; span?: { start: { line: number; column: number }; url?: URL | string } };
  const formatted = new Error(raw.message ?? String(error)) as SassError;
  if (raw.span) {
    formatted.line = raw.span.start.line + 1;
    formatted.column = raw.span.start.column + 1;
    formatted.file = raw.span.url ? fileURLToPath(raw.span.url.toString()) : file.path;
  } else {
    formatted.file = file.path;
  }
  return formatted;
}

function toRelativeSources(rawMap: object, destDir: string, outputFile: string): RawSourceMap {
  const map = rawMap as RawSourceMap;
  return {
    ...map,
    file: outputFile,
    sources: map.sources.map((source) => {
      const sourcePath = source.startsWith("file://") ? fileURLToPath(source) : source;
      return path.relative(destDir, sourcePath).split(path.sep).join("/");
    }),
  };
}

/** Compiles each incoming .scss file with Dart Sass's modern `compile()` API. */
export function compileSass(options: SassTransformOptions): Transform {
  return new Transform({
    objectMode: true,
    transform(file: Vinyl, _encoding, callback) {
      if (file.isNull()) {
        callback(null, file);
        return;
      }

      try {
        const result = sass.compile(file.path, {
          style: options.style,
          sourceMap: options.sourceMaps,
          sourceMapIncludeSources: options.sourceMaps,
        });

        file.contents = Buffer.from(result.css);
        file.extname = ".css";

        if (options.sourceMaps && result.sourceMap) {
          file.sourceMap = toRelativeSources(result.sourceMap, path.dirname(file.path), path.basename(file.path));
        }

        callback(null, file);
      } catch (error) {
        callback(toSassError(error, file));
      }
    },
  });
}
