export type CarouselSlideProps = {
  heading: string
  body: string
  footer: string
  index: number
  total: number
}

// Content only, like Thumbnail — `index`/`total` are structural (the
// slide's position in the project), not schema fields a viewer edits.
export function CarouselSlide({ heading, body, footer, index, total }: CarouselSlideProps) {
  return (
    <div className="flex h-full w-full flex-col justify-between p-16 text-white">
      <span className="text-2xl font-semibold opacity-70">
        {index} / {total}
      </span>
      <div>
        <h2 className="text-5xl font-black">{heading}</h2>
        <p className="mt-4 text-3xl">{body}</p>
        <p className="mt-8 text-xl opacity-70">{footer}</p>
      </div>
    </div>
  )
}
