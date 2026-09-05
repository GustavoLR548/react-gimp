import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { Browser, BrowserContext, Page as PlaywrightPage } from 'playwright'
import { chromium } from 'playwright'
import { build, preview } from 'vite'
import { extFor, mimeFor, pageFilename } from '../src/core/filename'
import type { ExportFormat } from '../src/core/filename'
import { buildPdf } from '../src/export/exportPdf'
import { buildZip } from '../src/export/exportZip'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

type PageInfo = { id: string; name?: string; size: { w: number; h: number } }

type GimpBridge = {
  listPages(): PageInfo[]
  renderPage(id: string, opts?: { pixelRatio?: number }): Promise<Blob>
}

type Args = {
  project?: string
  pixelRatio: number
  format: ExportFormat
  outDir: string
  pdf: boolean
  zip: boolean
  exactParity: boolean
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    pixelRatio: 2,
    format: 'png',
    outDir: path.join(ROOT, 'export-headless-out'),
    pdf: false,
    zip: false,
    exactParity: false,
  }

  for (const arg of argv) {
    if (arg === '--pdf') args.pdf = true
    else if (arg === '--zip') args.zip = true
    else if (arg === '--exact-parity') args.exactParity = true
    else if (arg.startsWith('--project=')) args.project = arg.slice('--project='.length)
    else if (arg.startsWith('--pixel-ratio=')) args.pixelRatio = Number(arg.slice('--pixel-ratio='.length))
    else if (arg.startsWith('--format=')) args.format = arg.slice('--format='.length) === 'jpg' ? 'jpg' : 'png'
    else if (arg.startsWith('--out-dir=')) args.outDir = path.resolve(arg.slice('--out-dir='.length))
  }

  return args
}

function base64FromDataUrl(dataUrl: string): string {
  const [, base64] = dataUrl.split(',')
  if (base64 === undefined) {
    throw new Error('[gimp] export-headless: malformed data URL.')
  }
  return base64
}

// Scraped from the rendered index page's DOM rather than imported from
// src/projects/projects.tsx, so the Node side of this script never imports
// .tsx project components. See .spec/08-headless.md.
async function discoverProjectIds(page: PlaywrightPage, address: string): Promise<string[]> {
  await page.goto(address, { waitUntil: 'networkidle' })
  return page.$$eval('a[data-gimp-project]', (links) =>
    links.map((link) => link.getAttribute('data-gimp-project')).filter((id): id is string => id !== null),
  )
}

