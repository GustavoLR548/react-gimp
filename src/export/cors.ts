import { isCrossOrigin } from '../core/cors'
import { warnOnce } from '../core/warnOnce'

// For a raw <img> that slipped through <Img>'s own guard — warns loudly,
// before any capture starts, naming the exact page and URL. Deliberately no
// URL-rewriting proxy hook: an extension point with no second consumer. See
// .spec/04-asset-guard.md and CLAUDE.md §3.
export function preflightCors(root: HTMLElement, pageId: string): void {
  const images = root.querySelectorAll<HTMLImageElement>('img')

  for (const img of images) {
    if (!isCrossOrigin(img.src)) continue
    if (img.crossOrigin) continue

    warnOnce(
      `cors-preflight-${pageId}-${img.src}`,
      `[gimp] <Page id="${pageId}"> loads "${img.src}" cross-origin without crossOrigin="anonymous". It will export as an empty area. Use <Img>, or copy the file into public/.`,
    )
  }
}
