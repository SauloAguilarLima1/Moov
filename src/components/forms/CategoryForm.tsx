import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ColorPicker } from '../ui/ColorPicker'
import { IconPicker } from '../ui/IconPicker'
import { useData } from '../../context/DataContext'
import { createCategory, updateCategory } from '../../lib/db'
import { argbToHex, hexToArgb, CATEGORY_ICONS } from '../../lib/colors'
import type { Category, CategoryType } from '../../types/db'

export function CategoryForm({ open, editing, onClose }: { open: boolean; editing?: Category | null; onClose: () => void }) {
  const { reload } = useData()
  const [name, setName] = useState('')
  const [type, setType] = useState<CategoryType>('expense')
  const [color, setColor] = useState('#f4a62a')
  const [icon, setIcon] = useState('other')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setName(editing.name); setType(editing.type); setColor(argbToHex(editing.color)); setIcon(editing.icon ?? 'other')
    } else {
      setName(''); setType('expense'); setColor('#f4a62a'); setIcon('other')
    }
    setError('')
  }, [open, editing])

  async function save() {
    if (!name.trim()) return setError('Dê um nome à categoria.')
    setSaving(true)
    try {
      const payload = { name: name.trim(), type, color: hexToArgb(color), icon }
      if (editing) await updateCategory(editing.id, payload)
      else await createCategory(payload)
      await reload()
      onClose()
    } catch (e) { setError((e as Error).message) } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar categoria' : 'Nova categoria'}>
      <div className="field">
        <label className="label">Nome</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Alimentação" autoFocus />
      </div>
      <div className="field">
        <label className="label">Tipo</label>
        <div className="segmented">
          <button className={type === 'expense' ? 'active' : ''} onClick={() => setType('expense')}>Despesa</button>
          <button className={type === 'income' ? 'active' : ''} onClick={() => setType('income')}>Receita</button>
        </div>
      </div>
      <div className="field">
        <label className="label">Ícone</label>
        <IconPicker options={CATEGORY_ICONS} value={icon} onChange={setIcon} />
      </div>
      <div className="field">
        <label className="label">Cor</label>
        <ColorPicker value={color} onChange={setColor} />
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="row gap-md" style={{ justifyContent: 'flex-end', marginTop: 'var(--s-md)' }}>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button loading={saving} onClick={save}>Salvar</Button>
      </div>
    </Modal>
  )
}
