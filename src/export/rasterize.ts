import { extFor, mimeFor } from '../core/filename'
import type { ExportFormat } from '../core/filename'
import { DEFAULT_TIMEOUT_MS, safePixelRatio } from '../core/raster'

export type RasterOpts = {
  pixelRatio?: number
  format?: ExportFormat
  quality?: number
  background?: string
  fetchRequestInit?: RequestInit
  imagePlaceholder?: string
  fontCssText?: string
}

export type CaptureResult = {
  dataUrl: string
  format: ExportFormat
  ext: string
  fontCssText: string
}

export type CaptureEntry = {
  id: string
  el: HTMLElement
  size: { w: number; h: number }
}

const NOOP = () => {}

// Reads the live computed style right before capture and throws — this is
// an unrecoverable wrong result, not a degraded one. The rasterizer renders
// through an SVG <foreignObject>: a transformed or position:fixed capture
// root displaces its content toward a corner instead of centering it.
// Returns a no-op so it fits the mutate-then-restore-closure array
// uniformly alongside forceEagerImages/pauseAmbient. See .spec/01-artboard.md.
export function assertCapturable(el: HTMLElement): () => void {
  const style = getComputedStyle(el)
  const pageId = el.dataset.gimpPage ?? '?'

  // A real browser always resolves an unset transform to the literal string
  // "none". Some DOM implementations (jsdom, notably, used in this
  // project's own tests) report "" instead for anything not explicitly
  // computed — treating both as "no transform" doesn't weaken the real
  // check, since an actual transform always resolves to a non-empty matrix
  // or function string.
  if (style.transform !== 'none' && style.transform !== '') {
    throw new Error(
      `[gimp] <Page id="${pageId}"> has transform "${style.transform}" on its own element. The rasterizer renders through an SVG <foreignObject> and a transformed capture root displaces its content toward a corner. Move the transform to a child <div> inside the page.`,
    )
  }
  if (style.position === 'fixed') {
    throw new Error(
      `[gimp] <Page id="${pageId}"> has position "fixed" on its own element. The rasterizer renders through an SVG <foreignObject> and a fixed-position capture root displaces its content toward a corner. Move position: fixed to a child <div> inside the page.`,
    )
  }
  return NOOP
}

// Deck content may run looping CSS animations. Each capture would otherwise
// catch the loop at an arbitrary phase, so two exports of the same design
// differ. Mutate, hand back a restore closure, call it in the same finally
// — ported from react-prezi's pauseAmbient. See .spec/05-rasterize.md.
export function pauseAmbient(el: HTMLElement): () => void {
  el.classList.add('gm-exporting')
  return () => el.classList.remove('gm-exporting')
}

type FetchOverride = { requestInit?: RequestInit; placeholderImage?: string }

function buildFetchOverride(fetchRequestInit?: RequestInit, imagePlaceholder?: string): FetchOverride | undefined {
  if (fetchRequestInit === undefined && imagePlaceholder === undefined) return undefined
  const override: FetchOverride = {}
  if (fetchRequestInit !== undefined) override.requestInit = fetchRequestInit
  if (imagePlaceholder !== undefined) override.placeholderImage = imagePlaceholder
  return override
}

// Verified against modern-screenshot's own source (not assumed — see
// .spec/05-rasterize.md): unlike html-to-image, its default self-measurement
// uses getBoundingClientRect(), which DOES reflect an ancestor's
// transform:scale(). Leaving width/height unset under a zoomed preview
// stage silently produces a wrong-sized export. width/height are therefore
// ALWAYS passed explicitly here, from the page's own declared size — never
// left to the rasterizer's measurement. This deviates from this project's
// original handoff doc, which assumed html-to-image's transform-immune
// clientWidth measurement carried over unchanged; it does not.
export async function capturePage(entry: CaptureEntry, opts: RasterOpts = {}): Promise<CaptureResult> {
  const {
    pixelRatio = 2,
    format = 'png',
    quality = 0.92,
    background,
    fetchRequestInit,
    imagePlaceholder,
    fontCssText,
  } = opts

  const { createContext, destroyContext, domToDataUrl } = await import('modern-screenshot')

  const scale = safePixelRatio(entry.size, pixelRatio)
  const backgroundColor = format === 'jpg' ? (background ?? '#ffffff') : (background ?? null)
  const fetchOverride = buildFetchOverride(fetchRequestInit, imagePlaceholder)
  const needsFontCapture = fontCssText === undefined

  const context = await createContext(entry.el, {
    scale,
    width: entry.size.w,
    height: entry.size.h,
    type: mimeFor(format),
    backgroundColor,
    timeout: DEFAULT_TIMEOUT_MS,
    autoDestruct: false,
    ...(format === 'jpg' ? { quality } : {}),
    ...(fontCssText !== undefined ? { font: { cssText: fontCssText } } : {}),
    ...(fetchOverride ? { fetch: fetchOverride } : {}),
  })

  const dataUrl = await domToDataUrl(context)

  if (!dataUrl || dataUrl === 'data:,') {
    destroyContext(context)
    throw new Error(
      `[gimp] <rasterizer> produced no image data for page "${entry.id}". Check that the page has non-zero size and captured without throwing.`,
    )
  }

  // Font embedding is computed once (here, on whichever page captures
  // first) and reused across the rest of a multi-page export by passing
  // this back as `fontCssText` — the most expensive step per capture. This
  // assumes all pages in one export share the same font set; a page-only
  // font introduced later in the batch will still render (the clone still
  // has the real @font-face rule available via the page stylesheet) but
  // its embed may not be captured in the reused cssText. See
  // .spec/05-rasterize.md.
  const resolvedFontCssText = needsFontCapture ? (context.svgStyleElement?.textContent ?? '') : fontCssText

  destroyContext(context)

  return { dataUrl, format, ext: extFor(format), fontCssText: resolvedFontCssText }
}
