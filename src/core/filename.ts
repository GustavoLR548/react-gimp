export type ExportFormat = 'png' | 'jpg'

// Combining diacritical marks (U+0300-U+036F), stripped after NFKD
// normalization so "café" -> "cafe" instead of "caf".
const COMBINING_MARKS = /[̀-ͯ]/g

export function slugify(input: string): string {
  const slug = input
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug.length > 0 ? slug : 'page'
}

export function extFor(format: ExportFormat): string {
  return format === 'jpg' ? 'jpg' : 'png'
}

export function mimeFor(format: ExportFormat): string {
  return format === 'jpg' ? 'image/jpeg' : 'image/png'
}

export type PageFilenameOpts = {
  prefix?: string
  id: string
  index: number // 0-based
  total: number
  ext: string
}

// Zero-padded so lexical sort order matches page order without relying on
// zip-reader ordering guarantees. See .spec/06-pdf-zip.md.
export function pageFilename(opts: PageFilenameOpts): string {
  const { prefix = '', id, index, total, ext } = opts
  const width = String(Math.max(total - 1, 0)).length
  const num = String(index).padStart(width, '0')
  const stem = slugify(id)
  return `${prefix}${num}-${stem}.${ext}`
}
