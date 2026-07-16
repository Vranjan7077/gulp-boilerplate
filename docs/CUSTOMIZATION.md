# Customization

## Changing behavior vs. changing logic

Before writing any task code, check whether what you need is already a config value. See [CONFIGURATION.md](CONFIGURATION.md). Most day-to-day customization, like paths, browser targets, ports, quality settings, and on/off switches, belongs there instead of in `tasks/`.

## Adding a task

1. Write a factory function in the relevant `tasks/<pipeline>/` folder, or a new folder if it's a new pipeline. The convention throughout this project is `(config: AppConfig, ...extras) => taskFunction`, where `taskFunction` is a plain Gulp task (returns a stream/promise, or takes a `done` callback) with a `.displayName` set for readable CLI output.
2. Import it in `tasks/index.ts` and add it to the relevant `gulp.series`/`gulp.parallel` composition. This file is the only place task ordering gets decided; see [ARCHITECTURE.md](ARCHITECTURE.md#module-boundaries).
3. If the task needs new tunable values, add them to `AppConfig` in `config/default.ts` plus the dev/prod overrides.

## Removing a task

Delete the pipeline's folder under `tasks/`, remove its import and composition line from `tasks/index.ts`, and remove its config section if nothing else references it. Nothing else in the project imports across pipeline folders (see the module-boundary rule in [ARCHITECTURE.md](ARCHITECTURE.md)), so this is always safe.

## Replacing a plugin

Every external tool is used inside exactly one task file, so that's where you swap it. To replace cssnano with a different CSS minifier, for example, edit `tasks/styles/compile.ts` and nothing else, since nothing else references cssnano directly.

## Opt-in features

None of these are wired into the default build, and they're left out of the base `npm install` on purpose. See [ARCHITECTURE.md](ARCHITECTURE.md#framework-agnostic-by-construction) for why. Each one follows the same shape: install the dependency, add a task file, flip the matching `config.features.*` flag, and wire it in.

### Template engine (Nunjucks + partials)

The default markup pipeline (`tasks/markup/compile.ts`) processes plain HTML. To add Nunjucks:

1. `npm install nunjucks gulp-nunjucks-render`, or write a custom transform using `nunjucks` directly, following the pattern already in `tasks/markup/compile.ts`.
2. Add a `templates` task alongside `compileMarkup` that renders `.njk` files from `src/markup` with a configurable partials directory.
3. Flip `config.features.templates = true` in `config/default.ts` (or just in `development.ts`/`production.ts` if you only want it in one mode) and branch in `tasks/index.ts` between `compileMarkup` and your new template task.

### TypeScript for project source

Already effectively free. See [CONFIGURATION.md](CONFIGURATION.md#scripts). Set `config.scripts.entry` to `main.ts` and esbuild transpiles it without any extra dependency. `config.features` doesn't have a `typescript` flag because there's nothing to flag: it's just a filename.

### Critical CSS

1. `npm install critical`.
2. Add `tasks/styles/optional/critical.ts`, a task that runs after `styles` and `markup` (it needs both the compiled CSS and the HTML to extract critical rules from) and inlines the result into `<head>`.
3. Flip `config.features.criticalCss` and add the task to the production build series in `tasks/index.ts`, after `parallel(styles, scripts, markup, assets)`.

### RTL stylesheet generation

1. `npm install postcss-rtlcss`, or `rtlcss` directly.
2. Add `tasks/styles/optional/rtl.ts`. It runs the compiled CSS through the RTL transform and writes a second `main.rtl.css`, or you can use `postcss-rtlcss`'s logical-property output mode to generate one bidirectional stylesheet instead. Which approach fits depends on your project's actual RTL needs.
3. Flip `config.features.rtl` and wire the extra output into `tasks/styles/compile.ts`, or run it as a parallel task, depending on which approach you picked.

### Purge unused CSS

1. `npm install @fullhuman/postcss-purgecss`.
2. Add it to the PostCSS plugin array in `tasks/styles/compile.ts`, gated behind `config.features.purgeCss`, with `content` globs pointing at `dist/**/*.html`. This has to run after markup is compiled, so either move `styles` later in the series when this flag is on, or run it as a separate post-processing task.
3. Flip `config.features.purgeCss`, and test carefully: purge tools work off static analysis of your HTML/JS and can strip classes that get added dynamically at runtime unless you configure a safelist.

### Library or component builds (Rollup)

If you're publishing a component library from this boilerplate rather than shipping a page, esbuild's bundling model (single entry, single or few outputs) isn't always the right shape. Rollup's output formats, an ESM plus CJS dual package with preserved module structure, are usually a better fit for a published package.

1. `npm install rollup @rollup/plugin-node-resolve`, plus whichever Rollup plugins your library needs.
2. Add `tasks/scripts/optional/library.ts` as an alternative to `tasks/scripts/bundle.ts`, same factory-function shape, different implementation underneath.
3. Swap which one `tasks/index.ts` imports based on which mode you're building for, or expose it as a separate npm script (`build:lib`) if you need both a page build and a library build from the same project.

## Extending config safely

`AppConfig` in `config/default.ts` is the single source of truth for the shape. Add new fields there first, with a real default value since every field is required (`Partial<AppConfig>` is only for the mode-override files), then override per-mode in `development.ts`/`production.ts` if needed. TypeScript will point you to everywhere the new field needs to be threaded through.

## Publishing a reusable task module

If you build something generically useful, like an extra optimization pass or a whole new pipeline, keep it portable by exporting a single factory function: `(config: AppConfig, ...deps) => taskFunction`, nothing else exported, and no module-level side effects beyond `createLogger` or plugin instantiation. That's the same shape every task in this project already follows, and it's what makes them easy to lift out into a shared package later if you end up maintaining several projects on this boilerplate.
