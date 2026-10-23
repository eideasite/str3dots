# Project Memory

Last updated: 2026-10-23

## App

- Jeyamohan Articles is a React + Vite single-page writing workspace.
- Article drafts, profile settings, posts, and highlights are stored locally in the browser. There is no backend or connected publishing service.
- Ant Design provides the component library; the theme and Tamil/English language choice are app-managed.

## Recent changes

- The Google AI header search opens a personal-intelligence prompt with “Use without content apps” and “Continue” actions. Both send the query to Google AI; Google manages any Google account or connected-app choices. This app does not request or store Google account access.
- Responsive rules cover desktop, tablet, phone, safe areas, touch targets, and reduced-motion preferences.
- Article word counts and excerpts use Unicode-aware segmentation when `Intl.Segmenter` is available, with a fallback for older browsers.
- Accessibility settings fall back to the device reduced-motion preference when saved settings cannot be read.
- Vite was upgraded from 8.3.4 to 8.3.5; `package-lock.json` was updated.
- Home article lists reuse derived data between renders, and article card excerpts/dates are memoized.
- Local post, bookmark, shortcut, highlight, and article storage paths validate malformed values and avoid overwriting recoverable data.
- Image readers are guarded against stale async results; accessibility schedule times and article status display values are validated.
- New articles share one creation/update timestamp, and date/word-count helpers handle invalid input safely.

## Verification

- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.
- Last verified: 2026-10-23.
