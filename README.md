# Jeyamohan Articles

React + Vite personal writing workspace using the Ant Design packages already present in this project.

## Start

```sh
npm run dev
```

## Checks

```sh
npm run build
npm run lint
```

## Local-only behavior

- Profile details, drafts, article status, SEO fields, and scheduled times are stored in this browser's `localStorage`.
- The previous writer draft (`ezhuthu-draft-v1`) is copied into the new article model without deleting its old storage key.
- Publishing only marks an article as published in this browser. It does not publish to a website or social network.
- Scheduling stores a date and time locally; it does not automatically publish later.
- SEO settings and their preview are not sent to search engines.
- Article text can be copied or downloaded as a `.txt` file.

There is no backend or configured external publishing, scheduling, or analytics integration.

## Latest update (2026-10-23)

- Refined the dashboard layout for desktop, tablet, and mobile, with section dividers, rounded cards, and a responsive navigation drawer.
- Recent Posts shows the total post count, per-day post numbers, and clearly separated author, date, and post content details.
- Untitled article cards use ordered English labels such as `Article Sample 1`; these labels do not overwrite saved article titles.
- Aligned post avatars with author names and improved card spacing and wrapping on narrow screens.
- Added the responsive footer with copyright and contact details.
- Refined the article editor toolbar and writing surface for small screens and horizontal text flow.
- Improved accessibility settings, date and article metrics handling, and local storage recovery.
- Hardened image imports and rich-text handling, including pending-read cleanup and safer editor updates.
- Verified with `npm run lint` and `npm run build`.
