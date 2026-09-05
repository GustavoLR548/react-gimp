# react-gimp project-authoring API reference

The full surface a project author touches. `SKILL.md` covers workflow and
taste; this file is the lookup table for exact types, defaults, and where
each piece lives.

Source of truth is always the code under `src/projects/defineProject.ts`,
`src/app/*.tsx`, and `src/react/*.tsx` — if this file and the code disagree,
trust the code and fix this file (or run the `react-gimp-skill-sync` skill).

## `defineFrame` / `FrameDef`

`src/projects/defineProject.ts`

```ts
export type FrameDef<S extends ZodObject = ZodObject> = {
  id: string                              // unique within the project
  name: string                            // shown in the inspector header + export dropdown
  preset?: PresetName                     // structural — see core/presets.ts. Not schema/editable.
  width?: number                          // structural, alternative to `preset` — see below.
  height?: number                         // structural, alternative to `preset` — see below.
  schema: S                               // a z.object(...) — every field should carry a `ui` hint
  defaults: z.infer<S>                    // shown before any edit; also "Reset to defaults"
  render: (values: z.infer<S>) => ReactNode  // content only — no <Page> here
}

function defineFrame<S extends ZodObject>(def: FrameDef<S>): AnyFrameDef
```

`defineFrame` type-erases to `AnyFrameDef` (schema: `ZodObject`, defaults/
values: `Record<string, unknown>`) so frames with different schemas can
share one `ProjectDef.frames` array. Its `render` re-parses at the boundary
(`schema.parse(values)`) — if you see a thrown parse error instead of a
silently wrong render, that's this doing its job, not a bug to route
around.

## `defineProject` / `ProjectDef`

```ts
export type ProjectDef = {
  id: string                    // becomes the URL: ?project=<id>
  name: string                  // shown on the index and the project view's top bar
  description?: string          // shown on the index card
  layout?: 'row' | 'column'     // canvas preview arrangement only, default 'column'
  frames: AnyFrameDef[]
}

function defineProject(def: ProjectDef): ProjectDef  // throws on a duplicate frame id
```

Add the result to the `projects` array exported from
`src/projects/projects.tsx`. Order in that array is the order projects
appear on the index.

## The `ui` registry and `Control`

```ts
export type Control =
  | { kind: 'text' }
  | { kind: 'textarea'; rows?: number }
  | { kind: 'color' }
  | { kind: 'url' }
  | { kind: 'file'; accept?: string; maxSizeBytes?: number }
  | { kind: 'number'; min?: number; max?: number; step?: number }
  | { kind: 'checkbox' }
  | { kind: 'select'; options: string[] }

export type ControlMeta = { label?: string; control?: Control; order?: number; help?: string }
export const ui = z.registry<ControlMeta>()
export const DEFAULT_MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024  // 2MB
```

Register a hint at the point of declaration — a typo'd key fails `tsc`:

```ts
title: z.string().min(1).register(ui, { label: 'Title', order: 0 })
```

| `control.kind` | Renders as | Value type | Notes |
|---|---|---|---|
| `text` (default) | `<input type="text">` | `string` | Also the fallback when no hint and no inference match. |
| `textarea` | `<textarea rows={rows ?? 4}>` | `string` | Use for anything longer than one line (a body/caption). |
| `color` | `<input type="color">` | `string` (hex) | Standard field name across every frame in this repo: `background`. |
| `url` | `<input type="url">` | `string` | For a link that must stay a live, hosted URL. |
| `file` | `<input type="file">` + live thumbnail preview | `string` (a `data:` URL after a pick) | **Preferred for images** — see `SKILL.md` step 4. Oversized files are rejected inline, not silently accepted. `accept` defaults to `'image/*'`. |
| `number` | `<input type="number">` | `number` | `min`/`max`/`step` forwarded directly. |
| `checkbox` | `<input type="checkbox">` | `boolean` | |
| `select` | `<select>` | `string` | `options: string[]` — same string used as both value and label. |

**Inference fallback** (only when a field has no explicit `control` hint —
prefer the explicit hint for anything other than plain text or a number):
`z.string()` → `text` (or `url` if the string carries a `.url()`/URL-format
check specifically), `z.number()` → `number`, `z.boolean()` → `checkbox`,
`z.enum([...])` → `select` with those members as `options`.
`optional`/`nullable`/`default`/`prefault` wrappers are unwrapped first, so
`z.string().optional()` still infers as `text`. Implemented in
`src/app/fieldControl.ts`'s `fieldsFor`/`inferControl` — colocated test
`fieldControl.test.ts` if you want worked examples of every case.

