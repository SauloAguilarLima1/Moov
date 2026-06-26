import { useState } from 'react'
import {
  type Period, type PeriodKind, presetPeriod, customPeriod, shiftPeriod, labelFor,
} from '../lib/period'
import { monthName } from '../lib/format'

interface Props {
  value: Period
  onChange: (p: Period) => void
}

const PRESETS: { kind: PeriodKind; label: string }[] = [
  { kind: 'month', label: 'Mês' },
  { kind: 'bimester', label: 'Bimestre' },
  { kind: 'trimester', label: 'Trimestre' },
  { kind: 'quadrimester', label: 'Quadrimestre' },
  { kind: 'semester', label: 'Semestre' },
  { kind: 'year', label: 'Ano' },
]

const monthNames = Array.from({ length: 12 }, (_, i) => monthName(i))

export function PeriodSwitcher({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const thisYear = new Date().getFullYear()
  const years = [thisYear - 2, thisYear - 1, thisYear, thisYear + 1]
  const [cs, setCs] = useState({
    sy: value.start.getFullYear(), sm: value.start.getMonth(),
    ey: value.end.getFullYear(), em: value.end.getMonth(),
  })

  function pick(kind: PeriodKind) {
    onChange(presetPeriod(kind, value.start))
    setOpen(false)
  }
  function applyCustom() {
    onChange(customPeriod(cs.sy, cs.sm, cs.ey, cs.em))
    setOpen(false)
  }

  return (
    <div className="period-switcher">
      <span className="ps-spacer" aria-hidden />
      <button className="ps-arrow" aria-label="Período anterior" onClick={() => onChange(shiftPeriod(value, -1))}>‹</button>
      <button className="ps-label" onClick={() => setOpen((o) => !o)}>{labelFor(value)}</button>
      <button className="ps-arrow" aria-label="Próximo período" onClick={() => onChange(shiftPeriod(value, 1))}>›</button>
      <button
        className={`ps-custom ${value.kind !== 'month' ? 'active' : ''}`}
        aria-label="Personalizar período"
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 8h10M18 8h2M4 16h4M12 16h8" />
          <circle cx="16" cy="8" r="2" /><circle cx="10" cy="16" r="2" />
        </svg>
      </button>

      {open && (
        <>
          <button className="ps-backdrop" aria-label="Fechar" onClick={() => setOpen(false)} />
          <div className="period-popover" role="dialog" aria-label="Personalizar período">
            <div className="pp-grid">
              {PRESETS.map((p) => (
                <button key={p.kind} className={`pp-preset ${value.kind === p.kind ? 'on' : ''}`} onClick={() => pick(p.kind)}>
                  {p.label}
                </button>
              ))}
            </div>
            <hr className="divider" style={{ margin: 'var(--s-md) 0' }} />
            <p className="t-caption" style={{ fontWeight: 600, marginBottom: 'var(--s-sm)' }}>Combinar meses</p>
            <div className="pp-custom">
              <select className="select pp-sel" value={cs.sm} onChange={(e) => setCs((s) => ({ ...s, sm: +e.target.value }))}>
                {monthNames.map((n, i) => <option key={i} value={i}>{n}</option>)}
              </select>
              <select className="select pp-sel" value={cs.sy} onChange={(e) => setCs((s) => ({ ...s, sy: +e.target.value }))}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <span className="pp-ate">até</span>
              <select className="select pp-sel" value={cs.em} onChange={(e) => setCs((s) => ({ ...s, em: +e.target.value }))}>
                {monthNames.map((n, i) => <option key={i} value={i}>{n}</option>)}
              </select>
              <select className="select pp-sel" value={cs.ey} onChange={(e) => setCs((s) => ({ ...s, ey: +e.target.value }))}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button className="btn btn-primary btn-sm btn-block" style={{ marginTop: 'var(--s-md)' }} onClick={applyCustom}>
              Aplicar
            </button>
          </div>
        </>
      )}
    </div>
  )
}
