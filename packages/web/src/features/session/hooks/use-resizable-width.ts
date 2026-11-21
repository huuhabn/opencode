import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function useResizableWidth(
  storageKey: string,
  options: { defaultWidth: number; min: number; max: number }
) {
  const [width, setWidth] = useState(() => {
    if (typeof localStorage === 'undefined') return options.defaultWidth
    const saved = Number(localStorage.getItem(storageKey))
    if (!Number.isFinite(saved)) return options.defaultWidth
    return clamp(saved, options.min, options.max)
  })

  const widthRef = useRef(width)
  useEffect(() => {
    widthRef.current = width
  }, [width])

  /** direction: 1 = drag right grows width (left sidebar); -1 = drag left grows width (right sidebar) */
  const beginResize = useCallback(
    (event: ReactMouseEvent, direction: 1 | -1 = 1) => {
      event.preventDefault()
      const startX = event.clientX
      const startWidth = widthRef.current

      const onMove = (ev: MouseEvent) => {
        const next = clamp(
          startWidth + direction * (ev.clientX - startX),
          options.min,
          options.max
        )
        widthRef.current = next
        setWidth(next)
      }

      const onUp = () => {
        localStorage.setItem(storageKey, String(widthRef.current))
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [options.max, options.min, storageKey]
  )

  return { width, beginResize }
}
