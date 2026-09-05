import { describe, expect, it } from 'vitest'
import { isCrossOrigin } from './cors'

describe('isCrossOrigin', () => {
  it('data: URIs are same-origin', () => {
    expect(isCrossOrigin('data:image/png;base64,abc')).toBe(false)
  })

  it('blob: URIs are same-origin', () => {
    expect(isCrossOrigin('blob:http://example.com/abc-123')).toBe(false)
  })

  it('same-origin relative paths are same-origin', () => {
    expect(isCrossOrigin('/images/photo.jpg')).toBe(false)
  })

  it('a different origin is cross-origin', () => {
    expect(isCrossOrigin('https://other-host.example/photo.jpg')).toBe(true)
  })
})
