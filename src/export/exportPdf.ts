import type { ExportFormat } from '../core/filename'
import { pdfPageSpec } from '../core/units'

export type PdfCapture = {
  dataUrl: string
  size: { w: number; h: number }
  format: ExportFormat
}

// DOM-free — takes plain data in, Blob out. Lets scripts/export-headless.ts
// reuse this exact assembly code from Node instead of maintaining a second
// PDF implementation for CI. See .spec/06-pdf-zip.md.
export async function buildPdf(captures: PdfCapture[]): Promise<Blob> {
  const first = captures[0]
  if (!first) throw new Error('[gimp] buildPdf: no pages to export.')

  const { jsPDF } = await import('jspdf')
  const firstSpec = pdfPageSpec(first.size)
  const pdf = new jsPDF({
    unit: 'pt',
    format: [firstSpec.wPt, firstSpec.hPt],
    orientation: firstSpec.orientation,
  })

  captures.forEach((capture, index) => {
    const spec = pdfPageSpec(capture.size)
    // Pages may legitimately differ in size, so each page's own format is
    // passed to addPage, not just the first.
    if (index > 0) pdf.addPage([spec.wPt, spec.hPt], spec.orientation)

    // The image format string passed to addImage must match what was
    // actually captured, or jsPDF silently re-encodes.
    const imageFormat = capture.format === 'jpg' ? 'JPEG' : 'PNG'
    pdf.addImage(capture.dataUrl, imageFormat, 0, 0, spec.wPt, spec.hPt)
  })

  return pdf.output('blob')
}
