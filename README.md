# Mission: parish website template

`parish-template-mission`, a Project Orthodox template for a young mission parish. Bright, quiet, and focused on helping newcomers come for the first time. All content is sample content for "St. Example Orthodox Mission".

Built with Astro (static output), React islands, Tailwind CSS and shadcn/ui. The build is plain HTML, CSS and JS for any static host: one `index.html` per page plus `404.html`.

## Run it

```bash
npm install
npm run dev        # http://localhost:4637
npm run build      # checks content, then writes dist/
npm run preview    # serves dist/ on port 4638
npm run qa         # after a build: every page at 360/390/768/1280/1440, overflow and console errors
npm run validate   # content files against schemas/ and against each other
```

Node 22 or newer. `npm run qa` needs a local Chrome (set `CHROME` to its path).

## Editing

Everything a parish edits is in `content/`. Each file points at its JSON Schema in `schemas/`, so editors and the builder get field hints. Ids are stable; change text, not ids.

| File | What it holds |
| --- | --- |
| `site.json` | Parish name, languages, calendar style, logo style, contact, features on or off, OrthodoxConnect, checkout and donate settings |
| `pages.json` | The page tree (menu order and nesting) and each page's sections, in display order |
| `schedule.json`, `feasts.json` | Weekly services, feast-day rules, one-off dates; fixed and moveable feasts |
| `clergy.json`, `history.json`, `gallery.json`, `news.json`, `sermons.json` | Our Parish and Livestream content |
| `products.json`, `requests.json`, `zapiski.json`, `events.json`, `needs.json` | Store, Request a Service, Zapiski and Candles, Get Involved |
| `ui.json` | Every button and label, per language |

Common changes:

- **Hide or reorder a section:** move it in the page's `sections` list or set `"enabled": false`.
- **Turn a module off:** `site.json` → `features.store.enabled` (also `requests`, `zapiski`, `involved`, `livestream`, `sermons`). Its pages, menu items and links disappear.
- **Languages:** add an entry to `site.json` → `languages`, then add that language code to any text field. Missing text falls back to the default language. One language hides the switcher; `"dir": "rtl"` is supported.
- **Calendar:** `site.json` → `calendar.style` is `julian`, `revised-julian` or `gregorian`.
- **Logo:** `site.json` → `logo.style` is `wordmark`, `seal`, `kiot` or `square` (uses `logo.image`).
- **Photos:** set `src` (or `photo`) to an image path in `public/`. Until then a drawn placeholder shows.

Design tokens (colors, font roles, sizes) are in `src/design/tokens.css`.

## Going live

All forms call placeholder functions in `src/lib/handlers.ts` and send nothing. Payments (donate, store, zapiski) go through `startPayment`, with notes for Stripe and Authorize.net. Newsletter, event RSVP and volunteer sign-ups are marked for OrthodoxConnect. Set `"sample": false` in `site.json` to remove the sample notice and allow search indexing.

Image and font sources are listed in `SOURCES.md`.
