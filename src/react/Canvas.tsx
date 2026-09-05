import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { Size, Vec2 } from '../core/fit'
import { centerOffset, clampZoom, fitScale, zoomAtPoint } from '../core/fit'

export type CanvasLayout = 'column' | 'row'

export type CanvasProps = {
  zoom?: number | 'fit'
  onZoomChange?: (zoom: number) => void
  onZoomResolved?: (zoom: number) => void
  pan?: Vec2
  onPanChange?: (pan: Vec2) => void
  layout?: CanvasLayout
  gap?: number
  padding?: number
  background?: string
  minZoom?: number
  maxZoom?: number
  interactive?: boolean
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const ZERO_SIZE: Size = { w: 0, h: 0 }
const ZERO_VEC: Vec2 = { x: 0, y: 0 }

// The viewport. All zoom and pan live on .gm-stage, two DOM levels above
// .gm-pages/<Page> — the artboard itself is never transformed. See
// .spec/02-viewport.md.
export function Canvas(props: CanvasProps) {
  const {
    zoom = 'fit',
    onZoomChange,
    onZoomResolved,
    pan,
    onPanChange,
    layout = 'column',
    gap = 48,
    padding = 32,
    background = '#1c1c1e',
    minZoom = 0.05,
    maxZoom = 4,
    interactive = true,
    className,
    style,
    children,
  } = props

  const canvasRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<HTMLDivElement>(null)

  const [viewportSize, setViewportSize] = useState<Size>(ZERO_SIZE)
  const [contentSize, setContentSize] = useState<Size>(ZERO_SIZE)

  // A second ResizeObserver, on .gm-canvas itself, catches viewport resizes.
  useLayoutEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      setViewportSize({ w: el.clientWidth, h: el.clientHeight })
    })
    observer.observe(el)
    setViewportSize({ w: el.clientWidth, h: el.clientHeight })
    return () => observer.disconnect()
  }, [])

  // Measurement uses .gm-pages's offsetWidth/offsetHeight (layout values),
  // never getBoundingClientRect() there — that would read the
  // already-scaled rendered size and be circular. See .spec/02-viewport.md.
  useLayoutEffect(() => {
    const el = pagesRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      setContentSize({ w: el.offsetWidth, h: el.offsetHeight })
    })
    observer.observe(el)
    setContentSize({ w: el.offsetWidth, h: el.offsetHeight })
    return () => observer.disconnect()
  }, [])

  const numericZoom = typeof zoom === 'number' ? zoom : undefined
  const isFit = numericZoom === undefined

  const resolvedZoom = isFit
    ? fitScale(contentSize, viewportSize, { padding, max: 1 })
    : clampZoom(numericZoom, minZoom, maxZoom)

  useLayoutEffect(() => {
    if (!isFit) return
    onZoomResolved?.(resolvedZoom)
  }, [isFit, resolvedZoom, onZoomResolved])

  const resolvedPan = isFit ? centerOffset(contentSize, viewportSize, resolvedZoom) : (pan ?? ZERO_VEC)

  // Written imperatively, not as a React style prop: in 'fit' mode the
  // scale is derived from a ResizeObserver measurement, so routing it
  // through setState makes every resize a render->measure->render round
  // trip, painting at the stale scale for one frame. See .spec/02-viewport.md.
  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    stage.style.transform = `translate(${resolvedPan.x}px, ${resolvedPan.y}px) scale(${resolvedZoom})`
  }, [resolvedPan.x, resolvedPan.y, resolvedZoom])

  // Wheel-to-zoom must be a native listener: React 17+ attaches its
  // synthetic wheel listener passively at the root, so preventDefault()
  // inside a React onWheel handler silently does nothing. See CLAUDE.md §9.
  useLayoutEffect(() => {
    const el = canvasRef.current
    if (!el || !interactive) return

    const handleWheel = (e: WheelEvent): void => {
      e.preventDefault()
      if (numericZoom === undefined) return
      const rect = el.getBoundingClientRect()
      const point = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      const currentPan = pan ?? ZERO_VEC
      const delta = -e.deltaY * 0.001
      const nextZoom = clampZoom(numericZoom * (1 + delta), minZoom, maxZoom)
      const nextPan = zoomAtPoint({ point, pan: currentPan, zoom: numericZoom, nextZoom })
      onZoomChange?.(nextZoom)
      onPanChange?.(nextPan)
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [interactive, numericZoom, pan, minZoom, maxZoom, onZoomChange, onPanChange])

  // Panning is drag-scroll-style via pointer capture, deliberately not
  // native browser scrolling: a visible scrollbar changes the viewport's
  // content-box width, which changes the fit scale, which can make the
  // scrollbar disappear again — an oscillation. overflow:hidden on
  // .gm-canvas removes that feedback loop outright. No-op in 'fit' mode.
  // setPointerCapture on .gm-canvas itself, never window/document. See
  // CLAUDE.md §9.
  const dragRef = useRef<{ startX: number; startY: number; startPan: Vec2 } | null>(null)

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!interactive || numericZoom === undefined) return
      const el = canvasRef.current
      if (!el) return
      el.setPointerCapture(e.pointerId)
      dragRef.current = { startX: e.clientX, startY: e.clientY, startPan: pan ?? ZERO_VEC }
    },
    [interactive, numericZoom, pan],
  )

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current
      if (!drag) return
      const dx = e.clientX - drag.startX
      const dy = e.clientY - drag.startY
      onPanChange?.({ x: drag.startPan.x + dx, y: drag.startPan.y + dy })
    },
    [onPanChange],
  )

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const el = canvasRef.current
    if (el && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    dragRef.current = null
  }, [])

  return (
    <div
      ref={canvasRef}
      className={className ? `gm-canvas ${className}` : 'gm-canvas'}
      style={{ background, ...style }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div ref={stageRef} className="gm-stage">
        <div ref={pagesRef} className={`gm-pages gm-pages--${layout}`} style={{ gap }}>
          {children}
        </div>
      </div>
    </div>
  )
}
