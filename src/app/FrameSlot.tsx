import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useRef } from 'react'
import { Page } from '../react/Page'
import type { AnyFrameDef, FrameValues } from '../projects/defineProject'

const CLICK_DRAG_THRESHOLD_PX = 4

export type FrameSlotProps = {
  frame: AnyFrameDef
  values: FrameValues
  selected: boolean
  onSelect?: () => void
}

// The selection outline lives here, never on .gm-page — capturePage
// captures entry.el (the .gm-page element itself), so anything on this
// ancestor wrapper is structurally outside the capture root. No export-time
// cleanup needed. See .spec/09-inspector.md.
export function FrameSlot({ frame, values, selected, onSelect }: FrameSlotProps) {
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null)
  const background = typeof values.background === 'string' ? values.background : undefined

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>): void {
    pointerDownRef.current = { x: e.clientX, y: e.clientY }
  }

  // <Canvas> starts a pan drag on pointerdown under numeric zoom; selection
  // must fire only on a click that didn't drag. stopPropagation keeps this
  // click from reaching the canvas-background click handler that clears
  // selection, whether or not it actually selects.
  function handleClick(e: ReactMouseEvent<HTMLDivElement>): void {
    e.stopPropagation()
    const start = pointerDownRef.current
    pointerDownRef.current = null
    if (!onSelect || !start) return
    const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y)
    if (moved < CLICK_DRAG_THRESHOLD_PX) onSelect()
  }

  return (
    <div
      className={selected ? 'flex-none outline outline-2 outline-offset-2 outline-blue-500' : 'flex-none'}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <Page
        id={frame.id}
        preset={frame.preset}
        width={frame.width}
        height={frame.height}
        name={frame.name}
        background={background}
      >
        {frame.render(values)}
      </Page>
    </div>
  )
}
