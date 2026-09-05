# CLAUDE.md — Engineering Spec

Binding conventions for this repository. These are rules, not preferences: when
two forms both work, use the one written here. Consistency across sessions is the
entire point.

`.spec/*.md` owns *design*. This file owns *form*. If they disagree, one is a
bug — decide which and fix it, don't route around it.

This file is ported from `react-prezi/CLAUDE.md`, the sibling project by the
same author. Most of it carries over verbatim. Where it doesn't, this doc says
so explicitly instead of leaving it to be rediscovered.

---

## 1. Who this is for

**This is a personal tool with one user.** It is not a library, it will not be
published, and there is no second consumer to design for. That shapes every
judgment call:

| Optimize for | Do not spend effort on |
|---|---|
| Fewer moving parts | Generality, extension points, plugin seams |
| Speed of authoring a design | Backwards compatibility, deprecation paths |
| Loud, immediate errors | Graceful degradation for unknown consumers |
| Being able to change your mind | API stability, semver, migration guides |
| Things that make exports *correct* | Bundle size, dependency count, tree-shaking |

When a rule below and this table conflict, this table wins — and then fix the
rule.

## 2. The one invariant

react-gimp is a **static rasterization engine, not a camera engine.** It has no
per-frame path, no rAF loop, no camera. react-prezi's §2 camera invariants do
not apply here — there is nothing per-frame to protect. What replaces them is
one invariant of the same weight:

> **The preview transform never touches the artboard.** `<Page>` is a plain,
> untransformed, exactly-`w×h` box. All zoom and pan live on an ancestor stage
> element inside `<Canvas>`.

This is what makes "scale the preview without mutating pixel dimensions" true
by construction, and what keeps rasterization correct — verified against the
`html-to-image`/`modern-screenshot` clone-node source, not assumed. See
`.spec/01-artboard.md`.

`useExport` returning ordinary React state is fine here, unlike react-prezi
(where refs are mandatory for anything touched during camera flight) — there
is no per-frame value in this codebase for a re-render to race against. State
updates only happen *between* captures, never inside a single rasterize call's
await window — that's a correctness rule about not committing React mid-export,
not a per-frame-performance rule.

## 3. Deliberately not doing

Listed so a future session doesn't helpfully reintroduce them:

- **No npm publishing apparatus.** No exports map, no library-mode build config,
  no bundle-size budget or test, no `peerDependencies` juggling. The playground
  imports from `src/` directly.
- **No zero-dependency rule.** Add a dependency if it saves real time. The bar is
  "does this pull its weight," not "can I avoid it." `zod` (^4.5.4, in
  `dependencies`) is the one so far — it drives the inspector's per-frame
  schemas and field hints (`.spec/09-inspector.md`). `core/`, `react/`, and
  `export/` never import it; it is an `app/`+`projects/`-layer concern.
- **No `process.env.NODE_ENV` stripping.** Dev warnings and invariant throws stay
  on always. You are the only person who will ever see them and you want them
  loud.
- **No API stability.** Rename anything, any time. Update `.spec/` in the same
  commit and move on.
- **No SSR, no static first paint.**
- **No URL-rewriting CORS proxy hook.** An extension point with no second
  consumer. The rasterizer already does fetch-and-inline; this project adds
  knowing *which* URL failed and saying so before you ship a broken asset.
- **No grid layout for multi-page.** One axis (`column` or `row`) is enough and
  keeps the fit-measurement math identical either way.

## 4. Layout

```
react-gimp/
  src/
    core/        # plain functions, no React, no DOM. tested hard.
    react/       # components + hooks. imports core/. never sideways.
    export/      # heavy + DOM-touching. reached only via dynamic import().
    projects/    # design content + definitions: FrameDef/ProjectDef, the
                 # zod schemas + `ui` registry, frame content components.
    app/         # shell chrome: routing, landing page, canvas + inspector,
                 # export bar. Tailwind (see §10).
  scripts/       # headless (Node/Playwright) recipes
  .spec/
```

Dependency direction is one-way and enforced by review: `core/` imports
nothing local. `export/` imports `core/`. `react/` imports both. `projects/`
imports `core/` and `react/`. `app/` imports all four. `scripts/` imports
`core/` and `export/` only — it never imports `.tsx` project components
(`.spec/08-projects.md`). Never sideways between `react/` components.
**`core/`, `react/`, and `export/` never import `zod`** — schemas are a
`projects/`/`app/`-layer concern (`.spec/09-inspector.md`).

