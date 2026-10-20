# Minh Pham · Portfolio

A static, document-style portfolio built with Astro. HTML and CSS do the work;
the only client JavaScript handles project thumbnail previews. No React runtime,
database, analytics, external font service, or server is required.

Lucide icons render as inline SVGs at build time. Preview images warm the browser
cache at low priority, one at a time, after page load and an idle callback.

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
- `src/company-previews.json`: company SEO titles, source Open Graph image URLs,
  and the metadata snapshot date. Experience links show these company previews.
- `src/styles/global.css`: Geist, greyscale palette, spacing, responsive/print styles.
- `src/components/PreviewLink.astro`: accessible links and preview-only buttons.
- `src/scripts/previews.ts`: hover/focus previews and touch/keyboard dialogs.
- `src/assets/`: accepted thumbnail source images, optimized to WebP at build time.
- `public/fonts/`: self-hosted Geist, with its license.

The finished 52-second introduction film lives in `public/video/`, with a WebP
poster and English captions from the film's timed narration. Native controls
support sound, seeking and fullscreen. `preload="none"` keeps the 10 MB MP4 out
of the initial page load; playback starts only when the visitor chooses it.
The Moonstone studio
entry is a preview-only button; it has no public software destination.

Company images are cached and optimized locally, so visitors do not contact the
company websites to load previews. Inspectorio's SEO title and exact `og:image`
tag were verified through a public link-metadata service because the homepage
blocks direct automated requests. Every company uses its published preview image.

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
