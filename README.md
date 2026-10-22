# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## SEO and social sharing

`index.html` contains static search, Open Graph and Twitter/X metadata so link
previews do not depend on JavaScript. The canonical URL is the public production
alias verified against the linked Vercel project on 2026-10-22:
`https://kreatify-labs-portfolio-website.vercel.app/`.

If a custom domain becomes primary, update the canonical link, `og:url`,
`og:image` and `twitter:image` together. Do not use a temporary preview URL.

`public/social-preview.png` is the 1200 × 630 sharing asset. Its editable source
is `public/social-preview.svg`; the wordmark paths and colors preserve the
approved treatments in `src/components/ui/Logo.tsx`. Rasterize the SVG at its
native dimensions with DejaVu Sans installed when changing its copy. Serve the
PNG for broad social crawler support, retaining matching image dimensions and
alt text in the metadata. No X account handle is asserted without verification.

Before merging, run `npm ci`, `npm run build` and `npm run lint`. Check the built
`dist/index.html` for one canonical link, matching social copy and absolute image
URLs, and confirm `dist/social-preview.png` is 1200 × 630. After deployment,
verify the page and PNG load without authentication and request a fresh scrape
in the intended social platforms; existing previews may remain cached.