// One project's worth of capture + optional PDF/ZIP assembly, reused for
// both the explicit --project=<id> path and the discover-and-loop-all path.
async function exportProject(page: PlaywrightPage, address: string, projectId: string, args: Args): Promise<void> {
  const outDir = path.join(args.outDir, projectId)
  await fs.mkdir(outDir, { recursive: true })

  await page.goto(`${address}?project=${projectId}&export=1`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  const pages = await page.evaluate(() => (window as unknown as { __gimp?: GimpBridge }).__gimp?.listPages() ?? [])
  if (pages.length === 0) {
    throw new Error(`[gimp] export-headless: project "${projectId}" has no pages. Is window.__gimp exposed under ?export=1?`)
  }
  console.log(`[gimp] project "${projectId}": found ${pages.length} page(s): ${pages.map((p) => p.id).join(', ')}`)

  const captures: Array<{ id: string; size: { w: number; h: number }; buffer: Buffer }> = []

  for (const pageInfo of pages) {
    // Identity transform (App.tsx forces zoom=1 under ?export=1) is
    // mechanically required, not cosmetic: elementHandle.boundingBox() IS
    // affected by ancestor transforms, so under a fit-scaled stage it would
    // measure and clip at the wrong size. See .spec/07-headless.md.
    await page.setViewportSize({ width: pageInfo.size.w, height: pageInfo.size.h })

    const locator = page.locator(`[data-gimp-page="${pageInfo.id}"]`)
    const buffer = await locator.screenshot({
      type: args.format === 'jpg' ? 'jpeg' : 'png',
      omitBackground: args.format === 'png',
    })

    const filePath = path.join(outDir, `${pageInfo.id}.${extFor(args.format)}`)
    await fs.writeFile(filePath, buffer)
    console.log(`[gimp] wrote ${filePath}`)
    captures.push({ id: pageInfo.id, size: pageInfo.size, buffer })

    if (args.exactParity) {
      const dataUrl = await page.evaluate(
        async ({ id, pixelRatio }) => {
          const bridge = (window as unknown as { __gimp?: GimpBridge }).__gimp
          if (!bridge) throw new Error('window.__gimp not available')
          const blob = await bridge.renderPage(id, { pixelRatio })
          return await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.readAsDataURL(blob)
          })
        },
        { id: pageInfo.id, pixelRatio: args.pixelRatio },
      )
      const parityPath = path.join(outDir, `${pageInfo.id}.exact-parity.${extFor(args.format)}`)
      await fs.writeFile(parityPath, Buffer.from(base64FromDataUrl(dataUrl), 'base64'))
      console.log(`[gimp] wrote exact-parity comparison ${parityPath}`)
    }
  }

  // DOM-free assembly — reuses the exact same code the browser exporter
  // uses, instead of a second PDF/ZIP implementation for CI.
  if (args.pdf) {
    const pdfCaptures = captures.map((capture) => ({
      dataUrl: `data:${mimeFor(args.format)};base64,${capture.buffer.toString('base64')}`,
      size: capture.size,
      format: args.format,
    }))
    const blob = await buildPdf(pdfCaptures)
    await fs.writeFile(path.join(outDir, 'pages.pdf'), Buffer.from(await blob.arrayBuffer()))
    console.log(`[gimp] wrote ${path.join(outDir, 'pages.pdf')}`)
  }

  if (args.zip) {
    const files = captures.map((capture, index) => ({
      name: pageFilename({ id: capture.id, index, total: captures.length, ext: extFor(args.format) }),
      base64: capture.buffer.toString('base64'),
    }))
    const blob = await buildZip(files)
    await fs.writeFile(path.join(outDir, 'pages.zip'), Buffer.from(await blob.arrayBuffer()))
    console.log(`[gimp] wrote ${path.join(outDir, 'pages.zip')}`)
  }
}

async function setUpPage(browser: Browser, pixelRatio: number): Promise<{ context: BrowserContext; page: PlaywrightPage }> {
  // deviceScaleFactor is set at context creation, not per-page, unlike
  // Puppeteer.
  const context = await browser.newContext({ deviceScaleFactor: pixelRatio })
  const page = await context.newPage()
  // Freezes ambient CSS animation deterministically — the headless-path
  // equivalent of the browser path's .gm-exporting class.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  return { context, page }
}

// Real browser, real screenshot API — headless output is MORE faithful than
// the in-browser export (no <foreignObject> limitations), and therefore
// not expected to be byte-identical to it. See .spec/07-headless.md.
async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))

  console.log('[gimp] building...')
  await build({ root: ROOT, logLevel: 'warn' })

  const previewServer = await preview({ root: ROOT, preview: { port: 0 } })
  const address = previewServer.resolvedUrls?.local[0]
  if (!address) {
    throw new Error('[gimp] export-headless: vite preview server did not report a URL.')
  }

  // Determinism flags: consistent text rendering and color across machines
  // running the same export.
  const browser = await chromium.launch({
    args: ['--font-render-hinting=none', '--force-color-profile=srgb'],
  })

  try {
    await fs.mkdir(args.outDir, { recursive: true })
    const { context, page } = await setUpPage(browser, args.pixelRatio)

    const projectIds = args.project ? [args.project] : await discoverProjectIds(page, address)
    if (projectIds.length === 0) {
      throw new Error('[gimp] export-headless: no projects found. Is a[data-gimp-project] rendered on the index page?')
    }

    for (const projectId of projectIds) {
      await exportProject(page, address, projectId, args)
    }

    await context.close()
  } finally {
    await browser.close()
    await previewServer.close()
  }
}

main().catch((err: unknown) => {
  console.error(err)
  process.exitCode = 1
})
