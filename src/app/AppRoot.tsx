import { projects } from '@react-gimp/projects'
import { ProjectIndex } from './ProjectIndex'
import { ProjectView } from './ProjectView'

// No client-side router: read the URL once, pick from the manifest, render.
// Navigation is a plain <a href="?project=...">, so switching projects is a
// full page load and nothing here needs to react to the URL changing.
export function AppRoot() {
  const params = new URLSearchParams(window.location.search)
  const project = projects.find((p) => p.id === params.get('project'))

  if (!project) return <ProjectIndex projects={projects} />
  return <ProjectView project={project} exportMode={params.get('export') === '1'} />
}
