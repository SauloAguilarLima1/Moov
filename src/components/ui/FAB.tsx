import { useState } from 'react'
import type { TxType } from '../../types/db'

interface Props {
  onPick: (type: TxType) => void
}

const ACTIONS: { type: TxType; label: string; icon: string; cls: string }[] = [
  { type: 'income', label: 'Nova receita', icon: '↑', cls: 'pos' },
  { type: 'expense', label: 'Nova despesa', icon: '↓', cls: 'neg' },
  { type: 'transfer', label: 'Transferência', icon: '⇄', cls: 'accent' },
]

export function FAB({ onPick }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fab-wrap">
      {open && <button className="fab-backdrop" aria-label="Fechar" onClick={() => setOpen(false)} />}
      <div className="fab-actions" data-open={open}>
        {ACTIONS.map((a) => (
          <button
            key={a.type}
            className="fab-action"
            onClick={() => { onPick(a.type); setOpen(false) }}
          >
            <span className="fab-action-label">{a.label}</span>
            <span className={`fab-mini ${a.cls}`}>{a.icon}</span>
          </button>
        ))}
      </div>
      <button
        className="fab"
        aria-label="Adicionar lançamento"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="fab-plus" data-open={open}>+</span>
      </button>
    </div>
  )
}