Fields render sorted by `meta.order` ascending (ties keep declaration
order) — always set it explicitly per step 3 of `SKILL.md`.

## The `background` field convention

Every frame schema should include:

```ts
background: z.string().register(ui, { label: 'Background', control: { kind: 'color' }, order: N })
```

`FrameSlot` (`src/app/FrameSlot.tsx`) reads `values.background` (when it's
a string) and passes it straight to the enclosing `<Page background=...>` —
this is the one field-name coupling between a frame's schema and the app
layer, and it's why a frame's content component never needs to set its own
background.

## `core/presets.ts` — `PresetName`

```ts
export type PresetName = 'youtube' | 'og' | 'square' | 'fullhd'

export const PRESETS: Record<PresetName, { w: number; h: number }> = {
  youtube: { w: 1280, h: 720 },
  og: { w: 1200, h: 630 },
  square: { w: 1080, h: 1080 },
  fullhd: { w: 1920, h: 1080 },
}
```

Pass `width`/`height` directly on `defineFrame` instead of `preset` for any
size not in this list (e.g. a LinkedIn banner at `1584×396`) — `resolvePageSize`
throws if you give neither or both.

## Content components — the content-only contract

A frame's `render` returns content, never a `<Page>`. Compare:

```tsx
// src/projects/thumbnail/Thumbnail.tsx — content only
export function Thumbnail({ title, author, imageUrl }: ThumbnailProps) {
  return (
    <div className="relative h-full w-full">
      <Img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
      {/* ... */}
    </div>
  )
}
```

`<Img>` (`src/react/Img.tsx`) is the framework's drop-in `<img>` replacement
— use it for every image in a frame's content, never a raw `<img>`. It sets
`crossOrigin="anonymous"` automatically for cross-origin URLs (needed for
export to read pixel data) and now shows a visible in-place error message
if the load fails (most commonly: a host that doesn't send CORS headers) —
another reason a `file`-control image, which never goes cross-origin, is
usually the better default.

`src/projects/carousel/CarouselSlide.tsx` shows the other common pattern:
structural data (`index`, `total` — the slide's position) passed as plain
props from the `render` closure, never schema fields, alongside the
schema-driven content (`heading`, `body`, `footer`).

## Routing and export scoping

No client-side router — `src/app/AppRoot.tsx` reads
`URLSearchParams` once:

- No `?project` → `ProjectIndex` (the landing page, listing every entry in
  the `projects` array with a size schematic).
- `?project=<id>` → `ProjectView` for that project. Unknown id falls back
  to the index.
- `&export=1` → hides all chrome (top bar, inspector, export bar) and
  forces `zoom={1}`/`pan={0,0}` — used by the headless export script, not
  meant to be linked to by hand.

Only the active project's frames ever mount, so `useExport`'s
`exportPdf()`/`exportZip()` are automatically scoped to just that project
with no extra wiring.

## Headless export

`scripts/export-headless.ts --project=<id>` exports one project; the
no-flag form discovers every project by scraping `a[data-gimp-project]` off
the rendered index page and loops all of them, one output directory per
project id. Nothing a project author needs to touch — this works
automatically for any project added via `defineProject`.

## Persistence — what a project author doesn't need to build

`src/app/useProjectValues.ts` + `src/app/projectStorage.ts` persist each
frame's edited values to `localStorage` under `gimp:project:<projectId>`,
re-validating through `frame.schema.safeParse` on load (a stale/corrupt
entry falls back to that frame's `defaults`, never crashes). This is fully
generic over any schema — a new project or frame gets persistence for free,
nothing to wire up. The inspector's "Reset to defaults" button calls this
same path with `frame.defaults`.

## Inspector validation — what "editing a field" actually does

`src/app/Inspector.tsx` holds a draft per selected frame. Every keystroke:
merges into the draft, runs `frame.schema.safeParse(draft)`, and only on
success commits to the value store (so the canvas re-renders). On failure,
`z.treeifyError` messages show per-field under the input and the canvas
keeps showing the last valid render — a schema with a strict validator
(`z.string().min(1)`, `z.url()`) is a deliberate choice to reject bad
values live, not just a type annotation. Keep that in mind when picking
validators: `z.string().min(1)` on a title field means an empty title
shows an inline error and freezes the canvas at whatever the title was
before, which is usually what you want.
