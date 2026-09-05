import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Gimp } from './gimpContext'
import { Page } from './Page'
import type { UseExportResult } from './useExport'
import { useExport } from './useExport'

vi.mock('modern-screenshot', () => ({
  createContext: vi.fn(async (el: HTMLElement, opts: Record<string, unknown>) => ({ el, opts })),
  destroyContext: vi.fn(),
  domToDataUrl: vi.fn(async (ctx: { el: HTMLElement }) => {
    if (ctx.el.dataset.gimpPage === 'b') throw new Error('capture failed')
    return 'data:image/png;base64,AAAA'
  }),
}))

afterEach(() => {
  document.body.replaceChildren()
  vi.clearAllMocks()
})

let hookResult: UseExportResult | undefined

function Harness() {
  hookResult = useExport()
  return (
    <>
      <Page id="a" width={100} height={100}>
        <img data-testid="img-a" src="a.png" alt="" loading="lazy" />
      </Page>
      <Page id="b" width={100} height={100}>
        <img data-testid="img-b" src="b.png" alt="" loading="lazy" />
      </Page>
    </>
  )
}

// Mirrors exportPptx.test.ts in react-prezi: the thing worth testing is the
// mutate/restore contract, not the rasterization itself. See CLAUDE.md §13.
describe('useExport mutate/restore contract', () => {
  it('restores loading attributes and .gm-exporting even when a capture throws mid-loop', async () => {
    render(
      <Gimp>
        <Harness />
      </Gimp>,
    )

    const imgA = document.querySelector<HTMLImageElement>('[data-testid="img-a"]')
    const imgB = document.querySelector<HTMLImageElement>('[data-testid="img-b"]')
    const pageA = document.querySelector<HTMLElement>('[data-gimp-page="a"]')
    const pageB = document.querySelector<HTMLElement>('[data-gimp-page="b"]')

    expect(imgA?.getAttribute('loading')).toBe('lazy')
    expect(imgB?.getAttribute('loading')).toBe('lazy')

    await act(async () => {
      await expect(hookResult?.exportZip()).rejects.toThrow('capture failed')
    })

    expect(imgA?.getAttribute('loading')).toBe('lazy')
    expect(imgB?.getAttribute('loading')).toBe('lazy')
    expect(pageA?.classList.contains('gm-exporting')).toBe(false)
    expect(pageB?.classList.contains('gm-exporting')).toBe(false)
    expect(hookResult?.state.isExporting).toBe(false)
  })
})
