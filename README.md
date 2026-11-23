# Mission: parish website template

`parish-template-mission`, a Project Orthodox template for a young mission parish. Bright and quiet, with the practical things up front: next services, address, livestream. All content is sample content for "St. Example Orthodox Mission".

Text fields hold short neutral placeholders ("Welcome text goes here."). The template ships no explainer or catechesis pages; the parish adds its own words. The home page has an optional About block (`home-about` in `pages.json`) that can be switched off.

Built with Astro (static output), React islands, Tailwind CSS and shadcn/ui. The build is plain HTML, CSS and JS for any static host: one `index.html` per page plus `404.html`.

## Run it

```bash
npm install
npm run dev        # http://localhost:4637
npm run build      # checks content, then writes dist/
npm run preview    # serves dist/ on port 4638
npm run qa         # after a build: every page at 360/390/768/1280/1440, overflow and console errors
npm run language-fit  # after a build: every page × every language at 360/768/1280; flags clipped or overlapping text
npm run validate   # content files against schemas/ and against each other
```

Node 22 or newer. `npm run qa` and `npm run language-fit` need a local Chrome (set `CHROME` to its path).

## Editing

Everything a parish edits is in `content/`. Each file points at its JSON Schema in `schemas/`, so editors and the builder get field hints. Ids are stable; change text, not ids.

| File | What it holds |
| --- | --- |
| `site.json` | Parish name, languages, calendar style, logo style, contact, features on or off, OrthodoxConnect, checkout and donate settings |
| `images.json` | Shared hero, page-banner and about image paths with alt text (see `public/images/CREDITS.md`) |
| `pages.json` | The page tree (menu order and nesting) and each page's sections, in display order |
| `schedule.json`, `feasts.json` | Weekly services, feast-day rules, one-off dates; fixed and moveable feasts |
| `clergy.json`, `history.json`, `gallery.json`, `news.json`, `sermons.json` | Our Parish and Livestream content |
| `products.json`, `requests.json`, `zapiski.json`, `events.json`, `needs.json` | Store, Request a Service, Commemoration names and Candles, Get Involved |
| `ui.json` | Every button and label, per language |

Common changes:

- **Hide or reorder a section:** move it in the page's `sections` list or set `"enabled": false`.
- **Turn a module off:** `site.json` → `features.store.enabled` (also `requests`, `zapiski`, `involved`, `livestream`, `sermons`). Its pages, menu items and links disappear.
- **Languages:** add an entry to `site.json` → `languages`, then add that language code to any text field. Missing text falls back to the default language. One language hides the switcher; `"dir": "rtl"` is supported.
- **Calendar:** `site.json` → `calendar.style` is `new` (Revised Julian, default) or `old` (Julian; fixed feasts show civil date plus Old Style, e.g. `Dec 19 (Dec 6 O.S.)`). Movable Pascha-based feasts are the same in both. A subtle “New Calendar” / “Old Calendar (Julian)” label appears in the schedule header — there is no visitor toggle. Legacy values `julian` / `revised-julian` / `gregorian` are still accepted and normalized.
- **Logo:** `site.json` → `logo.style` is `wordmark`, `seal`, `kiot` or `square` (uses `logo.image`).
- **Donate / commemorations:** amount fields start at `$0` (or empty). Suggested-amount chips are optional; there is no minimum amount validation or “minimum $X” copy. Commemoration slips may be free.
- **Photos:** shared slots live in `content/images.json` (hero, page banner, about). Per-item paths are in `clergy.json`, `gallery.json`, `news.json`, `events.json`, and section `image` fields. Bundled sample photos (optimized WebP) sit in `public/images/samples/`; sources and licenses are in `public/images/CREDITS.md`. Each photo slot shows one small “Replace with your photo” corner tag. Point any path at your own file under `public/` to swap it.
- **Fonts:** EB Garamond (headings) and Source Sans 3 (body) are self-hosted with Latin, Latin-ext, Cyrillic and Greek subsets so every site language renders without missing glyphs.

Design tokens (colors, font roles, sizes) are in `src/design/tokens.css`.

## Going live

All forms call placeholder functions in `src/lib/handlers.ts` and send nothing. Payments (donate, store, zapiski) go through `startPayment`, with notes for Stripe and Authorize.net. Newsletter, event RSVP and volunteer sign-ups are marked for OrthodoxConnect. Set `"sample": false` in `site.json` to remove the sample notice and allow search indexing.

Image and font sources are listed in `SOURCES.md`.
