import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { formatBRL, greeting } from '../lib/format'
import { argbToHex, iconFor } from '../lib/colors'
import { Button } from '../components/ui/Button'

export function Dashboard() {
  const { profile, user } = useAuth()
  const { accountsWithBalance, cards, transactions, totalBalance, loading, invoiceForCard } = useData()
  const navigate = useNavigate()
  const [hidden, setHidden] = useState(false)

  const name = profile?.name || user?.email?.split('@')[0] || ''

  const monthExpense = useMemo(() => {
    const now = new Date()
    return transactions
      .filter((t) => t.type === 'expense' && t.status === 'cleared'
        && new Date(t.date).getMonth() === now.getMonth()
        && new Date(t.date).getFullYear() === now.getFullYear())
      .reduce((s, t) => s + t.amount, 0)
  }, [transactions])

  const totalInvoices = useMemo(
    () => cards.reduce((s, c) => s + invoiceForCard(c.id), 0),
    [cards, invoiceForCard],
  )

  const money = (cents: number) => (hidden ? '••••••' : formatBRL(cents))

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <p className="t-caption">{greeting()},</p>
          <h1 className="t-h1">{name}</h1>
        </div>
        <div className="avatar" aria-hidden>{(name[0] || 'M').toUpperCase()}</div>
      </header>

      {/* HERO — Saldo geral */}
      <div className="hero-balance">
        <div className="between">
          <span className="hb-label">Saldo geral</span>
          <button className="eye" onClick={() => setHidden((h) => !h)} aria-label="Ocultar saldo">
            {hidden ? '🙈' : '👁️'}
          </button>
        </div>
        <p className="hb-value tnum">{loading ? '…' : money(totalBalance)}</p>
        <div className="hb-stats">
          <div>
            <span className="hb-stat-label">Gastos do mês</span>
            <span className="hb-stat-val tnum">{money(monthExpense)}</span>
          </div>
          <div>
            <span className="hb-stat-label">Total das faturas</span>
            <span className="hb-stat-val tnum">{money(totalInvoices)}</span>
          </div>
        </div>
      </div>

      {/* Minhas contas */}
      <section className="card stack-card">
        <div className="between">
          <h2 className="t-section">Minhas contas</h2>
        </div>
        <hr className="divider" />
        {accountsWithBalance.length === 0 ? (
          <div className="list-empty">
            Nenhuma conta ainda.<br />Crie sua primeira conta para começar.
          </div>
        ) : (
          accountsWithBalance.map((a) => (
            <div key={a.id} className="list-row">
              <span className="icon-chip" style={{ background: argbToHex(a.color) + '22', color: argbToHex(a.color) }}>
                {iconFor(a.icon, '🏦')}
              </span>
              <div className="lr-main">
                <span className="lr-title">{a.name}</span>
                <span className="lr-sub">{a.bank || 'Conta'}</span>
              </div>
              <span className="lr-value accent tnum">{money(a.balance)}</span>
            </div>
          ))
        )}
        <Button variant="outline" block onClick={() => navigate('/app/accounts')}>Gerenciar contas</Button>
      </section>

      {/* Meus cartões */}
      <section className="card stack-card">
        <h2 className="t-section">Meus cartões</h2>
        <hr className="divider" />
        {cards.length === 0 ? (
          <div className="list-empty">Nenhum cartão cadastrado.</div>
        ) : (
          cards.map((c) => {
            const invoice = invoiceForCard(c.id)
            const available = c.credit_limit - invoice
            return (
              <div key={c.id} className="card-item">
                <div className="list-row" style={{ padding: 0 }}>
                  <span className="card-chip" style={{ background: argbToHex(c.color) }}>💳</span>
                  <div className="lr-main">
                    <span className="lr-title">{c.name}</span>
                    <span className="lr-sub">Vence dia {c.due_day}</span>
                  </div>
                </div>
                <div className="card-stats">
                  <div><span className="t-caption">Disponível</span><span className="tnum">{money(available)}</span></div>
                  <div><span className="t-caption">Fatura atual</span><span className="tnum">{money(invoice)}</span></div>
                </div>
              </div>
            )
          })
        )}
        <Button variant="outline" block onClick={() => navigate('/app/cards')}>Gerenciar cartões</Button>
      </section>
    </div>
  )
}
