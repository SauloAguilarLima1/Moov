import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { MoneyInput } from '../ui/MoneyInput'
import { ColorPicker } from '../ui/ColorPicker'
import { IconPicker } from '../ui/IconPicker'
import { useData } from '../../context/DataContext'
import { createAccount, updateAccount } from '../../lib/db'
import { argbToHex, hexToArgb, ACCOUNT_ICONS } from '../../lib/colors'
import type { Account, AccountType } from '../../types/db'

const TYPES: { v: AccountType; l: string }[] = [
  { v: 'checking', l: 'Conta corrente' },
  { v: 'savings', l: 'Poupança' },
  { v: 'wallet', l: 'Carteira' },
  { v: 'investment', l: 'Investimentos' },
]

export function AccountForm({ open, editing, onClose }: { open: boolean; editing?: Account | null; onClose: () => void }) {
  const { reload } = useData()
  const [name, setName] = useState('')
  const [bank, setBank] = useState('')
  const [type, setType] = useState<AccountType>('checking')
  const [initial, setInitial] = useState(0)
  const [color, setColor] = useState('#1e5eff')
  const [icon, setIcon] = useState('wallet')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setName(editing.name); setBank(editing.bank ?? ''); setType(editing.type)
      setInitial(editing.initial_balance); setColor(argbToHex(editing.color)); setIcon(editing.icon ?? 'wallet')
    } else {
      setName(''); setBank(''); setType('checking'); setInitial(0); setColor('#1e5eff'); setIcon('wallet')
    }
    setError('')
  }, [open, editing])

  async function save() {
    if (!name.trim()) return setError('Dê um nome à conta.')
    setSaving(true)
    try {
      const payload = { name: name.trim(), bank: bank.trim() || null, type, initial_balance: initial, color: hexToArgb(color), icon }
      if (editing) await updateAccount(editing.id, payload)
      else await createAccount(payload)
      await reload()
      onClose()
    } catch (e) { setError((e as Error).message) } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar conta' : 'Nova conta'}>
      <div className="field">
        <label className="label">Nome</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Banco do Brasil" autoFocus />
      </div>
      <div className="field">
        <label className="label">Banco (opcional)</label>
        <input className="input" value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Ex.: BB, Nubank…" />
      </div>
      <div className="field">
        <label className="label">Tipo</label>
        <select className="select" value={type} onChange={(e) => setType(e.target.value as AccountType)}>
          {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
        </select>
      </div>
      <div className="field">
        <label className="label">Saldo inicial</label>
        <MoneyInput value={initial} onChange={setInitial} />
      </div>
      <div className="field">
        <label className="label">Ícone</label>
        <IconPicker options={ACCOUNT_ICONS} value={icon} onChange={setIcon} />
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
