# Sources and credits

## Fonts

| Font | Use | License | Source |
| --- | --- | --- | --- |
| Marcellus, by Astigmatic | Tradition font: headings, buttons, ornaments | SIL Open Font License 1.1 | Google Fonts, bundled with `@fontsource/marcellus` |
| Instrument Sans, by Instrument | Body text | SIL Open Font License 1.1 | Google Fonts, bundled with `@fontsource-variable/instrument-sans` |

## Images

No third-party photographs are hotlinked. Soft gradient placeholder images ship in `public/images/placeholders/` and are labeled “Replace with your photo”. Swap them by replacing the files or changing paths in:

- `content/images.json` — hero, page banner, about/welcome side image
- `content/clergy.json` → `photo`
- `content/gallery.json` → `src`
- `content/news.json` → `image`
- `content/events.json` → `image`
- `content/pages.json` section `image` / page `banner`
- `content/products.json` → `images[].src`

Drawn brand art still used when a path is null:

- The eight-pointed cross (`src/components/brand/OrthodoxCross.tsx`), including the favicon and sample logo.
- Line pictograms (`src/components/brand/Pictogram.tsx`).
- Fallback placeholder art (`src/components/brand/PlaceholderArt.tsx`).
- `public/favicon.svg` and `public/brand/sample-logo-square.svg`.

Two general icons (utensils, mail) and the interface icons come from Lucide (ISC license).

If a parish adds public-domain images, for example from Wikimedia Commons, list each one here with its title, author, license and URL.
