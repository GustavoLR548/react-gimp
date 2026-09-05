// PostToolUse hook (Edit|Write) — reminds Claude to run the
// react-gimp-skill-sync skill after a change to react-gimp's project-
// authoring API, so .claude/skills/react-gimp-design doesn't silently
// drift from the real source. Skips test files and anything outside the
// small set of files that define that surface.
import { readFileSync } from 'node:fs'

const raw = readFileSync(0, 'utf8')

let input
try {
  input = JSON.parse(raw)
} catch {
  process.exit(0)
}

const filePath = input?.tool_input?.file_path
if (!filePath) process.exit(0)

if (/\.test\.tsx?$/.test(filePath)) process.exit(0)

const AUTHORING_API_FILES = [
  /\/src\/projects\/defineProject\.ts$/,
  /\/src\/app\/FieldControl\.tsx$/,
  /\/src\/app\/fieldControl\.ts$/,
  /\/src\/app\/FrameSlot\.tsx$/,
  /\/src\/app\/useProjectValues\.ts$/,
  /\/src\/app\/projectStorage\.ts$/,
  /\/src\/app\/AppRoot\.tsx$/,
  /\/src\/core\/presets\.ts$/,
  /\/scripts\/export-headless\.ts$/,
]

if (!AUTHORING_API_FILES.some((pattern) => pattern.test(filePath))) process.exit(0)

const message =
  "You just edited part of react-gimp's project-authoring API. Before " +
  'finishing this task, run the react-gimp-skill-sync skill ' +
  '(.claude/skills/react-gimp-skill-sync/SKILL.md) to check whether ' +
  ".claude/skills/react-gimp-design's docs need updating to match."

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: message,
    },
  }),
)
