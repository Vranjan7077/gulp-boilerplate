# Configuration

Everything tunable lives under `config/`. You should rarely need to touch anything in `tasks/` to change build behavior. See [ARCHITECTURE.md](ARCHITECTURE.md) for why that separation is the whole point.

## How resolution works

```text
config/default.ts        the full AppConfig shape + baseline values (required — every field present)
config/development.ts    partial overrides applied when NODE_ENV/--production says "development"
config/production.ts     partial overrides applied when NODE_ENV/--production says "production"
config/local.ts           optional, gitignored, machine-specific overrides — applied last
```

Mode is decided by `lib/env.ts`. Pass `--production` on the CLI (already wired into `npm run build`), or set `NODE_ENV=production`. Everything else defaults to `development`.

To add a local override, copy `config/local.example.ts` to `config/local.ts` (already gitignored) and export whatever partial `AppConfig` you need. Most commonly that's just a different dev-server port.

## Full option reference

All types are defined in `config/default.ts` (`AppConfig`). The values below are the `defaultConfig` baseline; `development.ts`/`production.ts` show what each mode overrides.

### `paths`

| Key                            | Default                        | Notes                                                                                                                                                                                |
| ------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src.styles` / `dist.styles`   | `src/styles` / `dist/styles`   |                                                                                                                                                                                      |
| `src.scripts` / `dist.scripts` | `src/scripts` / `dist/scripts` |                                                                                                                                                                                      |
| `src.markup` / `dist.markup`   | `src/markup` / `dist`          | Markup output goes to the dist **root**, not a subfolder. HTML is the entry point, not a nested asset.                                                                               |
| `src.assets` / `dist.assets`   | `src/assets` / `dist/assets`   | Subfolders are `images/`, `svg/`, `fonts/`, `static/`. `static/` copies to `dist/` root instead, since favicons, robots.txt, and manifests need to be servable from the domain root. |

### `browserslist`

An array of [Browserslist](https://github.com/browserslist/browserslist) queries, e.g. `[">0.5%", "last 2 versions", "Firefox ESR", "not dead"]`. Drives Autoprefixer's vendor-prefix decisions. This is a separate axis from `scripts.target` on purpose: CSS prefixing needs granular browser versions, JS syntax lowering needs an ECMAScript version target, and conflating the two would make either one harder to reason about.

### `styles`

| Key          | Dev         | Prod    | Notes                           |
| ------------ | ----------- | ------- | ------------------------------- |
| `entry`      | `main.scss` | same    | Relative to `paths.src.styles`. |
| `sourceMaps` | `true`      | `false` |                                 |
| `minify`     | `false`     | `true`  | Via cssnano.                    |

### `scripts`

| Key          | Dev       | Prod    | Notes                                                                     |
| ------------ | --------- | ------- | ------------------------------------------------------------------------- |
| `entry`      | `main.js` | same    | Name it `main.ts` to opt into TypeScript. esbuild transpiles it for free. |
| `target`     | `es2020`  | same    | esbuild target, independent from `browserslist`.                          |
| `sourceMaps` | `true`    | `false` |                                                                           |
| `minify`     | `false`   | `true`  |                                                                           |

### `markup`

| Key      | Dev     | Prod   |
| -------- | ------- | ------ |
| `minify` | `false` | `true` |

Build-metadata meta tags (`generator`, `build-mode`, `build-time`) get injected in both modes, always.

### `assets.images`

| Key        | Dev     | Prod   | Notes                                                                 |
| ---------- | ------- | ------ | --------------------------------------------------------------------- |
| `optimize` | `false` | `true` | Off in dev so rebuilds stay fast, since sharp compression isn't free. |
| `quality`  | `80`    | `80`   | Applies to JPEG/PNG/WebP/AVIF re-encoding.                            |

SVG optimization through SVGO isn't gated by a config flag. It's fast enough, being pure JS with no native compression, that it just always runs.

### `build`

| Key                | Dev             | Prod   | Notes                                                                                                                                               |
| ------------------ | --------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hashing`          | `false`         | `true` | Content-hash fingerprinting, cache-busting, `manifest.json`, HTML reference rewriting. See [ARCHITECTURE.md](ARCHITECTURE.md#build-pipeline-shape). |
| `hashLength`       | `10`            | same   | Characters of the SHA-256 hash kept in the filename.                                                                                                |
| `manifestFileName` | `manifest.json` | same   | Written to `dist/` root.                                                                                                                            |

### `server`

| Key    | Default | Notes                                                |
| ------ | ------- | ---------------------------------------------------- |
| `port` | `3000`  | BrowserSync dev server port.                         |
| `open` | `false` | Whether to auto-open a browser tab on `npm run dev`. |

### `features`

Reserved flags for opt-in pipeline modules that aren't wired into the default build (see [CUSTOMIZATION.md](CUSTOMIZATION.md)): `templates`, `criticalCss`, `rtl`, `purgeCss`. All `false` by default. Turning one on doesn't do anything by itself until you've also added the corresponding task module and installed its dependency. That's on purpose: no unused dependency should ever get forced into a plain `npm install`.

## Using pnpm or yarn instead of npm

Nothing in the config layer or task code assumes npm specifically. The `npm run <script>` commands in `package.json` translate directly to `pnpm dev`, `yarn dev`, and so on. The one thing you'd need to update yourself is the Husky/lint-staged/commitlint setup, which assumes `npm install` triggers the `prepare` script the same way other package managers do (they do, by default).
