import { afterEach, describe, expect, it } from 'vitest'
import { createPageRegistry } from './pageRegistry'

function appendDiv(id: string): HTMLElement {
  const el = document.createElement('div')
  el.id = id
  document.body.append(el)
  return el
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('createPageRegistry', () => {
  it('list() orders by document position, not registration order', () => {
    const registry = createPageRegistry()
    const elA = appendDiv('a')
    const elB = appendDiv('b')
    const elC = appendDiv('c')

    // Register out of DOM order: c, a, b.
    registry.register({ id: 'c', el: elC, size: { w: 1, h: 1 } })
    registry.register({ id: 'a', el: elA, size: { w: 1, h: 1 } })
    registry.register({ id: 'b', el: elB, size: { w: 1, h: 1 } })

    expect(registry.list().map((e) => e.id)).toEqual(['a', 'b', 'c'])
  })

  it('throws on a duplicate id from a different element, naming both', () => {
    const registry = createPageRegistry()
    const elA = appendDiv('a')
    const elB = appendDiv('b')

    registry.register({ id: 'hero', el: elA, size: { w: 1, h: 1 } })
    expect(() => registry.register({ id: 'hero', el: elB, size: { w: 1, h: 1 } })).toThrow(
      '[gimp]',
    )
    expect(() => registry.register({ id: 'hero', el: elB, size: { w: 1, h: 1 } })).toThrow(
      'hero',
    )
  })

  it('register returns an unregister that removes the entry', () => {
    const registry = createPageRegistry()
    const el = appendDiv('a')
    const unregister = registry.register({ id: 'a', el, size: { w: 1, h: 1 } })

    expect(registry.get('a')).toBeDefined()
    unregister()
    expect(registry.get('a')).toBeUndefined()
  })

  it('subscribe notifies on register and unregister', () => {
    const registry = createPageRegistry()
    const el = appendDiv('a')
    let calls = 0
    const unsubscribe = registry.subscribe(() => {
      calls++
    })

    const unregister = registry.register({ id: 'a', el, size: { w: 1, h: 1 } })
    expect(calls).toBe(1)
    unregister()
    expect(calls).toBe(2)

    unsubscribe()
  })
})
