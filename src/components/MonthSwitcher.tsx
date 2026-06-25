import { monthName } from '../lib/format'

interface Props {
  value: Date
  onChange: (d: Date) => void
}

export function MonthSwitcher({ value, onChange }: Props) {
  const prev = new Date(value); prev.setMonth(prev.getMonth() - 1)
  const next = new Date(value); next.setMonth(next.getMonth() + 1)
  const showYear = value.getFullYear() !== new Date().getFullYear()

  return (
    <div className="month-switcher">
      <button className="ms-arrow" onClick={() => onChange(prev)} aria-label="Mês anterior">‹</button>
      <button className="ms-side" onClick={() => onChange(prev)}>{monthName(prev.getMonth())}</button>
      <span className="ms-current">
        {monthName(value.getMonth())}{showYear ? ` ${value.getFullYear()}` : ''}
      </span>
      <button className="ms-side" onClick={() => onChange(next)}>{monthName(next.getMonth())}</button>
      <button className="ms-arrow" onClick={() => onChange(next)} aria-label="Próximo mês">›</button>
    </div>
  )
}
