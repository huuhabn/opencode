type ThemeTransitionPoint = {
  clientX: number
  clientY: number
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => void
}

export function startThemeTransition(
  update: () => void,
  origin?: ThemeTransitionPoint
) {
  const root = document.documentElement
  root.style.setProperty('--x', origin ? `${origin.clientX}px` : '50%')
  root.style.setProperty('--y', origin ? `${origin.clientY}px` : '50%')

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const start = (document as ViewTransitionDocument).startViewTransition
  if (reduce || typeof start !== 'function') {
    update()
    return
  }

  start.call(document, update)
}
