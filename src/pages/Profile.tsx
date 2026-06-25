import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { updateProfile } from '../lib/db'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { formatDate } from '../lib/format'

export function Profile() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const { accounts, cards, categories, tags, transactions, accountById, categoryById } = useData()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [name, setName] = useState(profile?.name ?? '')
  const [saving, setSaving] = useState(false)

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Você'

  const items = [
    { label: 'Contas', desc: `${accounts.length} cadastrada(s)`, icon: '🏦', to: '/app/accounts' },
    { label: 'Cartões de crédito', desc: `${cards.length} cadastrado(s)`, icon: '💳', to: '/app/cards' },
    { label: 'Categorias', desc: `${categories.length} cadastrada(s)`, icon: '🗂️', to: '/app/categories' },
    { label: 'Tags', desc: `${tags.length} cadastrada(s)`, icon: '🏷️', to: '/app/tags' },
  ]

  async function saveName() {
    setSaving(true)
    try {
      await updateProfile({ name: name.trim() })
      await refreshProfile()
      setEditOpen(false)
    } finally { setSaving(false) }
  }

  function exportCsv() {
    const head = ['data', 'descricao', 'tipo', 'valor', 'categoria', 'conta', 'status']
    const lines = transactions.map((t) => [
      formatDate(t.date),
      `"${t.description.replace(/"/g, '""')}"`,
      t.type,
      (t.amount / 100).toFixed(2).replace('.', ','),
      `"${categoryById(t.category_id)?.name ?? ''}"`,
      `"${accountById(t.account_id)?.name ?? ''}"`,
      t.status,
    ].join(';'))
    const csv = [head.join(';'), ...lines].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `moov-lancamentos-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">
      <header className="screen-head"><h1 className="t-h1">Perfil</h1></header>

      <div className="profile-head">
        <div className="avatar avatar-lg" aria-hidden>{displayName[0]?.toUpperCase()}</div>
        <h2 className="t-h1">{displayName}</h2>
        <p className="t-caption">{user?.email}</p>
        <Button variant="ghost" className="btn-sm" onClick={() => { setName(profile?.name ?? ''); setEditOpen(true) }}>
          Editar perfil
        </Button>
      </div>

      <section className="card stack-card">
        <h2 className="t-section">Configure</h2>
        <hr className="divider" />
        {items.map((it) => (
          <button key={it.label} className="config-row" onClick={() => navigate(it.to)}>
            <span className="icon-chip">{it.icon}</span>
            <div className="lr-main">
              <span className="lr-title">{it.label}</span>
              <span className="lr-sub">{it.desc}</span>
            </div>
            <span className="chevron">›</span>
          </button>
        ))}
      </section>

      <section className="card stack-card">
        <h2 className="t-section">Dados</h2>
        <hr className="divider" />
        <button className="config-row" onClick={exportCsv}>
          <span className="icon-chip">📤</span>
          <div className="lr-main">
            <span className="lr-title">Exportar lançamentos (CSV)</span>
            <span className="lr-sub">{transactions.length} lançamento(s)</span>
          </div>
          <span className="chevron">›</span>
        </button>
        <div className="config-row disabled">
          <span className="icon-chip">🔗</span>
          <div className="lr-main">
            <span className="lr-title">Conexões bancárias (Open Finance)</span>
            <span className="lr-sub">Em breve</span>
          </div>
        </div>
      </section>

      <Button variant="danger" block onClick={() => signOut()} style={{ marginTop: 'var(--s-lg)' }}>Sair da conta</Button>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar perfil">
        <div className="field">
          <label className="label">Nome</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="row gap-md" style={{ justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button loading={saving} onClick={saveName}>Salvar</Button>
        </div>
      </Modal>
    </div>
  )
}
