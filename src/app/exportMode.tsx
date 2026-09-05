import { useEffect } from 'react'
import type { RasterOpts } from '../react/useExport'
import { useExport } from '../react/useExport'

export type GimpBridge = {
  listPages(): Array<{ id: string; name?: string; size: { w: number; h: number } }>
  renderPage(id: string, opts?: RasterOpts): Promise<Blob>
}

declare global {
  interface Window {
    __gimp?: GimpBridge
  }
}

export type ExportModeBridgeProps = {
  active: boolean
}

// ?export=1 exposes window.__gimp, letting scripts/export-headless.ts's
// optional exact-parity mode call the identical modern-screenshot path
// inside a real browser and diff it byte-for-byte against a local export.
// Not required for the MVP path (that one uses Playwright's own
// elementHandle.screenshot()) — see .spec/07-headless.md.
export function ExportModeBridge({ active }: ExportModeBridgeProps) {
  const { pages, renderPage } = useExport()

  useEffect(() => {
    if (!active) return
    window.__gimp = {
      listPages: () => pages,
      renderPage,
    }
    return () => {
      window.__gimp = undefined
    }
  }, [active, pages, renderPage])

  return null
}

export function isExportMode(): boolean {
  return new URLSearchParams(window.location.search).get('export') === '1'
}
