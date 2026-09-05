export type PresetName = 'youtube' | 'og' | 'square' | 'fullhd'

export type PageSize = { w: number; h: number }

export const PRESETS: Record<PresetName, PageSize> = {
  youtube: { w: 1280, h: 720 },
  og: { w: 1200, h: 630 },
  square: { w: 1080, h: 1080 },
  fullhd: { w: 1920, h: 1080 },
}

export type ResolvePageSizeOpts = {
  preset?: PresetName
  width?: number
  height?: number
}

// Exactly one of `preset` or `width`+`height`, mirroring react-prezi's
// <Image> h/aspect guard. See .spec/01-artboard.md.
export function resolvePageSize(opts: ResolvePageSizeOpts): PageSize {
  const { preset, width, height } = opts
  const hasPreset = preset !== undefined
  const hasDims = width !== undefined && height !== undefined

  if (!hasPreset && !hasDims) {
    throw new Error(
      '[gimp] <Page> needs exactly one of `preset` or `width`+`height`. Neither was given.',
    )
  }
  if (hasPreset && hasDims) {
    throw new Error(
      '[gimp] <Page> needs exactly one of `preset` or `width`+`height`. Both were given.',
    )
  }
  if (hasPreset) return PRESETS[preset]
  return { w: width as number, h: height as number }
}

export function aspectOf(size: PageSize): number {
  return size.w / size.h
}
