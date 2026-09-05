---
name: react-gimp-design
description: >
  Design a new project (or add/edit a frame in an existing one) in this
  react-gimp repository: a src/projects/<slug> content component, a zod
  schema with `ui` field hints wired through defineFrame, registered in
  src/projects/projects.tsx, editable live in the inspector, and
  typechecked clean. Use this skill whenever the user asks to create,
  build, make, draft, or add a thumbnail, OpenGraph card, carousel, banner,
  poster, social graphic, or any other fixed-size visual artboard in this
  project — even if they don't say "react-gimp", "project", or "frame" by
  name, e.g. "make a LinkedIn banner", "I need a template for our podcast
  cover art", "add a slide to the carousel", "give this thumbnail an
  editable subtitle field". Also use it for guidance on choosing a control
  kind for a field, structuring a multi-frame project, or the
  content/background vs. structural-geometry split, even without a full
  build request.
---

# Designing with react-gimp

A react-gimp **project** is a named group of **frames**. A frame is one
fixed-size artboard: a `preset` (or `width`/`height`), a zod `schema`
describing its editable content, `defaults`, and a `render` function that
turns validated values into JSX. The **inspector** — a sidebar generated
straight from that schema — is what makes a frame's content live-editable
without hand-building a form. Internalize that before writing anything: you
are not writing a static page, you are declaring *what varies* and *how it's
edited*, and the framework builds the editing UI for you from the schema.

This file is the workflow and the taste judgment. Exact types, the `Control`
union, and every framework component's props live in
[references/component-api.md](references/component-api.md) — open it when
you need a signature, don't try to hold it all in your head.

`CLAUDE.md` at the repo root governs *engineering the framework itself*
(`src/core/`, `src/react/`, `src/export/` — untouched by design work). It is
not project-authoring guidance — this skill is. But its formatting rules (no
semicolons, single quotes in `.ts`, double quotes in JSX attributes, 2-space
indent, guard clauses, no `else`) still apply to any file you write, because
it's still this repo's TypeScript. `.spec/08-projects.md` and
`.spec/09-inspector.md` are the underlying design spec, if you want the full
reasoning behind any rule below.

## Workflow

### 1. Nail the brief

Before touching code, know: what the artboard is *for* (a thumbnail, a
carousel slide, a banner — this usually implies its aspect ratio), whether
it's one frame or several, and what actually needs to change between
instances of it. "A YouTube thumbnail" is a brief; "a YouTube thumbnail with
a title, an author line, and a background photo, where I'll swap the title
and photo per video" is a spec you can start from. If the user's ask is
thin, infer reasonable defaults (a title + one image + a background color is
the common case) rather than stalling on questions — you can always add a
field later.

### 2. Decide the schema before writing any JSX

This is the step that matters most and the one it's easiest to skip. For
each frame, write out the field list first, as a short table if it helps:
field name, zod type, control kind, whether it's shared across frames or
unique per frame. Two questions drive it:

- **What varies per frame vs. what's fixed in the render function?** Only
  things a viewer should be able to edit belong in the schema. A slide
  number derived from the frame's position in the project (`index`/`total`)
  is fixed — bake it into the `render` closure, don't make it a field. Look
  at `src/projects/carousel/CarouselSlide.tsx` for exactly this split.
- **Does every frame in a multi-frame project share one schema, or does
  each need its own?** Three carousel slides that are all "heading, body,
  footer, background" share one `z.object` schema, reused across three
  `defineFrame` calls — see `slideSchema` in `src/projects/projects.tsx`.
  Reach for a per-frame schema only when frames genuinely hold different
  kinds of content, not just different values.

Every frame schema should include a `background: z.string()` field with
`control: { kind: 'color' }` — it's the one field name with special meaning:
`FrameSlot` reads `values.background` and applies it to the frame's `<Page>`
automatically (see `.spec/08-projects.md`). A frame with no editable
background is unusual; make sure that's deliberate, not an oversight.

Page geometry — `preset` (or `width`/`height`) — is **not** a schema field.
It's structural, set once on the `defineFrame` call, and stays out of the
inspector entirely: resizing a layout tuned for one aspect ratio mid-session
would break it. If the user wants a resizable frame, that's a different
tool; say so rather than half-implementing it.

