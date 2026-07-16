import gulp from "gulp";

import { resolveConfig } from "../config/index.js";
import { getMode } from "../lib/env.js";
import { reportDuration } from "../lib/timing.js";
import { createAssetsTask } from "./assets/index.js";
import { createCleanTask } from "./build/clean.js";
import { type AssetManifest, createHashTask } from "./build/hash.js";
import { createWriteManifestTask } from "./build/manifest.js";
import { createRewriteReferencesTask } from "./build/rewrite-references.js";
import { createServeTask } from "./dev/serve.js";
import { createWatchTask } from "./dev/watch.js";
import { compileMarkup } from "./markup/compile.js";
import { validateMarkup } from "./markup/validate.js";
import { bundleScripts } from "./scripts/bundle.js";
import { compileStyles } from "./styles/compile.js";

const BROWSER_SYNC_CLIENT_SRC = "/browser-sync/browser-sync-client.js";

const mode = getMode();
const config = resolveConfig(mode);
const manifest: AssetManifest = {};

const clean = createCleanTask(config);
const styles = compileStyles(config);
const scripts = bundleScripts(config);
const markup = compileMarkup(config);
const devMarkup = compileMarkup(config, BROWSER_SYNC_CLIENT_SRC);
const assets = createAssetsTask(config);
const hashAssets = createHashTask(config, manifest);
const rewriteReferences = createRewriteReferencesTask(config, manifest);
const writeManifest = createWriteManifestTask(config, manifest);
const serve = createServeTask(config);
const watch = createWatchTask(config, { styles, scripts, markup: devMarkup, assets });

const compileAll = gulp.parallel(styles, scripts, markup, assets);
const buildSeries = config.build.hashing
  ? gulp.series(clean, compileAll, hashAssets, rewriteReferences, writeManifest)
  : gulp.series(clean, compileAll);

const devBuildSeries = gulp.series(clean, gulp.parallel(styles, scripts, devMarkup, assets));
const devSeries = gulp.series(devBuildSeries, gulp.parallel(serve, watch));

export async function build(): Promise<void> {
  const startedAt = performance.now();
  await new Promise<void>((resolve, reject) => {
    buildSeries((err) => (err ? reject(err) : resolve()));
  });
  reportDuration(`Build (${mode})`, startedAt);
}

export async function dev(): Promise<void> {
  const startedAt = performance.now();
  await new Promise<void>((resolve, reject) => {
    devSeries((err) => (err ? reject(err) : resolve()));
  });
  reportDuration("Dev server ready", startedAt);
}

export const validateHtml = validateMarkup(config);
