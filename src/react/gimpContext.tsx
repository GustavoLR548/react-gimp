import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import type { PageRegistry } from './pageRegistry'
import { createPageRegistry } from './pageRegistry'

const PageRegistryContext = createContext<PageRegistry | undefined>(undefined)

// One context, one concern — the raw context is never exported. See
// CLAUDE.md §9.
export function usePageRegistry(): PageRegistry {
  const registry = useContext(PageRegistryContext)
  if (!registry) {
    throw new Error('[gimp] usePageRegistry (and usePages/useExport) must be used inside <Gimp>.')
  }
  return registry
}

export type GimpProps = {
  children?: ReactNode
}

export function Gimp({ children }: GimpProps) {
  const [registry] = useState(createPageRegistry)
  return <PageRegistryContext.Provider value={registry}>{children}</PageRegistryContext.Provider>
}
