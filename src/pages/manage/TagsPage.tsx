import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { deleteTag } from '../../lib/db'
import { argbToHex } from '../../lib/colors'
import { TagForm } from '../../components/forms/TagForm'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { ManageHeader } from './ManageHeader'
import type { Tag } from '../../types/db'

export function TagsPage() {
  const { tags, reload } = useData()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Tag | null>(null)
  const [deleting, setDeleting] = useState<Tag | null>(null)

  return (
    <div className="page">
      <ManageHeader title="Tags" addLabel="Nova" onAdd={() => { setEditing(null); setFormOpen(true) }} />
      <div className="card stack-card">
        {tags.length === 0 ? (
          <div className="list-empty">Nenhuma tag. Crie a primeira no botão acima.</div>
        ) : tags.map((t) => (
          <div key={t.id} className="manage-row">
            <button className="manage-main" onClick={() => { setEditing(t); setFormOpen(true) }}>
              <span className="tag-dot" style={{ background: argbToHex(t.color) }} />
              <div className="lr-main"><span className="lr-title">{t.name}</span></div>
            </button>
            <button className="del-btn" onClick={() => setDeleting(t)} aria-label="Excluir">🗑</button>
          </div>
        ))}
      </div>

      <TagForm open={formOpen} editing={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!deleting}
        title="Excluir tag"
        message={`Excluir "${deleting?.name}"?`}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) { await deleteTag(deleting.id); await reload() } setDeleting(null) }}
      />
    </div>
  )
}
