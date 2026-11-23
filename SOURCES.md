# Sources and credits

## Fonts

| Font | Use | License | Source |
| --- | --- | --- | --- |
| EB Garamond | Tradition font: headings, buttons, ornaments | SIL Open Font License 1.1 | Google Fonts, bundled with `@fontsource/eb-garamond` (latin, latin-ext, cyrillic, greek) |
| Source Sans 3 | Body text | SIL Open Font License 1.1 | Google Fonts, bundled with `@fontsource-variable/source-sans-3` (latin, latin-ext, cyrillic, greek) |

## Images

Sample photographs live in `public/images/samples/` as optimized WebP. Full title, author, license and Commons URL for each file are listed in `public/images/CREDITS.md`.

Builders swap photos by replacing those files or changing paths in:

- `content/images.json` — hero, page banner, about/welcome side image
- `content/clergy.json` → `photo`
- `content/gallery.json` → `src`
- `content/news.json` → `image`
- `content/events.json` → `image`
- `content/pages.json` section `image` / page `banner`
- `content/products.json` → `images[].src`

Drawn brand art:

- The eight-pointed cross (`src/components/brand/OrthodoxCross.tsx`), including the favicon and sample logo.
- Line pictograms (`src/components/brand/Pictogram.tsx`).
- Fallback placeholder art when a path is null (`src/components/brand/PlaceholderArt.tsx`).
- `public/favicon.svg` and `public/brand/sample-logo-square.svg`.

Two general icons (utensils, mail) and the interface icons come from Lucide (ISC license).
