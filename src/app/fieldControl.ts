import type { ZodObject, ZodType } from 'zod'
import type { Control, ControlMeta } from '../projects/defineProject'
import { ui } from '../projects/defineProject'

export type FieldSpec = { key: string; meta: ControlMeta; control: Control }

const WRAPPER_TYPES = new Set(['optional', 'nullable', 'default', 'prefault'])

// zod v4 exposes schema internals as _zod.def, never a public `.def` — see
// node_modules/zod/v4/core/schemas.d.ts. Unwrap optional/nullable/default so
// inference sees the field it actually wraps.
function unwrap(field: ZodType): ZodType {
  const def = field._zod.def as { type: string; innerType?: ZodType }
  if (WRAPPER_TYPES.has(def.type) && def.innerType) return unwrap(def.innerType)
  return field
}

// Only used when a field carries no explicit `control` hint via
// `.register(ui, {...})` — the primary, compile-time-checked path.
function inferControl(field: ZodType): Control {
  const inner = unwrap(field)
  const def = inner._zod.def as { type: string; format?: string; entries?: Record<string, string | number> }

  if (def.type === 'string' && def.format === 'url') return { kind: 'url' }
  if (def.type === 'number') return { kind: 'number' }
  if (def.type === 'boolean') return { kind: 'checkbox' }
  if (def.type === 'enum' && def.entries) return { kind: 'select', options: Object.values(def.entries).map(String) }
  return { kind: 'text' }
}

// Walks an object schema's shape into a sorted, control-resolved field list
// for the Inspector — explicit hints win, inference is the fallback.
export function fieldsFor(schema: ZodObject): FieldSpec[] {
  return Object.entries(schema.shape)
    .map(([key, field]) => {
      const meta = ui.get(field as ZodType) ?? {}
      const control = meta.control ?? inferControl(field as ZodType)
      return { key, meta, control }
    })
    .sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0))
}
