import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { deleteCard } from '../../lib/db'
import { argbToHex } from '../../lib/colors'
import { formatBRL } from '../../lib/format'
import { CardForm } from '../../components/forms/CardForm'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { ManageHeader } from './ManageHeader'
import type { Card } from '../../types/db'

export function CardsPage() {
  const { cards, reload, invoiceForCard } = useData()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Card | null>(null)
  const [deleting, setDeleting] = useState<Card | null>(null)

  return (
    <div className="page">
      <ManageHeader title="Cartões" addLabel="Novo" onAdd={() => { setEditing(null); setFormOpen(true) }} />
      <div className="card stack-card">
        {cards.length === 0 ? (
          <div className="list-empty">Nenhum cartão cadastrado.</div>
        ) : cards.map((c) => (
          <div key={c.id} className="manage-row">
            <button className="manage-main" onClick={() => { setEditing(c); setFormOpen(true) }}>
              <span className="card-chip" style={{ background: argbToHex(c.color) }}>💳</span>
              <div className="lr-main">
                <span className="lr-title">{c.name}</span>
                <span className="lr-sub">Limite {formatBRL(c.credit_limit)} · vence dia {c.due_day}</span>
              </div>
              <span className="lr-value tnum">{formatBRL(invoiceForCard(c.id))}</span>
            </button>
            <button className="del-btn" onClick={() => setDeleting(c)} aria-label="Excluir">🗑</button>
          </div>
        ))}
      </div>

      <CardForm open={formOpen} editing={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!deleting}
        title="Excluir cartão"
        message={`Excluir "${deleting?.name}"?`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) { await deleteCard(deleting.id); await reload() } setDeleting(null) }}
      />
    </div>
  )
}
