import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { MoneyInput } from '../ui/MoneyInput'
import { ColorPicker } from '../ui/ColorPicker'
import { useData } from '../../context/DataContext'
import { createCard, updateCard } from '../../lib/db'
import { argbToHex, hexToArgb } from '../../lib/colors'
import type { Card } from '../../types/db'

export function CardForm({ open, editing, onClose }: { open: boolean; editing?: Card | null; onClose: () => void }) {
  const { reload } = useData()
  const [name, setName] = useState('')
  const [limit, setLimit] = useState(0)
  const [closing, setClosing] = useState(1)
  const [due, setDue] = useState(10)
  const [color, setColor] = useState('#7c5cfc')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setName(editing.name); setLimit(editing.credit_limit)
      setClosing(editing.closing_day); setDue(editing.due_day); setColor(argbToHex(editing.color))
    } else {
      setName(''); setLimit(0); setClosing(1); setDue(10); setColor('#7c5cfc')
    }
    setError('')
  }, [open, editing])

  function clampDay(n: number) { return Math.min(31, Math.max(1, n || 1)) }

  async function save() {
    if (!name.trim()) return setError('Dê um nome ao cartão.')
    setSaving(true)
    try {
      const payload = { name: name.trim(), credit_limit: limit, closing_day: closing, due_day: due, color: hexToArgb(color) }
      if (editing) await updateCard(editing.id, payload)
      else await createCard(payload)
      await reload()
      onClose()
    } catch (e) { setError((e as Error).message) } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar cartão' : 'Novo cartão'}>
      <div className="field">
        <label className="label">Nome</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Nubank, Cartão Saulo" autoFocus />
      </div>
      <div className="field">
        <label className="label">Limite</label>
        <MoneyInput value={limit} onChange={setLimit} />
      </div>
      <div className="row gap-md">
        <div className="field" style={{ flex: 1 }}>
          <label className="label">Fechamento (dia)</label>
          <input type="number" min={1} max={31} className="input" value={closing}
            onChange={(e) => setClosing(clampDay(parseInt(e.target.value, 10)))} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label className="label">Vencimento (dia)</label>
          <input type="number" min={1} max={31} className="input" value={due}
            onChange={(e) => setDue(clampDay(parseInt(e.target.value, 10)))} />
        </div>
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
