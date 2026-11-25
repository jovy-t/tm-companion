import { useState } from 'react'

interface Props {
  value: number
  label: string
  onCommit: (value: number) => void
  className?: string
}

/**
 * A number you can tap and type into. The change is applied when you leave the
 * field or press Enter, so typing "12" doesn't count as two separate edits.
 */
export function NumberField({ value, label, onCommit, className }: Props) {
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    if (draft !== null && /^-?\d+$/.test(draft.trim())) {
      onCommit(parseInt(draft.trim(), 10))
    }
    setDraft(null)
  }

  return (
    <input
      className={className}
      type="text"
      inputMode="numeric"
      aria-label={label}
      value={draft ?? String(value)}
      onFocus={(event) => {
        setDraft(String(value))
        event.target.select()
      }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur()
        if (event.key === 'Escape') {
          setDraft(null)
          event.currentTarget.blur()
        }
      }}
    />
  )
}
