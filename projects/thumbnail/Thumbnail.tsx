import { Img } from '@react-gimp/sdk'

export type ThumbnailProps = {
  title: string
  author: string
  imageUrl: string
}

// Content only — the enclosing <Page> (id/preset/background) is applied by
// FrameSlot from the frame definition and the frame's `background` value.
export function Thumbnail({ title, author, imageUrl }: ThumbnailProps) {
  return (
    <div className="relative h-full w-full">
      <Img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-10">
        <h1 className="text-6xl font-black leading-tight text-white drop-shadow-lg">{title}</h1>
        <p className="mt-3 text-2xl font-medium text-white/80">{author}</p>
      </div>
    </div>
  )
}
