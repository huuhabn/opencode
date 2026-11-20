# Text direction

Paths in this guide are relative to `apps/web`. Direction follows the active locale. It is not fixed to LTR.

`directionForLocale` in `src/i18n/locale.ts` returns `rtl` for `ar-TN` and `fa-IR`, and `ltr` for every other supported locale.

## What sets `dir`

- `setLocale` and i18n init call `applyDocumentLocale`, which sets `html.lang` and `html.dir`. It does not write the `dir` cookie.
- `DirectionProvider` (`src/context/direction-provider.tsx`) wraps the tree in Radix `DirectionProvider`. On mount it sets `dir` from the saved locale and writes the `dir` cookie. A later `languageChanged` event replaces both the attribute and the cookie.
- The appearance page and the config drawer can call `setDir` for a manual override. The next language change overwrites that override.
- `resetDir` restores the language direction and deletes the `dir` cookie. A full reload then follows the locale again, not a stale cookie. `DirectionProvider` reads the locale on startup, not the `dir` cookie.

There is no `dir` attribute in `index.html` and no `src/app/layout.tsx`.

## Layout

Use Tailwind logical properties so RTL flips with `html[dir]`:

- `ms-` and `me-` instead of `ml-` and `mr-`
- `ps-` and `pe-` instead of `pl-` and `pr-`
- `text-start` and `text-end` instead of `text-left` and `text-right`
- `start-` and `end-` instead of `left-` and `right-`
- `border-s` and `border-e` instead of `border-l` and `border-r`

Do not set `dir="ltr"` on a parent to keep a layout stable. Do not hardcode `dir="rtl"` except for an isolated string that must stay RTL inside an LTR page.

Radix menus, popovers, and the sidebar follow the provider `dir`. Previous and next icons should point along the inline direction: back toward the start, forward toward the end.

For mixed-script user text, isolate it:

```tsx
<bdi>{item.title}</bdi>
```

Format numbers and currency with `Intl.NumberFormat`. Truncate with `truncate` or `line-clamp-*`, and give flex children `min-w-0` so overflow does not blow the row.

## Check

1. Switch to `vi-VN` or `en-US`. `document.documentElement.dir` is `ltr`.
2. Switch to `ar-TN` or `fa-IR`. `dir` is `rtl` and stays `rtl` after reload.
3. On an LTR locale, pick RTL in the appearance drawer, then switch language. Direction follows the new locale.
4. Reset in the config drawer. The `dir` cookie is removed and the page returns to the language direction.
