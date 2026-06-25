import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { MonthSwitcher } from '../components/MonthSwitcher'
import { TransactionForm } from '../components/forms/TransactionForm'
import { formatBRL, formatBRLSigned, formatDayMonth } from '../lib/format'
import { argbToHex, iconFor } from '../lib/colors'
import type { Transaction } from '../types/db'

export function Cashflow() {
  const { transactions, categoryById, accountById, cardById, totalBalance, loading } = useData()
  const [month, setMonth] = useState(new Date())
  const [editing, setEditing] = useState<Transaction | null>(null)

  const inMonth = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear()
    })
  }, [transactions, month])

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const t of inMonth) {
      const key = t.date.slice(0, 10)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [inMonth])

  const entradas = inMonth.filter((t) => t.type === 'income' && t.status === 'cleared').reduce((s, t) => s + t.amount, 0)
  const saidas = inMonth.filter((t) => t.type === 'expense' && t.status === 'cleared').reduce((s, t) => s + t.amount, 0)

  function sourceName(t: Transaction) {
    if (t.card_id) return cardById(t.card_id)?.name ?? 'Cartão'
    return accountById(t.account_id)?.name ?? 'Conta'
  }

  return (
    <div className="page page-cashflow">
      <header className="screen-head">
        <h1 className="t-h1">Fluxo de caixa</h1>
      </header>
      <MonthSwitcher value={month} onChange={setMonth} />

      <div className="cashflow-list">
        {loading ? (
          <div className="list-empty">Carregando…</div>
        ) : groups.length === 0 ? (
          <div className="list-empty">Nenhum lançamento em {month.toLocaleDateString('pt-BR', { month: 'long' })}.<br />Toque no + para adicionar.</div>
        ) : (
          groups.map(([day, items]) => (
            <div key={day} className="day-group">
              <p className="day-label">{formatDayMonth(day + 'T12:00:00')}</p>
              {items.map((t) => {
                const cat = categoryById(t.category_id)
                const isTransfer = t.type === 'transfer'
                const signed = t.type === 'income' ? t.amount : t.type === 'expense' ? -t.amount : 0
                return (
                  <button key={t.id} className="tx-row" onClick={() => setEditing(t)}>
                    <span className="icon-chip" style={cat ? { background: argbToHex(cat.color) + '22', color: argbToHex(cat.color) } : undefined}>
                      {isTransfer ? '🔁' : iconFor(cat?.icon, t.type === 'income' ? '💰' : '🏷️')}
                    </span>
                    <div className="lr-main">
                      <span className="lr-title">{t.description}</span>
                      <span className="lr-sub">{cat?.name ? `${cat.name} · ` : ''}{sourceName(t)}</span>
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
              })}
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
    </div>
  )
}
