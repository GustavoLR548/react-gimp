import { afterEach, describe, expect, it, vi } from 'vitest'
import { MAX_CANVAS_PX, safePixelRatio } from './raster'

describe('safePixelRatio', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('passes through untouched below the cap', () => {
    expect(safePixelRatio({ w: 1280, h: 720 }, 2)).toBe(2)
  })

  it('clamps above the cap with a warnOnce', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const size = { w: 8000, h: 8000 }
    const clamped = safePixelRatio(size, 4)
    expect(clamped).toBeCloseTo(MAX_CANVAS_PX / 8000, 9)
    expect(clamped).toBeLessThan(4)
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain('[gimp]')
  })

  it('never returns less than 1', () => {
    expect(safePixelRatio({ w: 100, h: 100 }, 0.1)).toBe(1)
  })
})
