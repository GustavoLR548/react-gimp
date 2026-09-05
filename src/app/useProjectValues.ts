import { useCallback, useState } from 'react'
import type { FrameValues, ProjectDef } from '../projects/defineProject'
import type { ProjectValues } from './projectStorage'
import { loadProjectValues, saveProjectValues } from './projectStorage'

export type UseProjectValuesResult = {
  values: ProjectValues
  setFrameValues: (frameId: string, values: FrameValues) => void
  resetFrame: (frameId: string) => void
}

// Navigation is a full page load (no client-side router — see
// .spec/08-projects.md), so this hook's lazy initial state never needs to
// react to `project` changing under it.
export function useProjectValues(project: ProjectDef): UseProjectValuesResult {
  const [values, setValues] = useState<ProjectValues>(() => loadProjectValues(project.id, project.frames))

  const setFrameValues = useCallback(
    (frameId: string, next: FrameValues) => {
      setValues((prev) => {
        const updated = { ...prev, [frameId]: next }
        saveProjectValues(project.id, updated)
        return updated
      })
    },
    [project.id],
  )

  const resetFrame = useCallback(
    (frameId: string) => {
      const frame = project.frames.find((f) => f.id === frameId)
      if (!frame) return
      setFrameValues(frameId, frame.defaults)
    },
    [project.frames, setFrameValues],
  )

  return { values, setFrameValues, resetFrame }
}