### 3. Pick a control per field, and register the hint

Every schema field gets `.register(ui, { label, control, order, help? })`.
Registering the hint explicitly is the primary path — the inspector *can*
infer a control from the zod type alone (`string`→text, `number`→number,
`boolean`→checkbox, `enum`→select), but an explicit hint is what lets you
reach for `textarea`, `color`, `url`, or `file`, none of which are
inferable, and it's what gives the field its human-readable `label`. See
[references/component-api.md](references/component-api.md) for the full
`Control` union and when to reach for each kind — the short version: free
text → `text`, anything longer than a line → `textarea`, a background or
accent color → `color`, a link that must stay a real URL → `url`, and a
photo the user should be able to pick from their own computer (**preferred
over `url` for any image field** — it sidesteps CORS entirely, see below) →
`file`.

`order` controls the inspector's field sequence — set it explicitly for
every field (`0, 1, 2, ...`) rather than leaving it to fall back to `0` for
everything, or the sidebar renders in an arbitrary (declaration) order that
may not match how you want someone editing it top to bottom.

### 4. Images: reach for `file`, not `url`, unless the user needs a live remote link

A cross-origin image URL that doesn't send CORS headers fails to load in
this framework's `<Img>` (it sets `crossOrigin="anonymous"`, which the
browser then refuses if the host doesn't answer with
`Access-Control-Allow-Origin`) — this has bitten real usage of this repo
already. `control: { kind: 'file' }` sidesteps the entire problem: the
chosen file is read into a `data:` URL, which this codebase already treats
as same-origin (`core/cors.ts`), works offline, and needs no host
cooperation. Default to it for any image field unless the user specifically
wants to reference a live, already-hosted image by URL. The tradeoff is
`localStorage` size — files over `DEFAULT_MAX_FILE_SIZE_BYTES` (2MB) are
rejected at pick-time with an inline message, not silently truncated;
loosen it per-field (`maxSizeBytes`) only if the user asks for larger
uploads and understands the storage cost.

### 5. Scaffold the frame(s)

A one-off frame's content component can live inline in
`src/projects/projects.tsx` next to its schema, but a frame with any real
markup gets its own file — follow the existing shape:
`src/projects/<slug>/<Name>.tsx`, a plain function component that takes
**content props only** (never `id`/`preset`/`background` — `FrameSlot`
applies the enclosing `<Page>` for you). Look at
`src/projects/thumbnail/Thumbnail.tsx` (single frame, reused across two
presets) and `src/projects/carousel/CarouselSlide.tsx` (multi-frame, shared
schema, structural `index`/`total` baked in) as real, worked examples —
they show real prop shapes, not just the reference doc's isolated
signatures. Tailwind is fully available inside a frame's content — this is
the one place in the codebase it's used freely (`CLAUDE.md` §10).

```tsx
// src/projects/projects.tsx (or a dedicated <slug>/<Name>.tsx for anything
// non-trivial)
const mySchema = z.object({
  title: z.string().min(1).register(ui, { label: 'Title', order: 0 }),
  photo: z.url().register(ui, { label: 'Photo', control: { kind: 'file' }, order: 1 }),
  background: z.string().register(ui, { label: 'Background', control: { kind: 'color' }, order: 2 }),
})

const myProject = defineProject({
  id: 'my-project',
  name: 'My Project',
  description: 'One line, shown on the project index.',
  frames: [
    defineFrame({
      id: 'main',
      name: 'Main',
      preset: 'youtube', // or width/height — see core/presets.ts for the full list
      schema: mySchema,
      defaults: { title: 'Hello', photo: '...', background: '#1d4ed8' },
      render: ({ title, photo }) => (
        <div className="relative h-full w-full">{/* Tailwind content, no <Page> here */}</div>
      ),
    }),
  ],
})
```

For a multi-frame project, build the frame list with `.map()` over a small
defaults array (see `SLIDE_DEFAULTS`/`instagramCarousel` in
`src/projects/projects.tsx`) rather than writing out N nearly-identical
`defineFrame` calls by hand — it keeps the one real difference between
frames (their per-slide defaults) visible instead of buried in repetition.

