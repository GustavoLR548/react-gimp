export type ZipFile = {
  name: string
  base64: string
}

// DOM-free — takes plain data in, Blob out. PNG/JPEG are already compressed,
// so STORE (not DEFLATE) costs no size and saves real time. See
// .spec/06-pdf-zip.md.
export async function buildZip(files: ZipFile[]): Promise<Blob> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()

  for (const file of files) {
    zip.file(file.name, file.base64, { base64: true })
  }

  return zip.generateAsync({ type: 'blob', compression: 'STORE' })
}
