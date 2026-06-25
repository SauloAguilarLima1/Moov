import { PALETTE } from '../../lib/colors'

interface Props {
  value: string // hex
  onChange: (hex: string) => void
}

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="color-grid">
      {PALETTE.map((hex) => (
        <button
          key={hex}
          type="button"
          className={`swatch ${value.toLowerCase() === hex.toLowerCase() ? 'selected' : ''}`}
          style={{ background: hex }}
          onClick={() => onChange(hex)}
          aria-label={`Cor ${hex}`}
        />
      ))}
    </div>
  )
}