Set `layout: 'row'` on `defineProject` for anything that reads left-to-right
(a carousel); leave it at the `'column'` default for a stack. This is
purely the canvas preview arrangement — export order always follows DOM
order regardless.

### 6. Register it

Add the `defineProject(...)` result to the `projects` array exported from
`src/projects/projects.tsx`. This is what makes it appear on the project
index (`/`) and reachable at `?project=<id>`. `defineProject` throws if two
frames in the same project share an `id` — a real error, not a lint, so
you'll hear about it immediately if you copy-paste a frame and forget to
rename it.

### 7. Verify

Run `npx tsc -b` from the repo root and fix anything it flags — this catches
a mistyped `Control` kind or a schema/render mismatch without a full build.
Then, if a dev server isn't already running, start one (`npm run dev`) and
open `http://localhost:5173/?project=<id>`: confirm the frame renders, click
it to open the inspector, and edit a field to confirm it live-updates just
that frame (not siblings sharing the same schema — a real bug this shape of
mistake can hide, e.g. accidentally deriving a shared default object by
reference instead of per-frame). `npx vitest run` should still show all
existing tests passing — design work under `src/projects/`/`src/app/`
doesn't usually need new tests of its own (per `CLAUDE.md` §13, this layer
is verified by looking, not colocated tests — the exceptions are the pure
logic in `src/app/fieldControl.ts` and `src/app/projectStorage.ts`, which
already have coverage you shouldn't need to touch for typical project work).

## Design principles

- **One field, one clear control.** Don't offer both a `url` and a `file`
  control for the same field — pick the one that fits how this project's
  images actually get sourced (see step 4) and commit to it. If genuinely
  both matter, that's two fields with two labels, not one field wearing two
  hats.
- **Reuse a content component across presets before writing a new one.**
  `src/projects/thumbnail/Thumbnail.tsx` backs both the YouTube thumbnail
  and the OpenGraph card project at different `preset`s with the same
  schema — a photo-plus-title design usually only needs one component, not
  one per output size.
- **Every frame needs a stable, meaningful `id`.** It's the export filename
  stem, the inspector's identity for persisted values, and what a
  `pageIds`/`--project` filter targets. Don't reuse `slide-1` style ids
  across unrelated projects expecting them to be distinct — ids only need
  to be unique *within* a project, but pick something that reads sensibly
  in a downloaded filename regardless.
- **Defaults should render something presentable, not empty strings.** The
  project index and a fresh inspector both show `defaults` before anyone
  edits anything — an empty title or a broken placeholder photo is the
  first impression of a design that's otherwise done.
- **Don't invent a new `Control` kind.** The union in
  `src/projects/defineProject.ts` is deliberately small (`text`,
  `textarea`, `color`, `url`, `file`, `number`, `checkbox`, `select`) — if a
  field doesn't fit one of these, it's very likely still a `text` field
  with a `help` string explaining the expected format, not a reason to
  extend the framework for one project.

## Common mistakes this skill exists to prevent

- Adding `imageUrl`/`background`/etc. as props on the content component
  instead of schema fields with `ui` hints — that content becomes
  impossible to edit from the inspector even though it looks
  indistinguishable from an editable field at a glance.
- Putting `preset`/`width`/`height` in the zod schema, making page geometry
  look editable when the framework deliberately keeps it structural.
- Forgetting `order` on every field, leaving the inspector's field sequence
  to accident.
- Reaching for a `url` control on an image field by default and
  rediscovering the CORS problem this skill exists partly to head off (step
  4) — this has happened with a real remote image in this exact project.
- Writing a frame's content component to render its own `<Page>` — content
  components take content props only; `FrameSlot` owns the `<Page>` wrapper
  and applies `background` from the values automatically.
- Forgetting to add the new `defineProject(...)` to the `projects` array in
  `src/projects/projects.tsx` — the project builds cleanly but is
  unreachable from the index.
- Skipping `npx tsc -b` and finding out about a schema/render mismatch from
  the user instead of catching it yourself.
