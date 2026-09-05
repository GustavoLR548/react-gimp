// blob -> <a download> click. revokeObjectURL in finally so a repeated
// export doesn't leak object URLs. See .spec/06-pdf-zip.md.
export function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  } finally {
    URL.revokeObjectURL(url)
  }
}
