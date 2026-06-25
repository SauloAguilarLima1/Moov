import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { deleteAccount } from '../../lib/db'
import { argbToHex, iconFor } from '../../lib/colors'
import { formatBRL } from '../../lib/format'
import { AccountForm } from '../../components/forms/AccountForm'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { ManageHeader } from './ManageHeader'
import type { Account } from '../../types/db'

export function AccountsPage() {
  const { accountsWithBalance, reload } = useData()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [deleting, setDeleting] = useState<Account | null>(null)

  return (
    <div className="page">
      <ManageHeader title="Contas" addLabel="Nova" onAdd={() => { setEditing(null); setFormOpen(true) }} />
      <div className="card stack-card">
        {accountsWithBalance.length === 0 ? (
          <div className="list-empty">Nenhuma conta. Crie a primeira no botão acima.</div>
        ) : accountsWithBalance.map((a) => (
          <div key={a.id} className="manage-row">
            <button className="manage-main" onClick={() => { setEditing(a); setFormOpen(true) }}>
              <span className="icon-chip" style={{ background: argbToHex(a.color) + '22', color: argbToHex(a.color) }}>{iconFor(a.icon, '🏦')}</span>
              <div className="lr-main">
                <span className="lr-title">{a.name}</span>
                <span className="lr-sub">{a.bank || 'Conta'}</span>
              </div>
              <span className="lr-value accent tnum">{formatBRL(a.balance)}</span>
            </button>
            <button className="del-btn" onClick={() => setDeleting(a)} aria-label="Excluir">🗑</button>
          </div>
        ))}
      </div>

      <AccountForm open={formOpen} editing={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!deleting}
        title="Excluir conta"
        message={`Excluir "${deleting?.name}"? Os lançamentos ligados a ela ficarão sem conta.`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) { await deleteAccount(deleting.id); await reload() } setDeleting(null) }}
      />
    </div>
  )
}
