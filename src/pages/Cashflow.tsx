import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { PeriodSwitcher } from '../components/PeriodSwitcher'
import { TransactionForm } from '../components/forms/TransactionForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { createCardInvoicePayment, deleteCardInvoicePayment } from '../lib/db'
import { monthPeriod, inPeriod, monthsInPeriod, labelFor, type Period } from '../lib/period'
import { invoiceCycleForPayMonth, invoiceAmount, payMonthForPurchase, type InvoiceCycle } from '../lib/cards'
import { formatBRL, formatBRLSigned, formatDayMonth, monthShort } from '../lib/format'
import { argbToHex, iconFor } from '../lib/colors'
import type { Transaction, Card, Account, Category } from '../types/db'

interface InvoiceRow {
  card: Card
  cycle: InvoiceCycle
  amount: number
  paymentId?: string
  paidAccountId?: string | null
}
type ListItem = { kind: 'tx'; tx: Transaction } | { kind: 'inv'; inv: InvoiceRow }

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function cycleRangeLabel(cycle: InvoiceCycle): string {
  const start = new Date(cycle.windowStart.getTime() + 1) // dia seguinte ao fechamento anterior
  const end = cycle.windowEnd
  return `${start.getDate()}/${monthShort(start.getMonth())} a ${end.getDate()}/${monthShort(end.getMonth())}`
}

