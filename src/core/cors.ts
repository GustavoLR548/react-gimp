// Ported from react-prezi's Image.tsx. data:/blob: count as same-origin for
// this purpose — they never trigger a cross-origin canvas taint.
export function isCrossOrigin(src: string): boolean {
  try {
    const url = new URL(src, window.location.href)
    if (url.protocol === 'data:' || url.protocol === 'blob:') return false
    return url.origin !== window.location.origin
  } catch {
    return false
  }
}
