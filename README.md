# gulp-boilerplate

A production-ready Gulp + Dart Sass build system for static sites, marketing pages, design systems, and small-to-medium frontend projects. Built from scratch around one rule: **config is data, tasks are code, and the two never mix.**

Change behavior by editing `config/*.ts`. Change _how_ something is built by editing one file under `tasks/`. You should never need to do both for the same change.

## Why this exists

Most Gulp starters fall into one of two traps. Either it's a kitchen-sink `gulpfile.js` where every project-specific tweak means editing task logic directly, or it's a toy example that compiles Sass and calls it done, missing the things a real project needs by week three: cache busting, an asset manifest, image optimization, environment-aware builds, lint gates. This is meant to be neither. A small, readable core plus independent pipeline modules you can read, swap, or delete without having to understand the whole system first.

Full reasoning behind the design is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Features

- **Styles.** Dart Sass with the modern `@use`/`@forward` API (not the legacy `render()` API), Autoprefixer, cssnano, sourcemaps, and a documented 8-layer SCSS architecture.
- **Scripts.** esbuild bundling, tree-shaking, minification, sourcemaps. Name your entry point `main.ts` instead of `main.js` and you get TypeScript for free, no config and no extra dependency needed.
- **Markup.** HTML processing with build-metadata injection and minification, plus HTML validation (`html-validate`) as a standalone advisory/CI task. Template engines like Nunjucks and partials are an opt-in, not a default. See [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md).
- **Assets.** sharp-based raster image optimization (off in dev so rebuilds stay fast, on in prod), SVGO optimization, and font/static pass-through copying.
- **Dev server.** BrowserSync with CSS injection instead of full reloads, plus JS/HTML live reload, wired to a `gulp.watch` loop per pipeline.
- **Production hardening.** Clean builds, content-hash fingerprinting, cache-busting, an asset manifest (`manifest.json`), and automatic HTML reference rewriting to the hashed filenames.
- **Quality tooling.** ESLint (flat config), Stylelint for SCSS, Prettier, EditorConfig, Husky + lint-staged, and commitlint for Conventional Commits.

## Requirements

- Node.js **20+**
- npm. The project is developed and tested against npm; see [docs/CONFIGURATION.md](docs/CONFIGURATION.md) if you'd rather use pnpm or yarn.
- Works on Windows, macOS, and Linux. The toolchain avoids anything shell-specific on purpose.

## Quick start

```bash
npm install
npm run dev     # starts the dev server at http://localhost:3000 with live reload
npm run build   # production build: minified, hashed, manifest.json written to dist/
```

That's it. There's no build step for the tooling itself: `gulpfile.ts` and everything under `config/`, `lib/`, and `tasks/` is TypeScript, run directly via [`tsx`](https://github.com/privatenumber/tsx), with nothing to compile or maintain.

## Project structure

```text
gulp-boilerplate/
├── gulpfile.ts          # composition root — ~1 line, re-exports tasks/index.ts
├── config/               # all tunable values live here — see docs/CONFIGURATION.md
├── lib/                   # shared utilities (logging, error formatting, env/mode detection)
├── tasks/                  # one folder per pipeline: styles, scripts, markup, assets, build, dev
├── src/                      # example project source — replace freely, it's not framework code
└── dist/                      # build output (gitignored)
```

For the full breakdown, including why each boundary exists the way it does, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Documentation

| Guide                                                  | What's in it                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)           | Philosophy, module boundaries, folder structure, build pipeline, error handling |
| [docs/CONFIGURATION.md](docs/CONFIGURATION.md)         | Every config option, environment/mode resolution, local overrides               |
| [docs/SCSS-ARCHITECTURE.md](docs/SCSS-ARCHITECTURE.md) | The 8-layer SCSS system and why each layer exists                               |
| [docs/TASKS.md](docs/TASKS.md)                         | Every npm script and gulp task, what it does, when it runs                      |
| [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md)         | Adding/removing/replacing tasks, opt-in features, TypeScript, template engines  |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)     | FAQ, common mistakes, known gaps                                                |
| [CONTRIBUTING.md](CONTRIBUTING.md)                     | Branching, commit conventions, release process                                  |

## License

ISC
