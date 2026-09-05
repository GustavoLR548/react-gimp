---
name: react-gimp-skill-sync
description: >
  Audit and update .claude/skills/react-gimp-design (the project-authoring
  skill's SKILL.md and references/component-api.md) so it matches
  react-gimp's actual current authoring API. Use this skill whenever
  you've just changed, added, or removed a type, field, or default in
  src/projects/defineProject.ts (FrameDef, ProjectDef, Control, ui
  registry), the field-control mapping in src/app/FieldControl.tsx or
  src/app/fieldControl.ts, the persistence shape in
  src/app/useProjectValues.ts or src/app/projectStorage.ts, the routing in
  src/app/AppRoot.tsx, the preset list in src/core/presets.ts, or the
  --project flag in scripts/export-headless.ts — before considering that
  work finished, even if nobody asked you to touch the skill. Also use it
  whenever the user says something like "update the design skill", "sync
  the skill docs", "the authoring API changed, fix the reference", or "the
  react-gimp-design skill is stale".
---

# Keeping react-gimp-design in sync with the real API

`references/component-api.md` in the `react-gimp-design` skill is a
snapshot of the project-authoring surface at the moment it was written.
Every claim in it came from reading the actual source — nothing in it is
authoritative on its own. When the source changes and the doc doesn't, the
next session that leans on that skill will confidently author a project
against a `Control` kind that no longer exists, or miss a new one. This
skill closes that gap.

## When to run a targeted vs. full audit

- **You just changed one specific piece** (e.g. added a `Control` kind, or
  changed `DEFAULT_MAX_FILE_SIZE_BYTES`) as part of other work: audit just
  that piece's section in `component-api.md`, plus a quick check of whether
  `SKILL.md`'s prose or its worked example mentions it.
- **The user asked for a general sync, or you're not sure what changed**:
  do the full pass below, section by section. It's cheap — both files are
  short and the source is small.
- **This repo has no meaningful git history to diff against**: compare the
  docs' claims directly against the current source, every time, rather
  than relying on `git diff`/`git log` to find what changed.

## Full audit workflow

1. **Re-derive the actual authoring surface.** Read these directly — types,
   defaults, and behavior, not comments claiming what they do:
   - `src/projects/defineProject.ts` — `Control`, `ControlMeta`, `ui`,
     `DEFAULT_MAX_FILE_SIZE_BYTES`, `FrameDef`, `AnyFrameDef`, `defineFrame`,
     `ProjectDef`, `defineProject` (including its duplicate-id throw
     message).
   - `src/app/fieldControl.ts` — `fieldsFor`'s sort behavior and
     `inferControl`'s exact mapping (which zod `def.type`s map to which
     `Control` kind, and what gets unwrapped first). Cross-check against
     `fieldControl.test.ts` — the tests are worked examples of the current
     inference rules.
   - `src/app/FieldControl.tsx` — every `Control['kind']` branch's actual
     rendered element and value type, especially anything added since the
     reference doc's table was last written.
   - `src/app/FrameSlot.tsx` — confirm the `background` field-name
     convention is still read the same way (`typeof values.background ===
     'string'`), and that content components still receive no `id`/
     `preset`/`background` props.
   - `src/app/useProjectValues.ts` + `src/app/projectStorage.ts` — the
     `localStorage` key format, the safeParse-fallback behavior, and
     whether "Reset to defaults" still routes through the same path.
   - `src/app/AppRoot.tsx` — the routing rules (no `?project`, valid id,
     unknown id, `&export=1`).
   - `src/core/presets.ts` — the `PresetName` union and `PRESETS` table.
   - `src/react/Img.tsx` and `src/core/cors.ts` — the CORS/`data:`-URL
     behavior the skill's "prefer `file` over `url`" guidance depends on.
   - `scripts/export-headless.ts` — the `--project` flag and the no-flag
     discovery behavior.
   - Whether any *new* concept exists in these files that
     `component-api.md` doesn't mention at all — that's a bigger gap than a
     changed default.

2. **Diff against `references/component-api.md`, table by table.** For the
   `Control` kind table specifically: does every kind in the union have a
   row, with the right rendered element and value type? For every other
   documented type/constant: does it still exist, same name, same shape,
   same default? Also check prose claims stated as fact (the `background`
   convention, the inference-unwrapping order, the persistence fallback
   behavior) against the current implementation, not just the tables.

3. **Check `SKILL.md` for drift too**, not just the reference doc:
   - The scaffold code block in step 5 — does it still compile against the
     current `defineFrame`/`defineProject`/`ui` API?
   - Step 3's control-kind guidance ("free text → text, ... a photo → file")
     — if a kind was added, removed, or its recommended use case changed,
     update this prose too, not just the reference table.
   - Step 4's CORS/`file`-vs-`url` guidance — re-verify against
     `src/react/Img.tsx`'s actual current failure behavior if it changed.
   - "Common mistakes" — re-verify each one is still a live mistake to warn
     about (not something the framework now prevents structurally) and add
     any new one this session's change makes newly possible.
   - The pointers to `src/projects/thumbnail/Thumbnail.tsx` and
     `src/projects/carousel/CarouselSlide.tsx` as worked examples — if
     either was renamed, removed, or no longer demonstrates the pattern the
     doc claims, update the pointer or find a better one.

4. **Edit both files in place**, surgically — preserve their structure and
   voice, change only what's actually stale. `CLAUDE.md` §16's own rule ("a
   shipped spec is edited in place") is the right model here too.

5. **Verify nothing is broken**: run `npx tsc -b` from the repo root. This
   won't catch a stale *doc*, but it confirms you didn't misread the
   current source, and that any code example you copied into the docs
   would actually compile if pasted in.

6. **Summarize what changed**, briefly — which types/behaviors drifted and
   what you updated. If the audit found nothing stale, say so plainly
   rather than making a cosmetic edit to justify the run.

## What this skill does not do

It does not author or edit any actual project under `src/projects/` —
that's `react-gimp-design`'s job. It does not change the framework itself —
if the *code* disagrees with `.spec/08-projects.md` or
`.spec/09-inspector.md`, that's a separate problem (one of them is a bug,
per `CLAUDE.md`) and not something this skill resolves by editing the
skill docs around it.
