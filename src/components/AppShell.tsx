import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { FAB } from './ui/FAB'
import { TransactionForm } from './forms/TransactionForm'
import type { TxType } from '../types/db'

const NAV = [
  { to: '/app', label: 'Início', end: true, icon: IconHome },
  { to: '/app/cashflow', label: 'Fluxo', end: false, icon: IconFlow },
  { to: '/app/reports', label: 'Relatórios', end: false, icon: IconChart },
  { to: '/app/profile', label: 'Perfil', end: false, icon: IconUser },
]

export function AppShell() {
  const [tx, setTx] = useState<{ open: boolean; type: TxType }>({ open: false, type: 'expense' })

  return (
    <div className="shell">
      {/* Sidebar (desktop) */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">M</span>
          <span className="brand-name">Moov</span>
        </div>
        <nav className="side-nav">
          {NAV.map((n) => {
            const Icon = n.icon
            return (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
                <Icon /> <span>{n.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="content">
        <div className="content-inner">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="bottom-nav">
        {NAV.map((n) => {
          const Icon = n.icon
          return (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `bn-link ${isActive ? 'active' : ''}`}>
              <Icon /> <span>{n.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <FAB onPick={(type) => setTx({ open: true, type })} />
      <TransactionForm
        open={tx.open}
        type={tx.type}
        onClose={() => setTx((s) => ({ ...s, open: false }))}
        onSaved={() => {}}
      />
    </div>
  )
}

/* ---- ícones (stroke) ---- */
function IconHome() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
}
function IconFlow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h13l-3-3" /><path d="M17 17H4l3 3" /></svg>
}
function IconChart() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 20V10" /><path d="M12 20V4" /><path d="M18 20v-7" /></svg>
}
function IconUser() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
}