export function Cashflow() {
  const {
    transactions, cards, accounts, cardInvoicePayments,
    categoryById, accountById, cardById, totalBalance, loading, reload,
  } = useData()
  const [period, setPeriod] = useState<Period>(() => monthPeriod(new Date()))
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [pay, setPay] = useState<InvoiceRow | null>(null)
  const [undo, setUndo] = useState<InvoiceRow | null>(null)

  const realTx = useMemo(
    () => transactions.filter((t) => inPeriod(t.date, period)),
    [transactions, period],
  )

  // Faturas (linhas virtuais) a serem PAGAS nos meses do período.
  const invoiceRows = useMemo<InvoiceRow[]>(() => {
    const rows: InvoiceRow[] = []
    for (const { year, month } of monthsInPeriod(period)) {
      const payMonth = new Date(year, month, 1)
      for (const card of cards) {
        const cycle = invoiceCycleForPayMonth(card, payMonth)
        const computed = invoiceAmount(transactions, card, cycle)
        const payment = cardInvoicePayments.find((p) => p.card_id === card.id && p.period_key === cycle.periodKey)
        if (computed <= 0 && !payment) continue
        rows.push({
          card, cycle,
          amount: payment ? payment.amount : computed,
          paymentId: payment?.id,
          paidAccountId: payment?.account_id,
        })
      }
    }
    return rows
  }, [period, cards, transactions, cardInvoicePayments])

  const groups = useMemo(() => {
    const map = new Map<string, ListItem[]>()
    const push = (key: string, item: ListItem) => {
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    for (const t of realTx) push(t.date.slice(0, 10), { kind: 'tx', tx: t })
    for (const inv of invoiceRows) push(dateKey(inv.cycle.payDate), { kind: 'inv', inv })
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [realTx, invoiceRows])

  // Regime de caixa: entradas + saídas reais. Compra no cartão NÃO é saída
  // (vira detalhe da fatura); só a fatura PAGA conta como saída.
  const entradas = realTx.filter((t) => t.type === 'income' && t.status === 'cleared').reduce((s, t) => s + t.amount, 0)
  const saidasContas = realTx.filter((t) => t.type === 'expense' && t.status === 'cleared' && !t.card_id).reduce((s, t) => s + t.amount, 0)
  const saidasFaturas = invoiceRows.filter((r) => r.paymentId).reduce((s, r) => s + r.amount, 0)
  const saidas = saidasContas + saidasFaturas

  function txSub(t: Transaction): string {
    const cat = categoryById(t.category_id)
    const base = `${cat?.name ? `${cat.name} · ` : ''}${sourceName(t)}`
    if (t.card_id && t.type === 'expense') {
      const card = cardById(t.card_id)
      if (card) {
        const pm = payMonthForPurchase(card, t.date)
        return `${base} · fatura ${monthShort(pm.getMonth())}/${String(pm.getFullYear()).slice(2)}`
      }
    }
    return base
  }
  function sourceName(t: Transaction) {
    if (t.card_id) return cardById(t.card_id)?.name ?? 'Cartão'
    return accountById(t.account_id)?.name ?? 'Conta'
  }

  return (
    <div className="page page-cashflow">
      <header className="screen-head">
        <h1 className="t-h1">Fluxo de caixa</h1>
      </header>
      <PeriodSwitcher value={period} onChange={setPeriod} />

      <div className="cashflow-list">
        {loading ? (
          <div className="list-empty">Carregando…</div>
        ) : groups.length === 0 ? (
          <div className="list-empty">Nenhum lançamento em {labelFor(period)}.<br />Toque no + para adicionar.</div>
        ) : (
          groups.map(([day, items]) => (
            <div key={day} className="day-group">
              <p className="day-label">{formatDayMonth(day + 'T12:00:00')}</p>
              {items.map((item) => item.kind === 'tx'
                ? <TxRow key={item.tx.id} t={item.tx} sub={txSub(item.tx)} onClick={() => setEditing(item.tx)} cat={categoryById(item.tx.category_id)} />
                : <InvoiceRowView key={`inv:${item.inv.card.id}:${item.inv.cycle.periodKey}`} inv={item.inv} accountName={accountById(item.inv.paidAccountId ?? null)?.name} onClick={() => (item.inv.paymentId ? setUndo(item.inv) : setPay(item.inv))} />)}
            </div>
          ))
        )}
      </div>

      {/* Rodapé resumo */}
      <footer className="cashflow-summary">
        <div><span className="cs-val pos tnum">{formatBRL(entradas)}</span><span className="cs-label">entradas</span></div>
        <div><span className="cs-val neg tnum">{formatBRL(saidas)}</span><span className="cs-label">saídas</span></div>
        <div><span className="cs-val accent tnum">{formatBRL(totalBalance)}</span><span className="cs-label">saldo</span></div>
      </footer>

      <TransactionForm
        open={!!editing}
        type={editing?.type ?? 'expense'}
        editing={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {}}
      />

      {pay && (
        <PayInvoiceDialog
          inv={pay}
          accounts={accounts}
          onClose={() => setPay(null)}
          onDone={async () => { await reload(); setPay(null) }}
        />
      )}

      <ConfirmDialog
        open={!!undo}
        title="Desfazer pagamento"
        message={`Marcar a fatura ${undo?.card.name ?? ''} como não paga? O valor volta para o saldo até você pagar de novo.`}
        confirmLabel="Desfazer"
        onConfirm={async () => {
          if (undo?.paymentId) await deleteCardInvoicePayment(undo.paymentId)
          await reload()
          setUndo(null)
        }}
        onCancel={() => setUndo(null)}
      />
    </div>
  )
}

function TxRow({ t, sub, cat, onClick }: { t: Transaction; sub: string; cat: Category | undefined; onClick: () => void }) {
  const isTransfer = t.type === 'transfer'
  const signed = t.type === 'income' ? t.amount : t.type === 'expense' ? -t.amount : 0
  return (
    <button className="tx-row" onClick={onClick}>
      <span className="icon-chip" style={cat ? { background: argbToHex(cat.color) + '22', color: argbToHex(cat.color) } : undefined}>
        {isTransfer ? '🔁' : iconFor(cat?.icon, t.type === 'income' ? '💰' : '🏷️')}
      </span>
      <div className="lr-main">
        <span className="lr-title">{t.description}</span>
        <span className="lr-sub">{sub}</span>
      </div>
      <div className="tx-amount">
        <span className={`tnum ${t.type === 'income' ? 'pos' : t.type === 'expense' ? 'neg' : 'muted'}`}>
          {isTransfer ? formatBRL(t.amount) : formatBRLSigned(signed)}
        </span>
        {t.status === 'pending' && (
          <span className="tx-status">{t.type === 'income' ? 'não recebido' : 'não pago'}</span>
        )}
      </div>
    </button>
  )
}

function InvoiceRowView({ inv, accountName, onClick }: { inv: InvoiceRow; accountName?: string; onClick: () => void }) {
  const paid = !!inv.paymentId
  return (
    <button className="tx-row tx-invoice" onClick={onClick}>
      <span className="icon-chip" style={{ background: argbToHex(inv.card.color) + '22', color: argbToHex(inv.card.color) }}>💳</span>
      <div className="lr-main">
        <span className="lr-title">Fatura {inv.card.name}</span>
        <span className="lr-sub">{cycleRangeLabel(inv.cycle)}{paid && accountName ? ` · pago em ${accountName}` : ''}</span>
      </div>
      <div className="tx-amount">
        <span className="tnum neg">{formatBRLSigned(-inv.amount)}</span>
        <span className={`tx-status ${paid ? 'pos' : ''}`}>{paid ? 'pago' : 'não pago'}</span>
      </div>
    </button>
  )
}

function PayInvoiceDialog({ inv, accounts, onClose, onDone }: {
  inv: InvoiceRow; accounts: Account[]; onClose: () => void; onDone: () => Promise<void>
}) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [saving, setSaving] = useState(false)
  async function confirm() {
    setSaving(true)
    try {
      await createCardInvoicePayment({
        card_id: inv.card.id,
        period_key: inv.cycle.periodKey,
        paid_date: inv.cycle.payDate.toISOString(),
        account_id: accountId || null,
        amount: inv.amount,
      })
      await onDone()
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal open onClose={onClose} title="Pagar fatura">
      <p className="t-body" style={{ marginBottom: 'var(--s-lg)' }}>
        Fatura <strong>{inv.card.name}</strong> — <strong className="neg">{formatBRL(inv.amount)}</strong><br />
        <span className="muted">{cycleRangeLabel(inv.cycle)}</span>
      </p>
      <div className="field">
        <label className="label">Pagar com a conta</label>
        <select className="select" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.length === 0 && <option value="">Nenhuma conta</option>}
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
      <div className="row gap-md" style={{ justifyContent: 'flex-end', marginTop: 'var(--s-md)' }}>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button loading={saving} disabled={!accountId} onClick={confirm}>Confirmar pagamento</Button>
      </div>
    </Modal>
  )
}
