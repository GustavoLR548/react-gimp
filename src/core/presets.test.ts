import { describe, expect, it } from 'vitest'
import { aspectOf, PRESETS, resolvePageSize } from './presets'

describe('resolvePageSize', () => {
  it('throws when neither preset nor width/height is given', () => {
    expect(() => resolvePageSize({})).toThrow('[gimp]')
  })

  it('throws when both preset and width/height are given', () => {
    expect(() => resolvePageSize({ preset: 'youtube', width: 100, height: 100 })).toThrow('[gimp]')
  })

  it('resolves a preset by name', () => {
    expect(resolvePageSize({ preset: 'og' })).toEqual({ w: 1200, h: 630 })
  })

  it('resolves explicit width/height', () => {
    expect(resolvePageSize({ width: 400, height: 300 })).toEqual({ w: 400, h: 300 })
  })
})

describe('PRESETS', () => {
  it('has the exact aspect values', () => {
    expect(PRESETS.youtube).toEqual({ w: 1280, h: 720 })
    expect(PRESETS.og).toEqual({ w: 1200, h: 630 })
    expect(PRESETS.square).toEqual({ w: 1080, h: 1080 })
    expect(PRESETS.fullhd).toEqual({ w: 1920, h: 1080 })
  })
})

describe('aspectOf', () => {
  it('computes width over height', () => {
    expect(aspectOf({ w: 1280, h: 720 })).toBeCloseTo(16 / 9, 9)
    expect(aspectOf({ w: 1080, h: 1080 })).toBe(1)
  })
})
