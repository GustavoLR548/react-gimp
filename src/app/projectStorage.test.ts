import { afterEach, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { defineFrame } from '@react-gimp/sdk'
import { loadProjectValues, saveProjectValues, storageKey } from './projectStorage'

const frame = defineFrame({
  id: 'a',
  name: 'A',
  preset: 'square',
  schema: z.object({ title: z.string().min(1) }),
  defaults: { title: 'default title' },
  render: () => null,
})

afterEach(() => {
  localStorage.clear()
})

describe('loadProjectValues', () => {
  it('falls back to defaults when nothing is stored', () => {
    expect(loadProjectValues('p', [frame])).toEqual({ a: { title: 'default title' } })
  })

  it('falls back to defaults on corrupt JSON', () => {
    localStorage.setItem(storageKey('p'), '{not json')
    expect(loadProjectValues('p', [frame])).toEqual({ a: { title: 'default title' } })
  })

  it('falls back to defaults for a frame whose stored value no longer matches its schema', () => {
    localStorage.setItem(storageKey('p'), JSON.stringify({ a: { title: '' } }))
    expect(loadProjectValues('p', [frame])).toEqual({ a: { title: 'default title' } })
  })

  it('keeps a stored value that validates', () => {
    localStorage.setItem(storageKey('p'), JSON.stringify({ a: { title: 'saved' } }))
    expect(loadProjectValues('p', [frame])).toEqual({ a: { title: 'saved' } })
  })

  it('round-trips through saveProjectValues', () => {
    saveProjectValues('p', { a: { title: 'saved' } })
    expect(loadProjectValues('p', [frame])).toEqual({ a: { title: 'saved' } })
  })
})
