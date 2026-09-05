import type { CSSProperties, ImgHTMLAttributes } from 'react'
import { useEffect, useRef, useState } from 'react'
import { isCrossOrigin } from '../core/cors'
import { warnOnce } from '../core/warnOnce'

export type ImgProps = {
  src: string
  alt: string
  crossOrigin?: 'anonymous' | 'use-credentials'
  className?: string
  style?: CSSProperties
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'crossOrigin' | 'className' | 'style'>

// The actual CORS fix: authors write <Img> instead of <img> and the export
// CORS problem doesn't happen. crossOrigin defaults to "anonymous" whenever
// src resolves cross-origin. Ported from react-prezi's <Image>. See
// .spec/04-asset-guard.md.
export function Img(props: ImgProps) {
  const { src, alt, crossOrigin, className, style, ...rest } = props
  const imgRef = useRef<HTMLImageElement>(null)
  const resolvedCrossOrigin = crossOrigin ?? (isCrossOrigin(src) ? 'anonymous' : undefined)
  const [failed, setFailed] = useState(false)

  // A new src deserves a fresh attempt — most commonly hit while editing
  // the URL field in the inspector.
  useEffect(() => {
    setFailed(false)
  }, [src])

  function reportFailure(): void {
    setFailed(true)
    const hint = resolvedCrossOrigin
      ? " The host doesn't send CORS headers for this image — vendor the file into public/ instead."
      : ''
    warnOnce(`img-load-failed-${src}`, `[gimp] <Img> failed to load "${src}".${hint}`)
  }

  useEffect(() => {
    const img = imgRef.current
    if (!img || typeof img.decode !== 'function') return
    let cancelled = false

    img.decode().catch(() => {
      if (!cancelled) reportFailure()
    })

    return () => {
      cancelled = true
    }
  }, [src, resolvedCrossOrigin])

  // Visible, not just logged: a CORS-blocked or 404'd image previously left
  // a silent blank hole with only a console warning. See CLAUDE.md §12 —
  // "handle gracefully" means loud, not a silent substitute.
  if (failed) {
    return (
      <div
        className={className ? `gm-img-error ${className}` : 'gm-img-error'}
        style={style}
        role="img"
        aria-label={alt}
      >
        Image failed to load{resolvedCrossOrigin ? ' (CORS blocked)' : ''}
      </div>
    )
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      crossOrigin={resolvedCrossOrigin}
      className={className}
      style={style}
      onError={reportFailure}
      {...rest}
    />
  )
}
