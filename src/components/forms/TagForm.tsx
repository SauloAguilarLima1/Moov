import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ColorPicker } from '../ui/ColorPicker'
import { useData } from '../../context/DataContext'
import { createTag, updateTag } from '../../lib/db'
import { argbToHex, hexToArgb } from '../../lib/colors'
import type { Tag } from '../../types/db'

export function TagForm({ open, editing, onClose }: { open: boolean; editing?: Tag | null; onClose: () => void }) {
  const { reload } = useData()
  const [name, setName] = useState('')
  const [color, setColor] = useState('#20c997')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) { setName(editing.name); setColor(argbToHex(editing.color)) }
    else { setName(''); setColor('#20c997') }
    setError('')
  }, [open, editing])

  async function save() {
    if (!name.trim()) return setError('Dê um nome à tag.')
    setSaving(true)
    try {
      const payload = { name: name.trim(), color: hexToArgb(color) }
      if (editing) await updateTag(editing.id, payload)
      else await createTag(payload)
      await reload()
      onClose()
    } catch (e) { setError((e as Error).message) } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar tag' : 'Nova tag'}>
      <div className="field">
        <label className="label">Nome</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Trabalho, Viagem…" autoFocus />
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
