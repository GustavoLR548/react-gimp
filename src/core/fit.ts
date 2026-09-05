export type Size = { w: number; h: number }
export type Vec2 = { x: number; y: number }

export type FitScaleOpts = {
  padding?: number
  max?: number
}

// A zero-size viewport (not yet measured by ResizeObserver) must return a
// sane scale, never NaN/Infinity — the stage transform is written from this
// value every layout pass. `max: 1` by default so fit never upscales past
// 100%: a small page in a large viewport should render crisp, not soft.
export function fitScale(content: Size, viewport: Size, opts: FitScaleOpts = {}): number {
  const { padding = 0, max = 1 } = opts

  if (viewport.w <= 0 || viewport.h <= 0) return 1
  if (content.w <= 0 || content.h <= 0) return 1

  const availW = Math.max(viewport.w - padding * 2, 0)
  const availH = Math.max(viewport.h - padding * 2, 0)
  if (availW <= 0 || availH <= 0) return Math.min(max, 1e-6)

  const scale = Math.min(availW / content.w, availH / content.h)
  return Math.min(scale, max)
}

// Centers `content` (already scaled) inside `viewport`, as a pan offset in
// viewport-space pixels, for the stage's translate(x, y).
export function centerOffset(content: Size, viewport: Size, scale: number): Vec2 {
  return {
    x: (viewport.w - content.w * scale) / 2,
    y: (viewport.h - content.h * scale) / 2,
  }
}

export function clampZoom(zoom: number, min: number, max: number): number {
  if (min > max) {
    throw new Error(`[gimp] clampZoom: min (${min}) is greater than max (${max}).`)
  }
  return Math.min(Math.max(zoom, min), max)
}

export type ZoomAtPointOpts = {
  point: Vec2 // cursor position in viewport space
  pan: Vec2 // current stage translate
  zoom: number // current zoom
  nextZoom: number // desired zoom, already clamped by the caller
}

// Keeps the world point under the cursor fixed on screen while zooming.
// Property-tested: zoom-in-then-zoom-out returns the original pan to 1e-9 —
// this is exactly the kind of thing that silently drifts. See .spec/02.
export function zoomAtPoint(opts: ZoomAtPointOpts): Vec2 {
  const { point, pan, zoom, nextZoom } = opts
  const worldX = (point.x - pan.x) / zoom
  const worldY = (point.y - pan.y) / zoom
  return {
    x: point.x - worldX * nextZoom,
    y: point.y - worldY * nextZoom,
  }
}
