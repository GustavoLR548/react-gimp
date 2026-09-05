import { describe, expect, it } from 'vitest'
import { centerOffset, clampZoom, fitScale, zoomAtPoint } from './fit'

describe('fitScale', () => {
  it('applies padding correctly', () => {
    const scale = fitScale({ w: 1000, h: 500 }, { w: 1200, h: 700 }, { padding: 50, max: 10 })
    expect(scale).toBeCloseTo(Math.min(1100 / 1000, 600 / 500), 9)
  })

  it('never exceeds max', () => {
    const scale = fitScale({ w: 100, h: 100 }, { w: 5000, h: 5000 })
    expect(scale).toBeLessThanOrEqual(1)
  })

  it('zero-size viewport returns 1, never NaN/Infinity', () => {
    expect(fitScale({ w: 100, h: 100 }, { w: 0, h: 0 })).toBe(1)
  })

  it('zero-size content returns 1, never NaN/Infinity', () => {
    expect(fitScale({ w: 0, h: 0 }, { w: 100, h: 100 })).toBe(1)
  })
})

describe('centerOffset', () => {
  it('centers scaled content in the viewport', () => {
    const offset = centerOffset({ w: 100, h: 100 }, { w: 300, h: 200 }, 1)
    expect(offset).toEqual({ x: 100, y: 50 })
  })
})

describe('clampZoom', () => {
  it('clamps within bounds', () => {
    expect(clampZoom(5, 0.1, 4)).toBe(4)
    expect(clampZoom(0.01, 0.1, 4)).toBe(0.1)
    expect(clampZoom(1, 0.1, 4)).toBe(1)
  })

  it('throws when min exceeds max', () => {
    expect(() => clampZoom(1, 4, 0.1)).toThrow('[gimp]')
  })
})

describe('zoomAtPoint', () => {
  it('keeps the world point under the cursor fixed on screen', () => {
    const point = { x: 400, y: 300 }
    const pan = { x: -50, y: -20 }
    const zoom = 1
    const nextZoom = 2
    const result = zoomAtPoint({ point, pan, zoom, nextZoom })

    const worldX = (point.x - pan.x) / zoom
    const worldY = (point.y - pan.y) / zoom
    const screenX = result.x + worldX * nextZoom
    const screenY = result.y + worldY * nextZoom
    expect(screenX).toBeCloseTo(point.x, 9)
    expect(screenY).toBeCloseTo(point.y, 9)
  })

  it('zoom-in-then-zoom-out returns the original pan to 1e-9 (fixed seed)', () => {
    let seed = 42
    function rand(): number {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }

    for (let i = 0; i < 50; i++) {
      const point = { x: rand() * 1000, y: rand() * 1000 }
      const pan = { x: rand() * 500 - 250, y: rand() * 500 - 250 }
      const zoom = 0.2 + rand() * 3
      const midZoom = 0.2 + rand() * 3

      const zoomedIn = zoomAtPoint({ point, pan, zoom, nextZoom: midZoom })
      const zoomedOut = zoomAtPoint({ point, pan: zoomedIn, zoom: midZoom, nextZoom: zoom })

      expect(zoomedOut.x).toBeCloseTo(pan.x, 9)
      expect(zoomedOut.y).toBeCloseTo(pan.y, 9)
    }
  })
})
