# SCSS Architecture

`src/styles/main.scss` is the only file that assembles layers, in a fixed order:

```scss
@use "vendors";
@use "base";
@use "layout";
@use "components";
@use "pages";
@use "themes";
@use "utilities";
```

Each layer is a folder with an `_index.scss` that either `@forward`s its partials (so the layer's rules get emitted when `main.scss` later `@use`s the layer) or defines rules directly. `abstracts/` is the one exception: individual partials `@use` it when they need it (`@use "../abstracts" as *;`), but `main.scss` never does, because it emits no CSS of its own.

## The layers, in load order, and why each exists

| Layer         | Emits CSS? | Purpose                                                                                                                                                                                                                                                                                      |
| ------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `abstracts/`  | No         | Variables, functions (`rem()`, `space()`), mixins (`respond-to()`), placeholders (`%visually-hidden`). Pure Sass tooling, consumed via `@use`, never loaded directly by `main.scss`.                                                                                                         |
| `vendors/`    | Yes        | Third-party CSS overrides and shims, one partial per vendor. Loaded first so anything after it can safely override vendor defaults without a specificity fight.                                                                                                                              |
| `base/`       | Yes        | Resets and global element defaults (`_reset.scss`, `_typography.scss`). The browser-default layer, before anything project-specific gets involved.                                                                                                                                           |
| `layout/`     | Yes        | Structural, page-shell-level rules: containers, grid. Not component-specific.                                                                                                                                                                                                                |
| `components/` | Yes        | One file per UI component (`_button.scss`, etc.), each self-contained and named with a `c-` prefix.                                                                                                                                                                                          |
| `pages/`      | Yes        | Page-specific overrides, kept minimal. If something's reused across pages, it belongs in `components/` or `layout/` instead.                                                                                                                                                                 |
| `themes/`     | Yes        | CSS custom-property overrides for light/dark or brand themes (`:root`, `[data-theme="dark"]`). Sits just before `utilities/` because it competes on custom-property values, not selector specificity, and grouping it next to utilities keeps "things that intentionally override" together. |
| `utilities/`  | Yes        | Single-purpose helper classes (`u-` prefix), loaded last so they can win specificity battles against component styles. That matches how most teams actually reach for a "just override this one thing" class.                                                                                |

## Naming convention

- Layout: `l-` prefix (`l-container`)
- Components: `c-` prefix, BEM-style modifiers with `--` (`c-button--outline`)
- Utilities: `u-` prefix (`u-visually-hidden`)

Stylelint's `selector-class-pattern` rule in `stylelint.config.js` enforces this.

## Adding a new component

1. Create `src/styles/components/_your-component.scss`. Start with `@use "../abstracts" as *;` if you need variables, mixins, or functions.
2. Add `@forward "your-component";` to `src/styles/components/_index.scss`.

Nothing to change in `main.scss` or any build task. The layer's `_index.scss` is the only file that needs to know about a new partial within it.

## Adding a new layer

Not something most projects need, but if you do: create the folder with an `_index.scss`, then add `@use "your-layer";` to `main.scss` in whichever position matches its specificity intent. Early means it's more easily overridden; late means it wins more often.
