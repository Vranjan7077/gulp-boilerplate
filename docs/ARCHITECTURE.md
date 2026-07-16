# Architecture

## The core rule

Config is data. Tasks are code. They never mix.

Concretely: `config/*.ts` holds every tunable value (paths, browser targets, quality settings, feature flags, ports). `tasks/**/*.ts` holds the logic that reads those values and does something with them. A task file never hardcodes a value that should have been in config, and a config file never contains logic beyond merging.

This is the single rule that keeps the project from decaying into the "kitchen-sink gulpfile" failure mode described in the README. If 90% of what a project needs to customize is expressible as a config value, 90% of forks never need to touch task code at all.

## Module boundaries

```text
gulpfile.ts       composition root only — imports tasks/index.ts, exports tasks. Nothing else.
config/           pure data + one merge function. Never imports from tasks/ or lib/.
lib/              shared utilities with no knowledge of specific tasks (logger, error
                  formatting, env detection, duration reporting).
tasks/<pipeline>/ one folder per concern (styles, scripts, markup, assets, build, dev).
                  A pipeline folder never imports another pipeline folder directly —
                  shared logic goes through lib/ instead.
tasks/index.ts    the only file that calls gulp.series/gulp.parallel. The whole task
                  graph is visible in one place.
```

This is what makes a pipeline deletable. Remove `tasks/scripts/`, delete the `scripts` config key, remove one line from `tasks/index.ts`, and nothing else references it.

## Config resolution

`config/index.ts` exports `resolveConfig(mode)`, called once at gulp startup:

```text
resolveConfig(mode) =
  deepMerge(defaultConfig, mode === "production" ? productionConfig : developmentConfig, localConfig?)
```

`config/local.ts` (gitignored, copy from `config/local.example.ts`) is an optional last-merged layer for machine-specific overrides, like a custom dev-server port. The result gets frozen with `Object.freeze` and threaded into every task factory as a plain argument. Tasks never read `process.env` or re-resolve config themselves. That's what makes a build deterministic (same source plus same resolved config always gives the same output) and what makes task functions testable in isolation without a running Gulp instance.

Config resolution is synchronous, and not because async wouldn't be nicer. The Gulp CLI loads `gulpfile.ts` via CommonJS `require` even in this ESM project, and esbuild can't compile top-level `await` down to CJS. Rather than fight that, `resolveConfig` and the local-override loader use `node:module`'s `createRequire`. See `config/index.ts` for the full explanation in context.

## Build pipeline shape

```text
build:  clean → { styles, scripts, markup, assets } (parallel) → [production only: hash → rewrite-references → manifest]
dev:    clean → { styles, scripts, markup, assets } (parallel) → { serve, watch } (parallel, stay alive)
```

Everything in the parallel group is independent; no pipeline depends on another pipeline's output during the compile step. Hashing, reference-rewriting, and manifest-writing only make sense as a sequential pass after all compiled output exists, so they run as a `series` step gated on `config.build.hashing` (true in production, false in development).

## Error handling

Every stream-based task wraps its pipeline in `gulp-plumber` with a handler from `lib/errors.ts`. It logs a colored, located message (file and line, when available) via `lib/logger.ts` and calls `this.emit("end")` instead of letting the stream crash, so one bad Sass file doesn't take down the whole `gulp.watch` process. Promise-based tasks (esbuild, image optimization) catch their own errors, format them the same way, and rethrow a short `Error` so Gulp's own task-failure reporting stays short instead of dumping the original tool's verbose output.

## Logging

`lib/logger.ts` gives every task a consistent `[scope]` prefix and color, via `picocolors`, which has zero dependencies of its own. `lib/timing.ts` reports total build duration once at the end of `build`/`dev`. Per-task timing already comes from Gulp's own CLI output, so there was no reason to duplicate it.

## Why TypeScript for the tooling but not the default project source

The build system itself (`config/`, `lib/`, `tasks/`, `gulpfile.ts`) is TypeScript, run directly via [`tsx`](https://github.com/privatenumber/tsx) with no compile step and no `dist/` for the tooling. `src/scripts/` (the example project's own JavaScript) defaults to plain ESM JavaScript instead. Not every static site or landing page needs TypeScript, and forcing it raises the barrier to entry for the common case. If you want TypeScript for your project code, name your entry point `main.ts` in `config/default.ts`. esbuild transpiles it for free, with no extra dependency and no extra config.

## Why esbuild owns JS but doesn't touch CSS beyond bundling

esbuild handles JavaScript bundling, tree-shaking, minification, and TypeScript transpilation. It's not used for CSS at all. Dart Sass's own modern `compile()` API handles SCSS compilation, and PostCSS (Autoprefixer, cssnano) handles CSS transformation. Each tool owns the one job it's actually good at, and Gulp's role stays orchestration and streaming glue rather than reimplementing what a dedicated tool already does well.

## Framework-agnostic by construction

The HTML pipeline doesn't assume a specific templating story: plain HTML by default, Nunjucks and partials as a documented opt-in (see [CUSTOMIZATION.md](CUSTOMIZATION.md)). A design-system or component-library project can disable the HTML pipeline entirely and only use styles, scripts, and assets. Nothing in `config/` or `lib/` assumes a multi-page marketing-site shape.

## Known scope boundaries

Worth writing down here instead of leaving as a silent gap:

- **CSS `url()` rewriting.** The production hashing pass rewrites HTML `href`/`src` attributes to hashed filenames, but it doesn't yet rewrite `url()` references inside compiled CSS, like a background-image pointing at a hashed asset. Nothing in the default SCSS architecture needs this yet. It's a natural extension of `tasks/build/rewrite-references.ts` if your project ends up needing it.
- **Multi-page reference rewriting.** Reference rewriting matches manifest keys as paths relative to `dist/` root, which is correct for the default flat markup structure. Deeply nested HTML pages that reference assets via different relative paths would need path-resolution logic that isn't built yet.
