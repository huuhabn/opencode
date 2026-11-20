# Dark mode

Paths in this guide are relative to `apps/web`. Light and dark mode is the `light` or `dark` class on `<html>`. It is separate from the color theme (`data-theme`). Color themes are documented in `themes.md`.

Do not use `next-themes`.

## How mode is applied

`ThemeProvider` lives in `src/context/theme-provider.tsx` and wraps the app in `src/main.tsx`. Read it with `useTheme` from `@/context/theme-provider`.

- Cookie: `vite-ui-theme`
- Values: `light`, `dark`, `system`
- Default: `system`, which follows `prefers-color-scheme`
- The provider removes both classes, then adds the resolved one, and updates `<meta name="theme-color">` (`#ffffff` or `#09090b`)

The boot script in `index.html` applies the same class before React loads, so the first paint matches the cookie. `resetTheme` deletes the cookie and returns to `system`.

`ThemeModeToggle` (`src/components/themes/theme-mode-toggle.tsx`) flips between light and dark. Shortcut is `⌘⇧D` or `Ctrl+Shift+D`, and it is ignored while an input, textarea, select, or contenteditable is focused. The same choice is on `/settings/appearance` and in the config drawer.

Dark colors for each color theme are the `[data-theme='name'].dark` block in `src/styles/themes/`. A theme with no `.dark` tokens will not change when the class toggles.

## Components

Use semantic Tailwind tokens so both modes come from the active theme:

- Surfaces: `bg-background`, `bg-card`, `bg-popover`, `bg-muted`
- Text: `text-foreground`, `text-card-foreground`, `text-muted-foreground`
- Borders: `border-border`, `divide-border`
- Accents: `bg-primary text-primary-foreground`, `bg-secondary text-secondary-foreground`
- Focus: `ring-ring`

A one-off color needs an explicit dark counterpart:

```tsx
className='bg-white text-stone-900 border-stone-200 dark:bg-stone-900 dark:text-stone-100 dark:border-stone-800'
```

Leave a surface that is intentionally always dark or always light alone. Do not add a `dark:` variant that inverts a fixed brand block.

Icons should use `currentColor` so they follow the parent text color. This app has no server render, so `useTheme` does not need a `mounted` guard. The boot script already set the class.

## Check

1. Toggle with `ThemeModeToggle` and from `/settings/appearance`.
2. Reload. The `vite-ui-theme` cookie still matches the class on `<html>`.
3. Set the cookie to `system` and change the OS color scheme. The class follows it.
4. Check dialogs, menus, and tables in both modes.
5. From `apps/web`: `pnpm exec tsc -b --pretty false --noEmit` and `pnpm lint`.
