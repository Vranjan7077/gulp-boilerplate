# Tasks reference

## npm scripts (the commands you actually run)

| Script                                    | What it does                                                                                                                                                                     |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                             | Full build (unminified, unhashed), then starts BrowserSync at `http://localhost:3000` (configurable) and watches `src/`, rebuilding and live-reloading on change. Stays running. |
| `npm run build`                           | Production build: `clean`, then compile all pipelines in parallel, then hash and rewrite HTML references and write `manifest.json`. Equivalent to `gulp build --production`.     |
| `npm run build:dev`                       | Same build graph as `npm run build`, but in development mode: unminified, unhashed. Good for inspecting readable output without starting a server.                               |
| `npm run validate:html`                   | Runs HTML validation (`html-validate`) against `src/markup`. Exits non-zero on real errors, so it's safe to use as a CI gate. Not part of `dev`/`build`.                         |
| `npm run lint` / `lint:fix`               | ESLint against the whole project: build tooling plus `src/scripts`.                                                                                                              |
| `npm run lint:styles` / `lint:styles:fix` | Stylelint against all `.scss` files.                                                                                                                                             |
| `npm run format` / `format:check`         | Prettier write or check across the whole project.                                                                                                                                |
| `npm run prepare`                         | Runs automatically after `npm install` and sets up Husky git hooks. You shouldn't need to run this yourself.                                                                     |

## The task graph

Registered by `tasks/index.ts`, composed with `gulp.series`/`gulp.parallel` in exactly one place. See [ARCHITECTURE.md](ARCHITECTURE.md#module-boundaries) for why that matters.

```text
build (production, config.build.hashing = true):
  clean
  → parallel(styles, scripts, markup, assets)
  → build:hash               (fingerprint dist files, build in-memory manifest)
  → build:rewrite-references (rewrite HTML href/src to hashed filenames)
  → build:manifest            (write manifest.json)

build (development, config.build.hashing = false):
  clean
  → parallel(styles, scripts, markup, assets)

dev:
  clean
  → parallel(styles, scripts, markup [+ BrowserSync client script], assets)
  → parallel(serve, watch)
    serve opens the HTTP server, watch registers gulp.watch listeners per
    pipeline, and both stay running
```

## Individual pipeline tasks

| Task                       | File                                                         | Notes                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `styles`                   | `tasks/styles/compile.ts` + `tasks/styles/sass-transform.ts` | Dart Sass's modern `compile()` API, not the deprecated `render()` API most `gulp-sass` setups use, then Autoprefixer, then cssnano in prod. |
| `scripts`                  | `tasks/scripts/bundle.ts`                                    | esbuild bundle, tree-shaken, minified in prod.                                                                                              |
| `markup`                   | `tasks/markup/compile.ts`                                    | Metadata injection, minification in prod, dev-only BrowserSync client script.                                                               |
| `validate:html`            | `tasks/markup/validate.ts`                                   | Standalone, not part of `build`/`dev`.                                                                                                      |
| `assets:images`            | `tasks/assets/images.ts`                                     | sharp, gated by `config.assets.images.optimize`.                                                                                            |
| `assets:svg`               | `tasks/assets/svg.ts`                                        | SVGO, always on.                                                                                                                            |
| `assets:fonts`             | `tasks/assets/fonts.ts`                                      | Pass-through copy.                                                                                                                          |
| `assets:static`            | `tasks/assets/static.ts`                                     | Pass-through copy to `dist/` root.                                                                                                          |
| `clean`                    | `tasks/build/clean.ts`                                       | Removes `dist/` entirely before every build, in both modes.                                                                                 |
| `build:hash`               | `tasks/build/hash.ts`                                        | Production only.                                                                                                                            |
| `build:rewrite-references` | `tasks/build/rewrite-references.ts`                          | Production only.                                                                                                                            |
| `build:manifest`           | `tasks/build/manifest.ts`                                    | Production only.                                                                                                                            |
| `serve`                    | `tasks/dev/serve.ts`                                         | BrowserSync init, config-driven port.                                                                                                       |
| `watch`                    | `tasks/dev/watch.ts`                                         | One `gulp.watch` per pipeline. CSS changes stream-inject through BrowserSync; JS, HTML, and asset changes trigger a full reload.            |

## Adding a task

See [CUSTOMIZATION.md](CUSTOMIZATION.md#adding-a-task) for the full version. Short version: write a factory function `(config) => taskFunction` in the relevant `tasks/<pipeline>/` folder, then add exactly one line to `tasks/index.ts`.
