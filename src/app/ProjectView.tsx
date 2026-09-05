import { useState } from 'react'
import type { Vec2 } from '../core/fit'
import { Canvas } from '../react/Canvas'
import { Gimp } from '../react/gimpContext'
import type { ProjectDef } from '../projects/defineProject'
import { ExportBar } from './ExportBar'
import { ExportModeBridge } from './exportMode'
import { FrameSlot } from './FrameSlot'
import { Inspector } from './Inspector'
import { useProjectValues } from './useProjectValues'

const ZERO_PAN: Vec2 = { x: 0, y: 0 }

const ZOOM_PRESETS: Array<{ label: string; value: number | 'fit' }> = [
  { label: '50%', value: 0.5 },
  { label: '100%', value: 1 },
  { label: 'Fit', value: 'fit' },
]

export type ProjectViewProps = {
  project: ProjectDef
  exportMode: boolean
}

// Only this project's frames ever mount — export scoping comes free, since
// useExport reads the page registry that only these <Page>s register into.
// See .spec/08-projects.md.
export function ProjectView({ project, exportMode }: ProjectViewProps) {
  const [zoom, setZoom] = useState<number | 'fit'>('fit')
  const [pan, setPan] = useState<Vec2>(ZERO_PAN)
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const { values, setFrameValues, resetFrame } = useProjectValues(project)

  const selectedFrame = project.frames.find((frame) => frame.id === selectedId)

  return (
    <Gimp>
      <ExportModeBridge active={exportMode} />
      <div className="flex h-screen flex-col bg-neutral-950">
        {!exportMode && (
          <div className="flex items-center gap-4 border-b border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-200">
            <a href="?" className="text-neutral-400 hover:text-neutral-200 hover:underline">
              ← Projects
            </a>
            <span className="font-medium">{project.name}</span>

            <div className="ml-auto flex items-center gap-1">
              {ZOOM_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setZoom(preset.value)}
                  className={`rounded px-2 py-1 ${zoom === preset.value ? 'bg-blue-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700'}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1" onClick={() => setSelectedId(undefined)}>
            <Canvas
              zoom={exportMode ? 1 : zoom}
              onZoomChange={setZoom}
              pan={exportMode ? ZERO_PAN : pan}
              onPanChange={setPan}
              layout={project.layout ?? 'row'}
            >
              {project.frames.map((frame) => (
                <FrameSlot
                  key={frame.id}
                  frame={frame}
                  values={values[frame.id] ?? frame.defaults}
                  selected={!exportMode && selectedId === frame.id}
                  onSelect={exportMode ? undefined : () => setSelectedId(frame.id)}
                />
              ))}
            </Canvas>
          </div>

          {!exportMode && selectedFrame && (
            <Inspector
              frame={selectedFrame}
              values={values[selectedFrame.id] ?? selectedFrame.defaults}
              onChange={(next) => setFrameValues(selectedFrame.id, next)}
              onReset={() => resetFrame(selectedFrame.id)}
            />
          )}
        </div>

        {!exportMode && <ExportBar selectedId={selectedId} />}
      </div>
    </Gimp>
  )
}
