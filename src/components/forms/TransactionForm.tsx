import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { MoneyInput } from '../ui/MoneyInput'
import { useData } from '../../context/DataContext'
import { createTransaction, updateTransaction, setTransactionTags, deleteTransaction } from '../../lib/db'
import { toDateInput } from '../../lib/format'
import { argbToHex } from '../../lib/colors'
import type { Transaction, TxType } from '../../types/db'

interface Props {
  open: boolean
  type: TxType
  editing?: Transaction | null
  onClose: () => void
  onSaved: () => void
}

const TITLES: Record<TxType, string> = {
  income: 'Nova receita',
  expense: 'Nova despesa',
  transfer: 'Transferência',
}

export function TransactionForm({ open, type, editing, onClose, onSaved }: Props) {
  const { accounts, cards, categories, tags, tagsForTx, reload } = useData()

  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(toDateInput(new Date().toISOString()))
  const [source, setSource] = useState('') // "acc:<id>" | "card:<id>"
  const [toAccountId, setToAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [cleared, setCleared] = useState(true)
  const [installments, setInstallments] = useState(1)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  const catOptions = useMemo(
    () => categories.filter((c) => (type === 'income' ? c.type === 'income' : c.type === 'expense')),
    [categories, type],
  )

  // (Re)inicializa quando abre / muda alvo de edição.
  useEffect(() => {
    if (!open) return
    if (editing) {
      setAmount(editing.amount)
      setDescription(editing.description)
      setDate(toDateInput(editing.date))
      setSource(editing.card_id ? `card:${editing.card_id}` : editing.account_id ? `acc:${editing.account_id}` : '')
      setToAccountId(editing.to_account_id ?? '')
      setCategoryId(editing.category_id ?? '')
      setCleared(editing.status === 'cleared')
      setInstallments(editing.installment_of ?? 1)
      setSelectedTags(tagsForTx(editing.id))
    } else {
      setAmount(0); setDescription(''); setDate(toDateInput(new Date().toISOString()))
      setSource(accounts[0] ? `acc:${accounts[0].id}` : '')
      setToAccountId(accounts[1]?.id ?? accounts[0]?.id ?? '')
      setCategoryId('')
      setCleared(true); setInstallments(1); setSelectedTags([])
    }
    setError(''); setConfirmDel(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing])

  async function handleDelete() {
    if (!editing) return
    setSaving(true)
    try {
      await deleteTransaction(editing.id)
      await reload()
      onSaved()
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function toggleTag(id: string) {
    setSelectedTags((s) => (s.includes(id) ? s.filter((t) => t !== id) : [...s, id]))
  }

  async function handleSave() {
    setError('')
    if (amount <= 0) return setError('Informe um valor maior que zero.')
    if (!description.trim()) return setError('Informe uma descrição.')
    const isoDate = `${date}T12:00:00`

    let account_id: string | null = null
    let card_id: string | null = null
    if (type === 'transfer') {
      account_id = source.startsWith('acc:') ? source.slice(4) : null
      if (!account_id || !toAccountId) return setError('Escolha as contas de origem e destino.')
      if (account_id === toAccountId) return setError('Origem e destino devem ser diferentes.')
    } else {
      if (!source) return setError('Escolha a conta ou cartão.')
      if (source.startsWith('card:')) card_id = source.slice(5)
      else account_id = source.slice(4)
    }

    setSaving(true)
    try {
      if (editing) {
        await updateTransaction(editing.id, {
          amount, description: description.trim(), date: isoDate, type,
          account_id, to_account_id: type === 'transfer' ? toAccountId : null,
          card_id, category_id: type === 'transfer' ? null : categoryId || null,
          status: cleared ? 'cleared' : 'pending',
        })
        await setTransactionTags(editing.id, selectedTags)
      } else {
        const n = type === 'expense' ? Math.max(1, installments) : 1
        const base = Math.floor(amount / n)
        for (let i = 0; i < n; i++) {
          const part = i === n - 1 ? amount - base * (n - 1) : base
          const d = new Date(`${date}T12:00:00`)
          d.setMonth(d.getMonth() + i)
          const created = await createTransaction({
            amount: part,
            description: n > 1 ? `${description.trim()} (${i + 1}/${n})` : description.trim(),
            date: d.toISOString(),
            type,
            account_id,
            to_account_id: type === 'transfer' ? toAccountId : null,
            card_id,
            category_id: type === 'transfer' ? null : categoryId || null,
            status: cleared ? 'cleared' : 'pending',
            installment_no: n > 1 ? i + 1 : null,
            installment_of: n > 1 ? n : null,
          })
          if (selectedTags.length) await setTransactionTags(created.id, selectedTags)
        }
      }
      await reload()
      onSaved()
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const statusLabel = type === 'income' ? 'Recebido' : 'Pago'

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar lançamento' : TITLES[type]}>
      <div className="field">
        <label className="label" htmlFor="tx-amount">Valor</label>
        <MoneyInput id="tx-amount" value={amount} onChange={setAmount} autoFocus />
      </div>

      <div className="field">
        <label className="label" htmlFor="tx-desc">Descrição</label>
        <input id="tx-desc" className="input" value={description}
          onChange={(e) => setDescription(e.target.value)} placeholder="Ex.: Salário, Mercado, Uber…" />
      </div>

      <div className="field">
        <label className="label" htmlFor="tx-date">Data</label>
        <input id="tx-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {type === 'transfer' ? (
        <>
          <div className="field">
            <label className="label">De (origem)</label>
            <select className="select" value={source} onChange={(e) => setSource(e.target.value)}>
              {accounts.map((a) => <option key={a.id} value={`acc:${a.id}`}>{a.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Para (destino)</label>
            <select className="select" value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </>
      ) : (
        <>
          <div className="field">
            <label className="label">{type === 'income' ? 'Receber em' : 'Pagar com'}</label>
            <select className="select" value={source} onChange={(e) => setSource(e.target.value)}>
              <optgroup label="Contas">
                {accounts.map((a) => <option key={a.id} value={`acc:${a.id}`}>{a.name}</option>)}
              </optgroup>
              {type === 'expense' && cards.length > 0 && (
                <optgroup label="Cartões">
                  {cards.map((c) => <option key={c.id} value={`card:${c.id}`}>{c.name} (cartão)</option>)}
                </optgroup>
              )}
            </select>
          </div>
          <div className="field">
            <label className="label">Categoria</label>
            <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Sem categoria</option>
              {catOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </>
      )}

      {type === 'expense' && !editing && (
        <div className="field">
          <label className="label" htmlFor="tx-inst">Parcelar em (x vezes)</label>
          <input id="tx-inst" type="number" min={1} max={48} className="input"
            value={installments} onChange={(e) => setInstallments(Math.max(1, parseInt(e.target.value || '1', 10)))} />
        </div>
      )}

      {tags.length > 0 && type !== 'transfer' && (
        <div className="field">
          <label className="label">Tags</label>
          <div className="chips">
            {tags.map((t) => (
              <button key={t.id} type="button"
                className={`chip ${selectedTags.includes(t.id) ? 'on' : ''}`}
                style={selectedTags.includes(t.id) ? { borderColor: argbToHex(t.color), color: argbToHex(t.color) } : undefined}
                onClick={() => toggleTag(t.id)}>
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {type !== 'transfer' && (
        <label className="switch-row">
          <input type="checkbox" checked={cleared} onChange={(e) => setCleared(e.target.checked)} />
          <span>{statusLabel}</span>
        </label>
      )}

      {error && <p className="field-error" style={{ marginBottom: 'var(--s-md)' }}>{error}</p>}

      <div className="between" style={{ marginTop: 'var(--s-md)' }}>
        {editing ? (
          <button type="button" className="link-danger" onClick={confirmDel ? handleDelete : () => setConfirmDel(true)}>
            {confirmDel ? 'Confirmar exclusão' : 'Excluir'}
          </button>
        ) : <span />}
        <div className="row gap-md">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button loading={saving} onClick={handleSave}>{editing ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </div>
    </Modal>
  )
}
