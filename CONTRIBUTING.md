# Contributing

## Getting set up

```bash
git clone <this repo>
npm install    # also sets up Husky git hooks via the `prepare` script
npm run dev
```

## Branch strategy

- `master` is always releasable.
- Work happens on short-lived branches named `type/short-description` (e.g. `feat/critical-css-task`, `fix/svg-optimize-error-handling`), matching the commit type prefixes below.
- Open a PR against `master`. Squash-merge is preferred, so the PR title should itself be a valid Conventional Commit message, since it becomes the commit message on `master`.

## Commit conventions

Commit messages are validated by commitlint (`commitlint.config.js`, extending `@commitlint/config-conventional`) through a Husky `commit-msg` hook. Invalid messages get rejected at commit time, not caught later in CI.

Format: `type(optional-scope): short description`

Common types are `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. For example: `feat(assets): add AVIF output option to image pipeline`.

## Before opening a PR

The pre-commit hook (Husky + lint-staged) already runs ESLint/Stylelint/Prettier on staged files, but run the full checks locally before pushing so nothing surprises CI:

```bash
npm run lint
npm run lint:styles
npm run format:check
npx tsc --noEmit
npm run build        # confirms the production pipeline actually still produces valid output
npm run validate:html
```

If you're changing something with a runtime effect, a task's behavior and not just its types, actually run `npm run dev` or `npm run build` and inspect `dist/`. This project's quality bar (see [ARCHITECTURE.md](docs/ARCHITECTURE.md)) is that every task gets verified by running it, not just by type-checking it.

## Pull request expectations

- Keep PRs scoped to one concern. A new opt-in feature, a bug fix, and a docs update are three PRs, not one.
- If you're adding or changing a task, update the relevant doc under `docs/` in the same PR: [TASKS.md](docs/TASKS.md), [CONFIGURATION.md](docs/CONFIGURATION.md), or [CUSTOMIZATION.md](docs/CUSTOMIZATION.md), depending on what changed. A task without documentation isn't done.
- CI (`.github/workflows/ci.yml`) checks that the PR title follows Conventional Commits, since it becomes the squash-merge commit message, then runs lint/format/type-check once, then builds and validates HTML across a Windows × macOS × Linux × Node 20/22 matrix, plus a dev-server smoke test that starts `npm run dev` for real and curls the served page, CSS, JS, and BrowserSync client script. A PR that's green locally on one OS but hasn't been reasoned about cross-platform (path separators, shell differences) is a common source of CI-only failures here, which is exactly why this project avoids anything shell-specific in `package.json` scripts.

## Versioning

Semantic Versioning (`MAJOR.MINOR.PATCH`):

- **MAJOR**: a breaking change to the config shape, task names, or default output structure that would require existing projects built on this boilerplate to change something to keep working.
- **MINOR**: a new task, a new config option with a backward-compatible default, a new opt-in feature.
- **PATCH**: bug fixes, dependency bumps that don't change behavior, doc fixes.

## Release process

1. Confirm `master` is green in CI.
2. Bump `version` in `package.json` according to the rule above.
3. Tag the release (`vX.Y.Z`) and push the tag.
4. `.github/workflows/release.yml` re-runs the full quality/build/validation suite against the tag, then publishes a GitHub Release with auto-generated notes from merged PR titles. That's exactly why PR titles are validated as Conventional Commits in CI, not just individual commit messages. Nothing gets released if validation fails.

## Reporting issues

Include your OS, Node version, the exact command you ran, and, for a build-output issue, the relevant `dist/` output or terminal log. "It doesn't work" without a reproduction is the hardest kind of issue to act on.
