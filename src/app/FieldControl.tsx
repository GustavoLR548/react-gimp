import type { ChangeEvent } from 'react'
import { useState } from 'react'
import { DEFAULT_MAX_FILE_SIZE_BYTES } from '@react-gimp/sdk'
import type { Control } from '@react-gimp/sdk'

export type FieldControlProps = {
  label: string
  help?: string
  control: Control
  value: unknown
  error?: string
  onChange: (value: unknown) => void
}

export function FieldControl({ label, help, control, value, error, onChange }: FieldControlProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-neutral-400">{label}</span>
      {renderInput({ control, value, onChange })}
      {error ? (
        <span className="text-xs text-red-400">{error}</span>
      ) : (
        help && <span className="text-xs text-neutral-500">{help}</span>
      )}
    </label>
  )
}

type RenderInputOpts = { control: Control; value: unknown; onChange: (value: unknown) => void }

function renderInput({ control, value, onChange }: RenderInputOpts) {
  const stringValue = typeof value === 'string' ? value : ''

  if (control.kind === 'textarea') {
    return (
      <textarea
        className="rounded bg-neutral-800 px-2 py-1"
        rows={control.rows ?? 4}
        value={stringValue}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (control.kind === 'color') {
    return (
      <input
        type="color"
        className="h-8 w-16 rounded bg-neutral-800"
        value={stringValue || '#000000'}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (control.kind === 'url') {
    return (
      <input
        type="url"
        className="rounded bg-neutral-800 px-2 py-1"
        value={stringValue}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (control.kind === 'file') {
    return (
      <FilePickerControl
        value={stringValue}
        accept={control.accept ?? 'image/*'}
        maxSizeBytes={control.maxSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES}
        onChange={onChange}
      />
    )
  }

  if (control.kind === 'number') {
    return (
      <input
        type="number"
        className="rounded bg-neutral-800 px-2 py-1"
        min={control.min}
        max={control.max}
        step={control.step}
        value={typeof value === 'number' ? value : ''}
        onChange={(e) => onChange(e.target.valueAsNumber)}
      />
    )
  }

  if (control.kind === 'checkbox') {
    return <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
  }

  if (control.kind === 'select') {
    return (
      <select
        className="rounded bg-neutral-800 px-2 py-1"
        value={stringValue}
        onChange={(e) => onChange(e.target.value)}
      >
        {control.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      type="text"
      className="rounded bg-neutral-800 px-2 py-1"
      value={stringValue}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  return `${Math.round(bytes / 1024)}KB`
}

type FilePickerControlProps = {
  value: string
  accept: string
  maxSizeBytes: number
  onChange: (value: unknown) => void
}

// Reads the chosen file into a data: URL rather than uploading it anywhere
// — this codebase already treats data: URLs as same-origin (core/cors.ts),
// so a picked file never hits the CORS problem an <img src> URL can. The
// tradeoff lands in localStorage instead: the data URL is what gets
// persisted, so oversized files are rejected up front rather than silently
// bloating (or blowing) the project's storage quota.
function FilePickerControl({ value, accept, maxSizeBytes, onChange }: FilePickerControlProps) {
  const [pickError, setPickError] = useState<string | undefined>(undefined)

  function handleFile(e: ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.size > maxSizeBytes) {
      setPickError(`"${file.name}" is ${formatBytes(file.size)}, over the ${formatBytes(maxSizeBytes)} limit.`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPickError(undefined)
      onChange(String(reader.result))
    }
    reader.onerror = () => setPickError(`Could not read "${file.name}".`)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {value && <img src={value} alt="" className="h-12 w-12 rounded object-cover" />}
        <input
          type="file"
          accept={accept}
          onChange={handleFile}
          className="flex-1 text-xs text-neutral-400 file:mr-2 file:rounded file:border-0 file:bg-neutral-800 file:px-2 file:py-1 file:text-neutral-200 file:hover:bg-neutral-700"
        />
      </div>
      {pickError && <span className="text-xs text-red-400">{pickError}</span>}
    </div>
  )
}
