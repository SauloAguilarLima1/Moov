import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { deleteCategory } from '../../lib/db'
import { argbToHex, iconFor } from '../../lib/colors'
import { CategoryForm } from '../../components/forms/CategoryForm'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { ManageHeader } from './ManageHeader'
import type { Category } from '../../types/db'

export function CategoriesPage() {
  const { categories, reload } = useData()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)

  const expenses = categories.filter((c) => c.type === 'expense')
  const incomes = categories.filter((c) => c.type === 'income')

  const renderRow = (c: Category) => (
    <div key={c.id} className="manage-row">
      <button className="manage-main" onClick={() => { setEditing(c); setFormOpen(true) }}>
        <span className="icon-chip" style={{ background: argbToHex(c.color) + '22', color: argbToHex(c.color) }}>{iconFor(c.icon)}</span>
        <div className="lr-main"><span className="lr-title">{c.name}</span></div>
      </button>
      <button className="del-btn" onClick={() => setDeleting(c)} aria-label="Excluir">🗑</button>
    </div>
  )

  return (
    <div className="page">
      <ManageHeader title="Categorias" addLabel="Nova" onAdd={() => { setEditing(null); setFormOpen(true) }} />
      <div className="card stack-card">
        <h2 className="t-section">Despesas</h2>
        <hr className="divider" />
        {expenses.length === 0 ? <div className="list-empty">Nenhuma categoria de despesa.</div> : expenses.map(renderRow)}
      </div>
      <div className="card stack-card">
        <h2 className="t-section">Receitas</h2>
        <hr className="divider" />
        {incomes.length === 0 ? <div className="list-empty">Nenhuma categoria de receita.</div> : incomes.map(renderRow)}
      </div>

      <CategoryForm open={formOpen} editing={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!deleting}
        title="Excluir categoria"
        message={`Excluir "${deleting?.name}"?`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) { await deleteCategory(deleting.id); await reload() } setDeleting(null) }}
      />
    </div>
  )
}
