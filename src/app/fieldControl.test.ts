import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { ui } from '../projects/defineProject'
import { fieldsFor } from './fieldControl'

describe('fieldsFor', () => {
  it('an explicit control hint wins over inference', () => {
    const schema = z.object({
      color: z.string().register(ui, { control: { kind: 'color' } }),
    })

    expect(fieldsFor(schema)).toEqual([{ key: 'color', meta: { control: { kind: 'color' } }, control: { kind: 'color' } }])
  })

  it('infers text/number/checkbox/select/url from the zod type when no hint is given', () => {
    const schema = z.object({
      name: z.string(),
      count: z.number(),
      active: z.boolean(),
      role: z.enum(['admin', 'guest']),
      site: z.url(),
    })

    const byKey = Object.fromEntries(fieldsFor(schema).map((f) => [f.key, f.control]))
    expect(byKey.name).toEqual({ kind: 'text' })
    expect(byKey.count).toEqual({ kind: 'number' })
    expect(byKey.active).toEqual({ kind: 'checkbox' })
    expect(byKey.role).toEqual({ kind: 'select', options: ['admin', 'guest'] })
    expect(byKey.site).toEqual({ kind: 'url' })
  })

  it('unwraps optional/nullable/default before inferring', () => {
    const schema = z.object({
      count: z.number().optional(),
      flag: z.boolean().nullable(),
      label: z.string().default('x'),
    })

    const byKey = Object.fromEntries(fieldsFor(schema).map((f) => [f.key, f.control]))
    expect(byKey.count).toEqual({ kind: 'number' })
    expect(byKey.flag).toEqual({ kind: 'checkbox' })
    expect(byKey.label).toEqual({ kind: 'text' })
  })

  it('sorts by meta.order, defaulting missing order to 0', () => {
    const schema = z.object({
      second: z.string().register(ui, { order: 1 }),
      first: z.string().register(ui, { order: 0 }),
      third: z.string(),
    })

    expect(fieldsFor(schema).map((f) => f.key)).toEqual(['first', 'third', 'second'])
  })
})
