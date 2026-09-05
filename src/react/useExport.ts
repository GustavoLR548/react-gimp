import { useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { pageFilename, slugify } from '../core/filename'
import type { PdfCapture } from '../export/exportPdf'
import type { RasterOpts } from '../export/rasterize'
import type { ZipFile } from '../export/exportZip'
import { usePageRegistry } from './gimpContext'
import type { PageEntry, PageRegistry } from './pageRegistry'

export type { RasterOpts } from '../export/rasterize'

export type ExportPageOpts = RasterOpts & { filename?: string }
export type ExportPdfOpts = RasterOpts & { filename?: string; pageIds?: string[] }
export type ExportZipOpts = RasterOpts & { filename?: string; prefix?: string; pageIds?: string[] }

export type PageInfo = { id: string; name?: string; size: { w: number; h: number } }
export type ExportState = { isExporting: boolean; done: number; total: number }

export type UseExportResult = {
  pages: PageInfo[]
  state: ExportState
  exportPage(id: string, opts?: ExportPageOpts): Promise<void>
  exportPdf(opts?: ExportPdfOpts): Promise<void>
  exportZip(opts?: ExportZipOpts): Promise<void>
  renderPage(id: string, opts?: RasterOpts): Promise<Blob>
}

function toPageInfo(entry: PageEntry): PageInfo {
  return { id: entry.id, name: entry.name, size: entry.size }
}

function resolveEntries(registry: PageRegistry, pageIds?: string[]): PageEntry[] {
  if (!pageIds) return registry.list()
  return pageIds.map((id) => {
    const entry = registry.get(id)
    if (!entry) throw new Error(`[gimp] no <Page id="${id}"> is registered.`)
    return entry
  })
}

function dataUrlToBase64(dataUrl: string): string {
  const comma = dataUrl.indexOf(',')
  return comma === -1 ? dataUrl : dataUrl.slice(comma + 1)
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}

// Every src/export/* import is dynamic, at the call site, inside this
// function — modern-screenshot, jspdf, jszip must never enter the
// authoring/render chunk. See .spec/05-rasterize.md.
async function captureOne(entry: PageEntry, opts: RasterOpts) {
  const [{ assertCapturable, pauseAmbient, capturePage }, { waitForAssets, forceEagerImages }, { preflightCors }] =
    await Promise.all([import('../export/rasterize'), import('../export/assets'), import('../export/cors')])

  preflightCors(entry.el, entry.id)

  // Mutate-then-restore-closure idiom, ported from react-prezi's
  // exportPptx.ts. Restores run in reverse in the same finally block even
  // when capturePage throws mid-loop. See .spec/05-rasterize.md.
  const restore = [assertCapturable(entry.el), forceEagerImages(entry.el), pauseAmbient(entry.el)]
  try {
    await waitForAssets(entry.el)
    return await capturePage({ id: entry.id, el: entry.el, size: entry.size }, opts)
  } finally {
    for (const r of restore.reverse()) r()
  }
}

// Static engine, no per-frame path (CLAUDE.md §2) — ordinary React state is
// fine here, as long as it only updates *between* captures, never inside
// the await window of a single rasterize call.
export function useExport(): UseExportResult {
  const registry = usePageRegistry()
  // useSyncExternalStore, not useState+useEffect: a plain effect-based
  // subscription only listens for *future* notify() calls — it misses
  // entries that registered during the same commit, before the
  // subscription effect ran (Page's own registration is a layout effect,
  // which always fires before this hook's passive effect would). See
  // .spec/03-registry.md.
  const entries = useSyncExternalStore(registry.subscribe, registry.list)
  const pages = useMemo(() => entries.map(toPageInfo), [entries])
  const [state, setState] = useState<ExportState>({ isExporting: false, done: 0, total: 0 })
  const isExportingRef = useRef(false)

  // Guards re-entrancy — a second export call while one is in flight throws
  // rather than interleaving two concurrent DOM mutations on the same
  // pages.
  async function guardExport<T>(total: number, fn: (onDone: () => void) => Promise<T>): Promise<T> {
    if (isExportingRef.current) {
      throw new Error('[gimp] an export is already in progress. Wait for it to finish before starting another.')
    }
    isExportingRef.current = true
    setState({ isExporting: true, done: 0, total })
    let done = 0
    try {
      return await fn(() => {
        done += 1
        setState({ isExporting: true, done, total })
      })
    } finally {
      isExportingRef.current = false
      setState({ isExporting: false, done: 0, total: 0 })
    }
  }

  async function exportPage(id: string, opts: ExportPageOpts = {}): Promise<void> {
    const { filename, ...rasterOpts } = opts
    const format = rasterOpts.format ?? 'png'

    await guardExport(1, async (onDone) => {
      const entry = registry.get(id)
      if (!entry) throw new Error(`[gimp] no <Page id="${id}"> is registered.`)

      const result = await captureOne(entry, { ...rasterOpts, format })
      onDone()

      const { download } = await import('../export/download')
      download(await dataUrlToBlob(result.dataUrl), filename ?? `${slugify(entry.id)}.${result.ext}`)
    })
  }

  async function renderPage(id: string, opts: RasterOpts = {}): Promise<Blob> {
    return guardExport(1, async (onDone) => {
      const entry = registry.get(id)
      if (!entry) throw new Error(`[gimp] no <Page id="${id}"> is registered.`)

      const result = await captureOne(entry, opts)
      onDone()
      return dataUrlToBlob(result.dataUrl)
    })
  }

  async function exportPdf(opts: ExportPdfOpts = {}): Promise<void> {
    const { filename = 'pages.pdf', pageIds, ...rasterOpts } = opts
    // Ten 5760px PNGs would make a several-hundred-MB PDF; jpg is the sane
    // default. See .spec/06-pdf-zip.md.
    const format = rasterOpts.format ?? 'jpg'
    const quality = rasterOpts.quality ?? 0.92
    const entries = resolveEntries(registry, pageIds)
    if (entries.length === 0) throw new Error('[gimp] exportPdf: no pages to export.')

    await guardExport(entries.length, async (onDone) => {
      const captures: PdfCapture[] = []
      let fontCssText = rasterOpts.fontCssText

      for (const entry of entries) {
        const result = await captureOne(entry, { ...rasterOpts, format, quality, fontCssText })
        fontCssText = result.fontCssText
        captures.push({ dataUrl: result.dataUrl, size: entry.size, format: result.format })
        onDone()
      }

      const { buildPdf } = await import('../export/exportPdf')
      const { download } = await import('../export/download')
      download(await buildPdf(captures), filename)
    })
  }

  async function exportZip(opts: ExportZipOpts = {}): Promise<void> {
    const { filename = 'pages.zip', prefix = '', pageIds, ...rasterOpts } = opts
    // People expect lossless files inside a zip.
    const format = rasterOpts.format ?? 'png'
    const entries = resolveEntries(registry, pageIds)
    if (entries.length === 0) throw new Error('[gimp] exportZip: no pages to export.')

    await guardExport(entries.length, async (onDone) => {
      const files: ZipFile[] = []
      let fontCssText = rasterOpts.fontCssText

      for (const [index, entry] of entries.entries()) {
        const result = await captureOne(entry, { ...rasterOpts, format, fontCssText })
        fontCssText = result.fontCssText
        const name = pageFilename({ prefix, id: entry.id, index, total: entries.length, ext: result.ext })
        files.push({ name, base64: dataUrlToBase64(result.dataUrl) })
        onDone()
      }

      const { buildZip } = await import('../export/exportZip')
      const { download } = await import('../export/download')
      download(await buildZip(files), filename)
    })
  }

  return { pages, state, exportPage, exportPdf, exportZip, renderPage }
}
