# Troubleshooting & FAQ

## "Why does `npm run dev` inject the BrowserSync client script manually instead of letting BrowserSync do it?"

Because BrowserSync's automatic HTML snippet-injection middleware doesn't reliably work under recent Node versions when serving static files. Its `resp-modifier`-based response rewriting doesn't intercept `serve-static`'s file responses the way it's supposed to. This was confirmed with an isolated reproduction outside this project: a bare `browserSync.create().init({ server: { baseDir } })` with no other config also failed to inject.

Rather than depend on that, `tasks/markup/compile.ts` injects the client script tag itself (`<script async src="/browser-sync/browser-sync-client.js">`) in dev mode. BrowserSync still serves that script correctly at that path. Only its automatic response rewriting is broken, not the server itself. If a future BrowserSync/Node combination fixes the underlying issue, this workaround is harmless to keep, since it just does explicitly what BrowserSync would otherwise do invisibly.

## "Why is Dart Sass wrapped in a custom transform instead of using `gulp-sass`?"

`gulp-sass`, as of the version available when this was built, still calls Dart Sass's legacy `render()`/`renderSync()` API internally, which prints a deprecation warning and doesn't reflect modern Dart Sass practices. `tasks/styles/sass-transform.ts` is a small custom stream built directly on `sass.compile()`, the modern API, including correct sourcemap handling. If `gulp-sass` fixes this upstream, switching back is possible but no longer necessary. The custom transform is small enough that maintaining it isn't really a burden.

## "My HTML/CSS/JS changes aren't showing up in the browser during `npm run dev`"

Check the terminal output for the `[styles]`/`[scripts]`/`[markup]` task line. If the rebuild didn't fire, confirm the file is actually inside `src/` (paths are config-driven, see `config.paths.src.*`) and matches the watched glob in `tasks/dev/watch.ts`. If the rebuild did fire but the browser didn't update, check that BrowserSync's client script is present in the page (view source, look for `/browser-sync/browser-sync-client.js`). If it's missing, the dev server may have been restarted without a hard page reload.

## "Production build works but assets aren't hashed / no manifest.json"

Hashing is gated behind `config.build.hashing`, `false` in `development.ts` and `true` in `production.ts`. Make sure you're running `npm run build` (which passes `--production`), not `npm run build:dev`.

## "I added a new file type to `src/assets` and it's not being copied"

Check `tasks/assets/index.ts` and the individual `images.ts`/`svg.ts`/`fonts.ts`/`static.ts` tasks. Each one globs a specific extension or subfolder. A genuinely new asset category, video files for example, needs its own task file following the same pattern as `fonts.ts`. See [CUSTOMIZATION.md](CUSTOMIZATION.md#adding-a-task).

## "Stylelint/ESLint are failing on code I didn't write, right after `npm install`"

Run `npm run lint:fix` and `npm run lint:styles:fix` first. Most findings in a fresh clone are auto-fixable formatting or ordering issues, not real bugs. If something doesn't auto-fix, read the rule name in the error. `stylelint.config.js` and `eslint.config.js` both have inline comments explaining any rule that's been tuned away from its default.

## "Husky hooks aren't running on a fresh clone"

Confirm `npm install` actually ran, since it triggers the `prepare` script that sets up `.husky/`. If hooks still don't fire on macOS/Linux after cloning a repo first committed from Windows, check the executable bit on `.husky/pre-commit` and `.husky/commit-msg`. `git ls-files -s .husky/pre-commit` should show mode `100755`, not `100644`. If it's wrong, run `git update-index --chmod=+x .husky/pre-commit .husky/commit-msg` and commit that change once.

## Known gaps (not bugs, just documented scope boundaries)

- CSS `url()` references aren't rewritten to hashed filenames, only HTML `href`/`src` attributes. See [ARCHITECTURE.md](ARCHITECTURE.md#known-scope-boundaries).
- Reference rewriting assumes a flat markup structure, with asset paths relative to `dist/` root. Deeply nested multi-page HTML would need additional path-resolution logic.
- No fonts ship by default (`src/assets/fonts/` is empty aside from a `.gitkeep`). Font files are licensed content, not boilerplate filler.

## Common mistakes

- **Editing a compiled file in `dist/`.** Everything under `dist/` is generated and gitignored, so edits there are lost on the next build. Always edit under `src/`.
- **Hardcoding a path instead of reading it from `config.paths`.** If you're writing a new task and find yourself typing `"src/something"` directly, that value almost certainly belongs in `config/default.ts` instead. See the core rule in [ARCHITECTURE.md](ARCHITECTURE.md#the-core-rule).
- **Installing an "optional feature" dependency without flipping its config flag, or the other way around.** See [CUSTOMIZATION.md](CUSTOMIZATION.md#opt-in-features) for the full opt-in sequence each one expects.
