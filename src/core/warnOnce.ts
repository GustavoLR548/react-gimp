const warned = new Set<string>()

// Format: `[gimp] <what happened>. <what to do about it>.` — see CLAUDE.md §12.
export function warnOnce(key: string, message: string): void {
  if (warned.has(key)) return
  warned.add(key)
  console.warn(message)
}
