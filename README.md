# Minh Pham · Portfolio

A static, document-style portfolio built with Astro. HTML and CSS do the work;
the only client JavaScript handles project thumbnail previews. No React runtime,
database, analytics, external font service, or server is required.

## Develop

Use Node.js 24 LTS (or Node.js 22.22 or later).

```sh
npm ci
npm run dev
```

## Validate

```sh
npm run build
npm run check
```

The checks preserve the agreed project/job count and enforce HTML, JavaScript,
and thumbnail size budgets. Browser checks cover desktop, keyboard, and touch
previews, mobile overflow, and 200% text scaling.

## Content and design

- `src/content.json`: the agreed copy, project destinations, and job websites.
- `src/styles/global.css`: Geist, greyscale palette, spacing, responsive/print styles.
- `src/components/PreviewLink.astro`: accessible links and preview-only buttons.
- `src/scripts/previews.ts`: hover/focus previews and touch/keyboard dialogs.
- `src/assets/`: accepted thumbnail source images, optimized to WebP at build time.
- `public/fonts/`: self-hosted Geist, with its license.

Video is deliberately omitted until the final film is ready. The Moonstone studio
entry is a preview-only button; it has no public software destination.

## Deploy

GitHub Pages serves the generated `docs/` directory on the `main` branch.
After editing, run `npm run prepare:pages`, then commit and push the changes
including `docs/`. Pages publishes automatically after the push. `.nojekyll`
ensures the optimized assets are served directly. This avoids requiring an
OAuth token with permission to upload Actions workflows.

The site URL is configured in `astro.config.mjs`.

To add a custom domain later, configure it in GitHub Pages first, update `site`
in `astro.config.mjs`, and update the canonical URL in `public/sitemap.xml` and
`public/robots.txt`. Then configure the domain's DNS records.
