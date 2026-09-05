import { resolvePageSize } from '../core/presets'
import type { ProjectDef } from '../projects/defineProject'

export type ProjectIndexProps = {
  projects: ProjectDef[]
}

export function ProjectIndex({ projects }: ProjectIndexProps) {
  return (
    <div className="h-screen overflow-y-auto bg-neutral-950 p-10 text-neutral-200">
      <h1 className="text-2xl font-bold">react-gimp projects</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <a
            key={project.id}
            href={`?project=${project.id}`}
            data-gimp-project={project.id}
            className="flex flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-5 hover:border-neutral-600"
          >
            <ProjectSchematic project={project} />
            <div>
              <h2 className="font-semibold">{project.name}</h2>
              {project.description && <p className="mt-1 text-sm text-neutral-400">{project.description}</p>}
              <p className="mt-2 text-xs text-neutral-500">
                {project.frames.length} frame{project.frames.length === 1 ? '' : 's'}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

const SCHEMATIC_MAX_PX = 64

type SchematicGroup = { w: number; h: number; count: number }

// Groups frames by identical size so three same-size carousel slides render
// as one labeled rectangle ("1080×1080 ×3") instead of three — this is
// exactly the "which design is this" glance the landing page exists for.
function schematicGroups(project: ProjectDef): SchematicGroup[] {
  const groups = new Map<string, SchematicGroup>()
  for (const frame of project.frames) {
    const size = resolvePageSize({ preset: frame.preset, width: frame.width, height: frame.height })
    const key = `${size.w}x${size.h}`
    const existing = groups.get(key)
    if (existing) {
      existing.count += 1
      continue
    }
    groups.set(key, { ...size, count: 1 })
  }
  return [...groups.values()]
}

function ProjectSchematic({ project }: { project: ProjectDef }) {
  const groups = schematicGroups(project)
  const maxDim = Math.max(...groups.flatMap((group) => [group.w, group.h]))
  const scale = SCHEMATIC_MAX_PX / maxDim

  return (
    <div className="flex h-20 items-end gap-3">
      {groups.map((group) => (
        <div key={`${group.w}x${group.h}`} className="flex flex-col items-center gap-1">
          <div
            className="rounded border border-neutral-600 bg-neutral-800"
            style={{ width: group.w * scale, height: group.h * scale }}
          />
          <span className="text-[10px] text-neutral-500">
            {group.w}×{group.h}
            {group.count > 1 ? ` ×${group.count}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}
