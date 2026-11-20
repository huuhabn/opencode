# Adding New Themes

Paths in this guide are relative to `apps/web`. The app is Vite + React.
Color themes and light/dark are separate:

- Color theme: `data-theme` on `<html>`. `ThemeSelector` (`src/components/themes/theme-selector.tsx`) writes the cookie `active_theme`. The same control is on `/settings/appearance`.
- Light/dark: the `dark` or `light` class on `<html>`, from `src/context/theme-provider.tsx`, cookie `vite-ui-theme`. `ThemeModeToggle` switches it.
- Header cluster: `ThemeControls` (`src/components/themes/theme-controls.tsx`).
- Default color theme: `DEFAULT_THEME` in `src/components/themes/theme.config.ts`. It is currently `'default'`.
- Before paint, the boot script in `index.html` sets `data-theme` from `active_theme`, falling back to the same slug. The script's theme list must match `THEMES`.

## Adding a theme

1. Create `src/styles/themes/your-theme-name.css` with `[data-theme='your-theme-name']`.
2. Import it from `src/styles/theme.css`.
3. Add it to `THEMES` in `src/components/themes/theme.config.ts`.
4. Add the same slug to the `themes` array in the `index.html` boot script.
5. If the theme needs a font that is not already loaded, add it to the Google Fonts `<link>` in `index.html` and, when the CSS uses `var(--font-*)`, to `src/styles/fonts.css`.
6. Optional: set `DEFAULT_THEME` and the boot-script fallback to that slug.

## Set the default color theme

1. Set `DEFAULT_THEME` in `src/components/themes/theme.config.ts`.
2. In `index.html`, use that slug as the fallback when `active_theme` is missing or unknown.

```html
var theme = themeMatch ? themeMatch[1] : 'default'
if (themes.indexOf(theme) === -1) theme = 'default'
```

Restart the dev server. Visitors with no `active_theme` cookie get this theme. A saved cookie still wins.

`DEFAULT_THEME` is not read by the boot script. The script runs before the React bundle, so the fallback string has to be updated in both places.

## Theme files

Each file in `src/styles/themes/` defines tokens for light mode, dark mode (the `dark` class on the same element), and a Tailwind `@theme inline` block. Copy `src/styles/themes/default.css` and replace the slug and values.

```css
[data-theme='your-theme-name'] {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
  --font-sans: 'Your Font', sans-serif;
  --font-serif: ui-serif, Georgia, serif;
  --font-mono: 'Your Mono', monospace;
  --radius: 0.5rem;
}

[data-theme='your-theme-name'].dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* remaining tokens for dark mode */
}

[data-theme='your-theme-name'] {
  @theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);
    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-secondary: var(--secondary);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);
    --color-accent: var(--accent);
    --color-accent-foreground: var(--accent-foreground);
    --color-destructive: var(--destructive);
    --color-border: var(--border);
    --color-input: var(--input);
    --color-ring: var(--ring);
    --color-chart-1: var(--chart-1);
    --color-chart-2: var(--chart-2);
    --color-chart-3: var(--chart-3);
    --color-chart-4: var(--chart-4);
    --color-chart-5: var(--chart-5);
    --color-sidebar: var(--sidebar);
    --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
    --color-sidebar-accent: var(--sidebar-accent);
    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
    --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-ring: var(--sidebar-ring);
    --font-sans: var(--font-sans);
    --font-mono: var(--font-mono);
    --font-serif: var(--font-serif);
    --radius-sm: calc(var(--radius) - 4px);
    --radius-md: calc(var(--radius) - 2px);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) + 4px);
    --shadow-2xs: var(--shadow-2xs);
    --shadow-xs: var(--shadow-xs);
    --shadow-sm: var(--shadow-sm);
    --shadow: var(--shadow);
    --shadow-md: var(--shadow-md);
    --shadow-lg: var(--shadow-lg);
    --shadow-xl: var(--shadow-xl);
    --shadow-2xl: var(--shadow-2xl);
  }
}
```

`src/styles/theme.css` already maps those tokens once for every theme. Keep the `@theme inline` block in the new file so it matches the existing theme files.

The slug must be identical in the CSS selector, `THEMES[].value`, and the `index.html` list. Use kebab-case.

OKLCH is `oklch(lightness chroma hue)`:

- Lightness is `0`–`1`.
- Chroma is `0` for gray and higher for more saturated colors.
- Hue is `0`–`360` (`0` red, `120` green, `240` blue).

Minimum tokens: `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--border`, `--input`, `--ring`, and `--radius`. Chart, sidebar, shadow, and font tokens are optional.

`[data-theme] body` in `theme.css` applies `--font-sans`. On `/settings/appearance`, choosing `inter` or `manrope` adds `font-inter` or `font-manrope` on `<html>` and overrides that stack. `system` follows the color theme.

## Register the theme

`src/styles/theme.css`:

```css
@import './themes/your-theme-name.css';
```

`src/components/themes/theme.config.ts`:

```ts
export const THEMES = [
  // existing themes
  {
    name: 'Your Theme Name',
    value: 'your-theme-name',
  },
]
```

`index.html` boot script, inside `var themes = [...]`:

```js
'your-theme-name',
```

`ActiveThemeProvider` (`src/components/themes/active-theme.tsx`) reads `active_theme` and sets `data-theme`. Unknown cookie values fall back to `DEFAULT_THEME`.

## Fonts

Families load from the Google Fonts `<link>` in `index.html`. `src/styles/fonts.css` exposes them as `--font-*` on `:root`.

A theme can name a loaded family directly:

```css
[data-theme='notebook'] {
  --font-sans: 'Architects Daughter', sans-serif;
}
```

Or point at a variable that `fonts.css` defines:

```css
[data-theme='your-theme-name'] {
  --font-sans: var(--font-inter), sans-serif;
}
```

For a new family:

1. Add it to the Google Fonts URL in `index.html`.
2. If theme CSS calls `var(--font-your-name)`, add this to `src/styles/fonts.css`:

```css
:root {
  --font-your-name: 'Your Font Name', sans-serif;
}
```

Do not add appearance-only families to `src/config/fonts.ts` unless they should appear in the font picker. That list is only `system`, `inter`, and `manrope`.

## Check the theme

1. Run the dev server from `apps/web`.
2. Open the theme selector in the header or `/settings/appearance`.
3. Select the new theme and toggle light and dark.
4. To see the default, delete the `active_theme` cookie and reload.

## Troubleshooting

**The theme is missing from the selector.** It is not in `THEMES`, or the dev server has not reloaded `theme.config.ts`.

**Colors do not change.** The CSS file is not imported from `theme.css`, or the `data-theme` slug does not match `THEMES[].value`.

**The first paint uses another theme, then switches.** The boot script in `index.html` does not list the slug, or its fallback is not `DEFAULT_THEME`.

**Dark mode does not change colors.** Dark tokens must be under `[data-theme='your-theme-name'].dark`. `ThemeProvider` adds `dark` on `<html>`.

## Reference

- Example theme: `src/styles/themes/default.css`
- Imports and shared Tailwind mapping: `src/styles/theme.css`
- Font variables: `src/styles/fonts.css`
- Selector: `src/components/themes/theme-selector.tsx`
- Color-theme state: `src/components/themes/active-theme.tsx`
- Theme list and `DEFAULT_THEME`: `src/components/themes/theme.config.ts`
- Light/dark state: `src/context/theme-provider.tsx`
- Boot script: `index.html`
