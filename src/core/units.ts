export const PX_PER_IN = 96
export const PT_PER_IN = 72

export function pxToPt(px: number): number {
  return (px / PX_PER_IN) * PT_PER_IN
}

export type PdfPageSpec = {
  wPt: number
  hPt: number
  orientation: 'portrait' | 'landscape'
}

// Square pages tie-break to portrait — jsPDF requires a definite orientation
// even at aspect 1, and portrait is the more common document default.
export function pdfPageSpec(size: { w: number; h: number }): PdfPageSpec {
  const wPt = pxToPt(size.w)
  const hPt = pxToPt(size.h)
  const orientation = wPt > hPt ? 'landscape' : 'portrait'
  return { wPt, hPt, orientation }
}
