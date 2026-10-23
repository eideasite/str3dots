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
