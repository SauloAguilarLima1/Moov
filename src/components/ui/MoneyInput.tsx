import { centsToDisplay, parseToCents } from '../../lib/format'

interface Props {
  value: number // centavos
  onChange: (cents: number) => void
  autoFocus?: boolean
  id?: string
}

/** Campo de dinheiro: mostra "R$ 1.234,56", guarda centavos. */
export function MoneyInput({ value, onChange, autoFocus, id }: Props) {
  return (
    <div className="money-input">
      <span className="money-prefix">R$</span>
      <input
        id={id}
        className="input money-field tnum"
        inputMode="numeric"
        autoFocus={autoFocus}
        value={centsToDisplay(value)}
        onChange={(e) => onChange(parseToCents(e.target.value))}
        placeholder="0,00"
      />
    </div>
  )
}