**One deliberate stretch of this rule:** `pageRegistry.ts` lives in `react/`,
not `core/`, even though it holds no React — because it stores `HTMLElement`
references and `core/` forbids DOM. Don't "helpfully" move it; that would
break the no-DOM-in-core invariant, not fix a misplaced file.

## 5. Formatting

- **No semicolons.** Statements end at the newline.
- **Single quotes** in TS, **double quotes** in JSX attributes.
- **2-space indent**, **80-column** wrap.
- **Trailing commas** in multiline literals, params, and type bodies.
- Blank line between logical blocks. None after `{` or before `}`.

## 6. Naming

| Thing | Case | Example |
|---|---|---|
| Variables, functions, hooks, props | `camelCase` | `resolvePageSize`, `pixelRatio` |
| Types, components | `PascalCase` | `PageEntry`, `Canvas` |
| Module-level true constants | `UPPER_SNAKE` | `MAX_CANVAS_PX`, `PX_PER_IN` |
| Core module files | `camelCase.ts` | `filename.ts` |
| Component files | `PascalCase.tsx` | `Canvas.tsx` |

- Hooks start with `use`. Nothing else does.
- Props types are `<Component>Props`, declared directly above the component.
- Boolean **state** reads `is` / `has` / `can`: `isExporting`, `hasSettled`.
- Boolean **JSX props** read as bare flags: `interactive`, `crossOrigin`.
- An unsubscribe function is named `unsubscribe` (or `unregister` for a
  registry entry). Never `off`, `cleanup`, `dispose`.
