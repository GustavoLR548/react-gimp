import { warnOnce } from './warnOnce'

// Chromium's 2D canvas backing store caps around 16384px per side; exceeding
// it silently rescales rather than erroring. Clamping here, before calling
// the rasterizer, turns that failure mode into a warnOnce instead of a
// silently wrong-sized file. See .spec/05-rasterize.md.
export const MAX_CANVAS_PX = 16384

// Shared between the asset guard and the rasterizer so a hung fetch/decode
// times out at the same threshold in both places.
export const DEFAULT_TIMEOUT_MS = 10000

export function safePixelRatio(size: { w: number; h: number }, requested: number): number {
  const ratio = Math.max(requested, 1)
  const longestSide = Math.max(size.w, size.h)
  const maxRatio = MAX_CANVAS_PX / longestSide

  if (ratio <= maxRatio) return ratio

  warnOnce(
    `raster-clamp-${size.w}x${size.h}`,
    `[gimp] pixelRatio ${ratio} would exceed the ${MAX_CANVAS_PX}px canvas size cap for a ${size.w}x${size.h} page. Clamped to ${maxRatio.toFixed(3)}.`,
  )
  return maxRatio
}
