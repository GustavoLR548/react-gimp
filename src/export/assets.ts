import { DEFAULT_TIMEOUT_MS } from '../core/raster'
import { warnOnce } from '../core/warnOnce'

const URL_RE = /url\((['"]?)([^'"]+?)\1\)/g

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, onTimeout: () => void): Promise<T | void> {
  return Promise.race([
    promise,
    new Promise<void>((resolve) => {
      setTimeout(() => {
        onTimeout()
        resolve()
      }, timeoutMs)
    }),
  ])
}

// Two nested rAFs — layout and style from the render that just committed
// must land before anything reads them. Ported from react-prezi's
// waitForSettle. See .spec/04-asset-guard.md.
function twoFrames(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

// loading="lazy" images that are currently offscreen never load at all.
// Force them eager before capture and hand back a restore closure — the
// single most likely "one page in my carousel exported blank" bug.
export function forceEagerImages(root: HTMLElement): () => void {
  const lazyImages = root.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
  const restores: Array<() => void> = []

  for (const img of lazyImages) {
    // Both the IDL property (what actually controls browser lazy-loading
    // behavior) and the content attribute (what querySelectorAll('img
    // [loading="lazy"]') and other tooling reads) — some DOM
    // implementations don't reflect one to the other.
    img.loading = 'eager'
    img.setAttribute('loading', 'eager')
    restores.push(() => {
      img.loading = 'lazy'
      img.setAttribute('loading', 'lazy')
    })
  }

  return () => {
    for (const restore of restores.reverse()) restore()
  }
}

async function waitForImage(img: HTMLImageElement, timeoutMs: number): Promise<void> {
  async function decodeIfPossible(): Promise<void> {
    if (typeof img.decode !== 'function') return
    try {
      await img.decode()
    } catch {
      warnOnce(`asset-decode-${img.src}`, `[gimp] failed to decode image "${img.src}". Continuing anyway.`)
    }
  }

  await withTimeout(decodeIfPossible(), timeoutMs, () => {
    warnOnce(`asset-timeout-${img.src}`, `[gimp] image "${img.src}" took longer than ${timeoutMs}ms to decode. Continuing without it.`)
  })

  // img.complete is true for failed loads too — it is not a success test.
  // decode() above already surfaces most failures, but a src that never
  // started loading (e.g. a 404 with no network error event yet) can reach
  // here complete-but-empty; this is the real test for that. See
  // .spec/04-asset-guard.md.
  if (!(img.complete && img.naturalWidth > 0)) {
    warnOnce(`asset-failed-${img.src}`, `[gimp] image "${img.src}" did not load (complete: ${img.complete}, naturalWidth: ${img.naturalWidth}). It will be missing or blank in the export.`)
  }
}

function extractUrls(cssValue: string): string[] {
  const urls: string[] = []
  for (const match of cssValue.matchAll(URL_RE)) {
    const url = match[2]
    if (url) urls.push(url)
  }
  return urls
}

async function preloadUrl(url: string, timeoutMs: number): Promise<void> {
  await withTimeout(
    new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => img.decode().then(() => resolve(), reject)
      img.onerror = () => reject(new Error(`failed to load ${url}`))
      img.src = url
    }),
    timeoutMs,
    () => {
      warnOnce(`asset-bg-timeout-${url}`, `[gimp] background asset "${url}" took longer than ${timeoutMs}ms to load. Continuing without it.`)
    },
  ).catch(() => {
    warnOnce(`asset-bg-failed-${url}`, `[gimp] background asset "${url}" failed to load. It will be missing from the export.`)
  })
}

// Walks root + every descendant, including ::before/::after pseudo-elements
// (the rasterizer clones pseudo-elements too, so their backgrounds count and
// are otherwise invisible to querySelectorAll). See .spec/04-asset-guard.md.
async function preloadBackgroundImages(root: HTMLElement, timeoutMs: number): Promise<void> {
  const urls = new Set<string>()
  const elements = [root, ...root.querySelectorAll<HTMLElement>('*')]
  const pseudos: Array<'::before' | '::after'> = ['::before', '::after']

  for (const el of elements) {
    for (const url of extractUrls(getComputedStyle(el).backgroundImage)) urls.add(url)
    for (const url of extractUrls(getComputedStyle(el).maskImage)) urls.add(url)
    for (const pseudo of pseudos) {
      const style = getComputedStyle(el, pseudo)
      for (const url of extractUrls(style.backgroundImage)) urls.add(url)
      for (const url of extractUrls(style.maskImage)) urls.add(url)
    }
  }

  await Promise.all([...urls].map((url) => preloadUrl(url, timeoutMs)))
}

export type WaitForAssetsOpts = {
  timeoutMs?: number
}

// Sequence, in order — each step depends on the one before it having
// actually landed. Pages are never virtualized or unmounted when offscreen:
// document.fonts.ready only resolves for fonts already requested, and a
// font first needed by a not-yet-mounted page would slip past this guard
// entirely. See .spec/04-asset-guard.md.
export async function waitForAssets(root: HTMLElement, opts: WaitForAssetsOpts = {}): Promise<void> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS } = opts

  await twoFrames()

  if (document.fonts) {
    await withTimeout(document.fonts.ready, timeoutMs, () => {
      warnOnce('asset-fonts-timeout', `[gimp] document.fonts.ready took longer than ${timeoutMs}ms. Continuing without it.`)
    })
  }

  const images = root.querySelectorAll<HTMLImageElement>('img')
  await Promise.all([...images].map((img) => waitForImage(img, timeoutMs)))

  await preloadBackgroundImages(root, timeoutMs)

  await twoFrames()
}
