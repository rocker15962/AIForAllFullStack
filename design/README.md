# Design prototype

`prototype/` is the static export of the design project (screens, integrated preview and business rules). It is deployed to Vercel as its own project, separate from the app, so the prototype and rules can be viewed at any time.

- Entry point: `prototype/index.html` → `Prototype.dc.html` (原型 / 規則 modes).
- Business rules and decisions: `prototype/規格文件/{rules,decisions,guide}-data.js`.
- Runtime dependencies loaded by the browser: React 18 and Babel standalone from unpkg.com, Noto Sans TC from Google Fonts.

## Updating

1. Unzip the latest design export.
2. Replace the screens (`*.dc.html`), `support.js`, `規格文件/*.js` and the `_ds/<id>/` bundle, styles, tokens and fonts in `prototype/`. The zip may store `規格文件` as `#U898f#U683c#U6587#U4ef6` — rename it back.
3. Commit and merge to `main`; Vercel redeploys when files under `design/prototype/` change.

Not copied on purpose: `uploads/`, `design_handoff_*`, `github.md`, `.thumbnail`, and the design-system manifest and lint files, which the pages don't load.
