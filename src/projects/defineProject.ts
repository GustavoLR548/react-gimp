import type { ReactNode } from 'react'
import type { ZodObject } from 'zod'
import { z } from 'zod'
import type { PresetName } from '../core/presets'

export type Control =
  | { kind: 'text' }
  | { kind: 'textarea'; rows?: number }
  | { kind: 'color' }
  | { kind: 'url' }
  | { kind: 'file'; accept?: string; maxSizeBytes?: number }
  | { kind: 'number'; min?: number; max?: number; step?: number }
  | { kind: 'checkbox' }
  | { kind: 'select'; options: string[] }

// A file this size, base64-encoded into a data: URL, lands in the
// project's localStorage JSON blob — comfortably under the ~5-10MB
// same-origin quota even across several image fields, generously above
// what a compressed web photo needs to be.
export const DEFAULT_MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

export type ControlMeta = { label?: string; control?: Control; order?: number; help?: string }

// Compile-time-checked UI hints: schema.register(ui, {...}) fails tsc on a
// typo'd key, unlike globalRegistry.meta() where custom keys are `unknown`.
export const ui = z.registry<ControlMeta>()

export type FrameValues = Record<string, unknown>

export type FrameDef<S extends ZodObject = ZodObject> = {
  id: string
  name: string
  preset?: PresetName
  width?: number
  height?: number
  schema: S
  defaults: z.infer<S>
  render: (values: z.infer<S>) => ReactNode
}

// Type-erased sibling of FrameDef so frames with different schemas can live
// in one ProjectDef.frames array. render re-parses at the boundary — a
// genuine runtime validation point, not a cast (CLAUDE.md §7 bans `as`).
export type AnyFrameDef = {
  id: string
  name: string
  preset?: PresetName
  width?: number
  height?: number
  schema: ZodObject
  defaults: FrameValues
  render: (values: FrameValues) => ReactNode
}

export function defineFrame<S extends ZodObject>(def: FrameDef<S>): AnyFrameDef {
  return {
    ...def,
    render(values: FrameValues): ReactNode {
      return def.render(def.schema.parse(values))
    },
  }
}

export type ProjectDef = {
  id: string
  name: string
  description?: string
  layout?: 'row' | 'column'
  frames: AnyFrameDef[]
}

export function defineProject(def: ProjectDef): ProjectDef {
  const seen = new Set<string>()
  for (const frame of def.frames) {
    if (seen.has(frame.id)) {
      throw new Error(
        `[gimp] project "${def.id}" has two frames with id "${frame.id}". Give every frame a unique id.`,
      )
    }
    seen.add(frame.id)
  }
  return def
}
