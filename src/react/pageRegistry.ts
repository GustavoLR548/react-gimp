export type PageEntry = {
  id: string
  el: HTMLElement
  size: { w: number; h: number }
  name?: string
}

export type PageRegistry = {
  register(entry: PageEntry): () => void
  list(): PageEntry[]
  get(id: string): PageEntry | undefined
  subscribe(cb: () => void): () => void
}

// Lives in react/, not core/, despite holding no React — it stores
// HTMLElement references and core/ forbids DOM. See CLAUDE.md §4.
export function createPageRegistry(): PageRegistry {
  const entries = new Map<string, PageEntry>()
  const subscribers = new Set<() => void>()

  // list() is read via useSyncExternalStore (useExport.ts), which requires
  // a referentially-stable snapshot when nothing changed — otherwise every
  // render sees a "new" array and React treats the store as constantly
  // changing. Cached here and invalidated only on notify(). See
  // .spec/03-registry.md.
  let cachedList: PageEntry[] | null = null

  function notify(): void {
    cachedList = null
    for (const cb of subscribers) cb()
  }

  return {
    register(entry: PageEntry): () => void {
      const existing = entries.get(entry.id)
      if (existing && existing.el !== entry.el) {
        throw new Error(
          `[gimp] two <Page> components share the id "${entry.id}". Give every page a unique id.`,
        )
      }
      entries.set(entry.id, entry)
      notify()
      return () => {
        entries.delete(entry.id)
        notify()
      }
    },

    // DOM order, not registration order — a conditionally-rendered page
    // mounts later than its siblings and would otherwise land at the end of
    // the PDF/ZIP regardless of where it visually sits. Sorting by document
    // position is the only definition that is always visually correct.
    list(): PageEntry[] {
      if (cachedList) return cachedList
      cachedList = [...entries.values()].sort((a, b) => {
        const position = a.el.compareDocumentPosition(b.el)
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1
        return 0
      })
      return cachedList
    },

    get(id: string): PageEntry | undefined {
      return entries.get(id)
    },

    subscribe(cb: () => void): () => void {
      subscribers.add(cb)
      return () => subscribers.delete(cb)
    },
  }
}
