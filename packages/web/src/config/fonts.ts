/**
 * Appearance font override for `/settings/appearance`.
 *
 * `system` follows the active color theme (`--font-sans` on `[data-theme]`).
 * `inter` and `manrope` override that theme font. See `theme.css`.
 *
 * Tailwind utilities `font-inter` and `font-manrope` come from `@theme inline`
 * in `theme.css`. Theme CSS that calls `var(--font-inter)` reads the runtime
 * variables in `styles/fonts.css`. Families are loaded from `index.html`.
 */
export const fonts = ['system', 'inter', 'manrope'] as const
