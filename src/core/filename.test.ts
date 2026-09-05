import { describe, expect, it } from 'vitest'
import { extFor, mimeFor, pageFilename, slugify } from './filename'

describe('slugify', () => {
  it('lowercases and dashes spaces', () => {
    expect(slugify('Hero Slide')).toBe('hero-slide')
  })

  it('strips accents/unicode diacritics', () => {
    expect(slugify('café menú')).toBe('cafe-menu')
  })

  it('replaces slashes without emitting //', () => {
    expect(slugify('a/b//c')).not.toContain('//')
    expect(slugify('a/b//c')).toBe('a-b-c')
  })

  it('never emits an empty stem', () => {
    expect(slugify('   ')).toBe('page')
    expect(slugify('!!!')).toBe('page')
  })
})

describe('pageFilename', () => {
  it('zero-pads to the width of the total count', () => {
    expect(pageFilename({ id: 'hero', index: 3, total: 12, ext: 'png' })).toBe('03-hero.png')
    expect(pageFilename({ id: 'hero', index: 3, total: 999, ext: 'png' })).toBe('003-hero.png')
  })

  it('supports a prefix', () => {
    expect(pageFilename({ prefix: 'slide-', id: 'a', index: 0, total: 1, ext: 'png' })).toBe(
      'slide-0-a.png',
    )
  })
})

describe('extFor / mimeFor', () => {
  it('maps png', () => {
    expect(extFor('png')).toBe('png')
    expect(mimeFor('png')).toBe('image/png')
  })

  it('maps jpg', () => {
    expect(extFor('jpg')).toBe('jpg')
    expect(mimeFor('jpg')).toBe('image/jpeg')
  })
})
