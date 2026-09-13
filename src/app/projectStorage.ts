import { warnOnce } from '../core/warnOnce'
import type { AnyFrameDef, FrameValues } from '@react-gimp/sdk'

export type ProjectValues = Record<string, FrameValues>

export function storageKey(projectId: string): string {
  return `gimp:project:${projectId}`
}

function defaultsOf(frames: AnyFrameDef[]): ProjectValues {
  return Object.fromEntries(frames.map((frame) => [frame.id, frame.defaults]))
}

// Every stored frame is re-validated through its own schema — a stale entry
// (frame removed, schema changed) falls back to defaults with a warnOnce
// rather than crashing or rendering garbage. See CLAUDE.md §12.
export function loadProjectValues(projectId: string, frames: AnyFrameDef[]): ProjectValues {
  const fallback = defaultsOf(frames)

  let raw: string | null
  try {
    raw = localStorage.getItem(storageKey(projectId))
  } catch {
    return fallback
  }
  if (!raw) return fallback

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    warnOnce(
      `gimp:storage:parse:${projectId}`,
      `[gimp] stored values for project "${projectId}" are corrupt JSON. Falling back to defaults.`,
    )
    return fallback
  }
  if (typeof parsed !== 'object' || parsed === null) return fallback
  const stored = parsed as Record<string, unknown>

  const result = { ...fallback }
  for (const frame of frames) {
    if (!(frame.id in stored)) continue
    const validated = frame.schema.safeParse(stored[frame.id])
    if (validated.success) {
      result[frame.id] = validated.data as FrameValues
      continue
    }
    warnOnce(
      `gimp:storage:invalid:${projectId}:${frame.id}`,
      `[gimp] stored values for frame "${frame.id}" in project "${projectId}" no longer match its schema. Falling back to defaults for this frame.`,
    )
  }
  return result
}

export function saveProjectValues(projectId: string, values: ProjectValues): void {
  try {
    localStorage.setItem(storageKey(projectId), JSON.stringify(values))
  } catch {
    warnOnce(
      `gimp:storage:write:${projectId}`,
      `[gimp] could not persist project "${projectId}" to localStorage. Edits will not survive a reload.`,
    )
  }
}
