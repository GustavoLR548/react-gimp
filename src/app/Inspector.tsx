import { useEffect, useState } from 'react'
import { treeifyError } from 'zod'
import type { AnyFrameDef, FrameValues } from '../projects/defineProject'
import { fieldsFor } from './fieldControl'
import { FieldControl } from './FieldControl'

export type InspectorProps = {
  frame: AnyFrameDef
  values: FrameValues
  onChange: (values: FrameValues) => void
  onReset: () => void
}

// Holds a draft and only commits to the value store on a successful
// safeParse — the canvas keeps rendering the last valid values, so a
// half-typed URL never blanks the artboard. See .spec/09-inspector.md.
export function Inspector({ frame, values, onChange, onReset }: InspectorProps) {
  const [draft, setDraft] = useState<FrameValues>(values)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setDraft(values)
    setErrors({})
  }, [frame.id, values])

  function handleFieldChange(key: string, value: unknown): void {
    const next = { ...draft, [key]: value }
    setDraft(next)

    const result = frame.schema.safeParse(next)
    if (result.success) {
      setErrors({})
      onChange(result.data as FrameValues)
      return
    }

    const tree = treeifyError(result.error)
    const fieldErrors: Record<string, string> = {}
    for (const [fieldKey, fieldTree] of Object.entries(tree.properties ?? {})) {
      const message = fieldTree?.errors[0]
      if (message) fieldErrors[fieldKey] = message
    }
    setErrors(fieldErrors)
  }

  return (
    <div className="flex w-80 flex-none flex-col gap-4 overflow-y-auto border-l border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-200">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{frame.name}</h2>
        <button type="button" onClick={onReset} className="text-xs text-neutral-400 hover:text-neutral-200">
          Reset to defaults
        </button>
      </div>

      {fieldsFor(frame.schema).map(({ key, meta, control }) => (
        <FieldControl
          key={key}
          label={meta.label ?? key}
          help={meta.help}
          control={control}
          value={draft[key]}
          error={errors[key]}
          onChange={(value) => handleFieldChange(key, value)}
        />
      ))}
    </div>
  )
}
