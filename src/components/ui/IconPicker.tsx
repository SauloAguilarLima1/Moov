import { iconFor } from '../../lib/colors'

interface Props {
  options: string[]
  value: string | null
  onChange: (v: string) => void
}

export function IconPicker({ options, value, onChange }: Props) {
  return (
    <div className="icon-grid">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={`icon-opt ${value === o ? 'selected' : ''}`}
          onClick={() => onChange(o)}
          aria-label={o}
        >
          {iconFor(o)}
        </button>
      ))}
    </div>
  )
}