- Internal locals carrying an ambiguous number take a unit suffix: `pixelRatio`
  is unitless by convention (matches the rasterizer's own field name); `wPt`,
  `hPt`, `timeoutMs` spell out their unit.

## 7. Types

- **`type`, never `interface`.** Including props.
- **Union string literals, never `enum`.** `PresetName` is a plain union plus a
  `Record` lookup table, with raw `width`/`height` as the uncapped escape
  hatch.
- **No `any`.** `unknown` at untyped boundaries, narrowed immediately.
- No `as` except DOM `querySelector` results and `as const`. Needing it
  elsewhere means the type is wrong.
- Data types are flat objects of primitives. No classes, no methods on data.
- `import type` for type-only imports.

## 8. Functions

- **Guard clauses only.** Early return on the exceptional case; the happy path
  is never indented inside an `else`.
- **No `else` after `return`.** No `else if` chains — early returns, or a
  lookup object keyed by the union member.
- **Max nesting depth 2.** Deeper means extract.
- **Single-level ternaries.** Never nested, never multiline.
- More than two parameters → one options object, last.
- Defaults resolved in **one destructure at the top**, never scattered `??` at
  use sites:

  ```ts
  const { padding = 32, layout = 'column', gap = 48 } = opts ?? {}
  ```

- `core/` functions are pure: never mutate an argument, always return fresh.
- No array or closure allocation inside a hot measurement path (the
  `ResizeObserver` callback, the wheel handler). Small fresh objects are fine.

## 9. React

- Function declarations, not arrow consts. No `React.FC`.
- `useLayoutEffect` for anything that must land before paint: registry writes,
  the stage transform write (see `.spec/02-viewport.md` for why the stage
  transform specifically must be imperative, not a state-driven style prop).
- One context per concern, reached through a `useX()` accessor that throws
  outside its provider. Never export the raw context.
- No `window` / `document` listeners for gestures. Attach to the `<Canvas>`
  element itself, via `setPointerCapture` on that element — never
  `window`/`document`.
- Components in `react/` hold no math. They call `core/`.
- No `React.memo` unless a render-counter test proves it necessary.

## 10. Styling

**Tailwind for design content.** It is the fastest way to author pages and you
are the only consumer — use it freely inside `playground/assets/` and in the
children of `<Page>`, via the `className` passthrough.

One hard exclusion:

- **Framework structure in `src/react/`** (`<Canvas>`, `<Page>`, `<Img>`
  internals) **uses plain inline styles and `gm-` prefixed classes, not
  Tailwind.** The stage transform, artboard sizing, and gesture plumbing are
  computed values, not utility classes.

Static structural CSS lives in one stylesheet, `styles.css`, with `gm-`
prefixed classes: `gm-canvas`, `gm-stage`, `gm-pages`, `gm-page`.

`<Page className>` is one of the few deliberate overrides of §3's "no
extension points for a single consumer" spirit — it's the entire authoring
surface of the tool, not a speculative plugin seam.

## 11. Math

- No angles, no rotation, no world/screen duality — this is a 2D flat preview,
  not a camera. The only geometry is `core/fit.ts`: fitting a fixed-size
  rectangle into a viewport, computing pan/zoom bounds, and unit conversion
  (`core/units.ts`).
- **Never compare floats with `===`.** Named epsilon constants where it
  matters (the `fit.ts` zoom round-trip test uses `1e-9`).
- Every closed form states its singular cases and handles each with a named
  early return: a zero-size viewport in `fitScale` returns `1`, never
  `NaN`/`Infinity`.

## 12. Errors

- Format: `[gimp] <what happened>. <what to do about it>.`
- **Throw** on anything that cannot produce a sane result: `resolvePageSize`
  given neither/both of `preset`/`width`+`height`, a duplicate `<Page id>`, a
  `<Page>` carrying its own `transform`/`position: fixed` right before
  capture, a rasterizer returning no image data.
- **Warn once** on recoverable problems (a CORS-blocked image, a hung asset
  past its timeout, a canvas-size clamp) via the shared `warnOnce(key,
  message)`. Never warn from a hot path without it.
- **"Handle X gracefully" never means "silently substitute something wrong."**
  It means: the export still completes, and it tells you precisely what
  broke, before you've shipped a file with a hole in it. `imagePlaceholder`
  defaults unset for exactly this reason — see `.spec/04-asset-guard.md`.
- No stripping, no log levels, no silent fallbacks otherwise. Fail loudly and
  immediately.
- No `console.log` in committed code.

## 13. Tests

Test where bugs are invisible; skip where you can just look at the screen.

- **`core/` is tested hard.** Presets, fit math, filenames, units, the raster
  clamp, CORS detection — these are wrong in ways you cannot see.
- **`react/` gets almost no tests.** The named exceptions, both invisible but
  critical: the registry's document-order listing and duplicate-id throw
  (`pageRegistry.test.ts`), and the export mutate/restore closures running
  even when a capture throws mid-loop (`useExport.test.tsx`). Everything else
  in `react/` — `<Canvas>`'s gestures and fit behavior — verify by looking.
- Vitest, colocated: `fit.test.ts` beside `fit.ts`.
- Property tests with a fixed seed for invertible math: zoom-in-then-zoom-out
  returns the original pan to `1e-9` in `fit.test.ts`.

## 14. Comments

- Comment **why**, never what.
- Anything that looks like a bug but is deliberate names the spec that decided
  it, e.g.:

  ```ts
  // contain: layout paint, not style — style breaks CSS counters. See .spec/01.
  ```

- No commented-out code. No TODO without an open-question entry in
  `.spec/99-open-questions.md`.
- No JSDoc. Types carry the signature; the spec carries the reasoning.

## 15. Working a step

1. Read `.spec/NN-*.md` and its dependencies.
2. Build it. If a spec API is wrong, change the spec in the same commit.
3. Tick the acceptance boxes as their tests pass; update the status board in
   `.spec/README.md`.
4. Move any resolved open question into its owning step's spec and delete it
   from `.spec/99-open-questions.md`.
5. When the last `[ ]` of a `.spec/STATE.md` entry is ticked, delete that
   entry.

## 16. Changing a spec

A shipped spec is edited **in place**. Amending the doc that owns an API beats
writing a second doc that contradicts it. New *design area* → new numbered
spec; new *surface on an existing API* → its owning doc.

**Any spec edit that adds unbuilt design updates `.spec/STATE.md` in the same
commit.** Write the new acceptance criteria as unchecked `- [ ]` boxes in the
owning spec, add or extend that spec's ledger entry in `STATE.md`, and mark
the status board `✅ done · 📝 <note>`.

The ledger's invariant is one command:

```
grep -rn '^- \[ \]' .spec/*.md
```

Every spec it names appears in `STATE.md`, every `STATE.md` entry still has at
least one unchecked box, and the counts match.

`STATE.md` describes the present, never the history. A finished entry is
deleted, not annotated — git has the history. An empty ledger means code and
spec agree and is the goal state.
