import { describe, expect, it } from 'vitest'
import { pdfPageSpec, pxToPt, PT_PER_IN, PX_PER_IN } from './units'

describe('constants', () => {
  it('are the standard DPI conversion factors', () => {
    expect(PX_PER_IN).toBe(96)
    expect(PT_PER_IN).toBe(72)
  })
})

describe('pxToPt', () => {
  it('converts 96px to exactly 72pt', () => {
    expect(pxToPt(96)).toBe(72)
  })
})

describe('pdfPageSpec', () => {
  it('converts 1200x630 to 900x472.5pt landscape', () => {
    const spec = pdfPageSpec({ w: 1200, h: 630 })
    expect(spec.wPt).toBeCloseTo(900, 9)
    expect(spec.hPt).toBeCloseTo(472.5, 9)
    expect(spec.orientation).toBe('landscape')
  })

  it('converts 1080x1080 to 810x810pt, tie-breaking to portrait', () => {
    const spec = pdfPageSpec({ w: 1080, h: 1080 })
    expect(spec.wPt).toBeCloseTo(810, 9)
    expect(spec.hPt).toBeCloseTo(810, 9)
    expect(spec.orientation).toBe('portrait')
  })
})
