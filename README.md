# Jeyamohan Articles

React + Vite personal writing workspace using the Ant Design packages already present in this project.

## Start

```sh
npm.cmd run dev
```

## Checks

```sh
npm.cmd run build
npm.cmd run lint
```

## Local-only behavior

- Profile details, drafts, article status, SEO fields, and scheduled times are stored in this browser's `localStorage`.
- The previous writer draft (`ezhuthu-draft-v1`) is copied into the new article model without deleting its old storage key.
- Publishing only marks an article as published in this browser. It does not publish to a website or social network.
- Scheduling stores a date and time locally; it does not automatically publish later.
- SEO settings and their preview are not sent to search engines.
- Article text can be copied or downloaded as a `.txt` file.

There is no backend or configured external publishing, scheduling, or analytics integration.

## Recent work (2026-10-23)

### Dashboard and cards

- Reworked the dashboard into responsive desktop, tablet, and phone layouts. Highlights, the composer, Recent Posts, Home Shortcuts, and Articles stack in a readable order on narrow screens.
- Added subtle divider lines between dashboard sections and within Recent Post cards. Card details separate the author name, date and daily number, and post content.
- Aligned the 40 px profile avatar with the author name. Post text and images wrap within the card, and action controls wrap on small screens.
- Added a total Recent Posts count beside the heading. The count includes posts hidden behind **See More**; its badge is red in both light and dark themes.
- Added a numbered chip to each post. Numbers follow posting order and restart at `#1` for each local calendar day, while the feed stays newest-first.
- Empty-titled article cards display ordered English labels such as `Article Sample 1`. These are display labels and do not overwrite saved article titles.
- Kept the interface consistent with rounded card surfaces, section separators, and a responsive footer with copyright and contact details.

### Editor, navigation, and accessibility

- Refined the article editor toolbar and writing surface for phone and tablet widths, with horizontal text flow and page-level scrolling on mobile.
- Kept navigation available through a responsive drawer and retained the browser save-status indicator there.
- Improved screen-reader labels, touch target sizing, reduced-motion behavior, accessible display settings, and error feedback.

### Data and content handling

- Validated and normalized local article, post, bookmark, shortcut, and highlight data. Preserved recoverable workspace data and detected conflicting writes from other tabs.
- Guarded image file reads against stale asynchronous results and cleaned up pending reads when the composer closes.
- Sanitized rich text and links before saving or displaying article content. Improved date formatting, invalid-date handling, Unicode word counts, and article excerpts.
- Retained local-only behavior: publishing and scheduling do not send content to an external service.

### Commits and verification

- UI and responsive workspace implementation: [`271897f`](https://github.com/eideasite/3dotsnewstr/commit/271897f651afcc77d14f316aa46579a388b1108c) — `Polish responsive writing workspace UI`.
- Workspace and local data handling: [`d913da0`](https://github.com/eideasite/3dotsnewstr/commit/d913da0f900b7eed327454afd0d6b3ab912fe57b) — `Tidy responsive writing workspace and local data handling`.
- Verified using `npm.cmd run lint` and `npm.cmd run build`.
