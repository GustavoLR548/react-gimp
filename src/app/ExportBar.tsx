import { useState } from 'react'
import { useExport } from '../react/useExport'

export type ExportBarProps = {
  selectedId?: string
}

export function ExportBar({ selectedId }: ExportBarProps) {
  const { pages, state, exportPage, exportPdf, exportZip } = useExport()
  const [manualId, setManualId] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)

  // Retargeted at the currently selected frame by default — falls back to
  // the first page, and to whatever the dropdown was last set to.
  const activeId = manualId ?? selectedId ?? pages[0]?.id

  async function run(fn: () => Promise<void>): Promise<void> {
    setError(undefined)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className="flex items-center gap-3 border-t border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-200">
      <select
        className="rounded bg-neutral-800 px-2 py-1"
        value={activeId}
        onChange={(e) => setManualId(e.target.value)}
      >
        {pages.map((page) => (
          <option key={page.id} value={page.id}>
            {page.name ?? page.id}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={state.isExporting || !activeId}
        onClick={() => activeId && run(() => exportPage(activeId))}
        className="rounded bg-blue-600 px-3 py-1 hover:bg-blue-500 disabled:opacity-50"
      >
        Export Single
      </button>

      <button
        type="button"
        disabled={state.isExporting}
        onClick={() => run(() => exportPdf())}
        className="rounded bg-blue-600 px-3 py-1 hover:bg-blue-500 disabled:opacity-50"
      >
        Export All as PDF
      </button>

      <button
        type="button"
        disabled={state.isExporting}
        onClick={() => run(() => exportZip())}
        className="rounded bg-blue-600 px-3 py-1 hover:bg-blue-500 disabled:opacity-50"
      >
        Export All as ZIP
      </button>

      {state.isExporting && (
        <span className="text-neutral-400">
          Exporting {state.done}/{state.total}…
        </span>
      )}

      {error && <span className="text-red-400">{error}</span>}
    </div>
  )
}
