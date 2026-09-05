import type { CSSProperties, ReactNode } from 'react'
import { useLayoutEffect, useMemo, useRef } from 'react'
import type { PresetName } from '../core/presets'
import { resolvePageSize } from '../core/presets'
import { usePageRegistry } from './gimpContext'

export type PageProps = {
  id: string
  preset?: PresetName
  width?: number
  height?: number
  background?: string
  name?: string
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

// The artboard. Plain, untransformed, exactly-w×h — the invariant the whole
// rasterization pipeline depends on. See .spec/01-artboard.md.
export function Page(props: PageProps) {
  const { id, preset, width, height, background, name, className, style, children } = props
  const registry = usePageRegistry()
  const elRef = useRef<HTMLDivElement>(null)

  const size = useMemo(() => resolvePageSize({ preset, width, height }), [preset, width, height])

  useLayoutEffect(() => {
    const el = elRef.current
    if (!el) return
    return registry.register({ id, el, size, name })
  }, [registry, id, size, name])

  return (
    <div
      ref={elRef}
      data-gimp-page={id}
      className={className ? `gm-page ${className}` : 'gm-page'}
      style={{
        width: size.w,
        height: size.h,
        background,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
