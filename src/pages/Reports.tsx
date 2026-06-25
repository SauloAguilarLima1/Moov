import { useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useData } from '../context/DataContext'
import { MonthSwitcher } from '../components/MonthSwitcher'
import { formatBRL } from '../lib/format'
import { argbToHex } from '../lib/colors'
import type { Transaction, Tag as TagT, Category } from '../types/db'
import type { TransactionTag } from '../lib/db'

type Tab = 'categorias' | 'balanco' | 'tags'

interface Slice { name: string; value: number; color: string }

export function Reports() {
  const { transactions, txTags, categories, tags, categoryById } = useData()
  const [month, setMonth] = useState(new Date())
  const [tab, setTab] = useState<Tab>('categorias')

  const monthTx = useMemo(
    () => transactions.filter((t) => {
      const d = new Date(t.date)
      return t.status === 'cleared' && d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear()
    }),
    [transactions, month],
  )

  function byCategory(type: 'income' | 'expense'): Slice[] {
    const map = new Map<string, number>()
    for (const t of monthTx) {
      if (t.type !== type) continue
      const key = t.category_id ?? 'none'
      map.set(key, (map.get(key) ?? 0) + t.amount)
    }
    return [...map.entries()]
      .map(([id, value]) => {
        const c = id === 'none' ? null : categoryById(id)
        return { name: c?.name ?? 'Sem categoria', value, color: c ? argbToHex(c.color) : '#6e7582' }
      })
      .sort((a, b) => b.value - a.value)
  }

  const expenses = byCategory('expense')
  const incomes = byCategory('income')
  const entradas = incomes.reduce((s, x) => s + x.value, 0)
  const saidas = expenses.reduce((s, x) => s + x.value, 0)

  return (
    <div className="page">
      <header className="screen-head"><h1 className="t-h1">Relatórios</h1></header>
      <MonthSwitcher value={month} onChange={setMonth} />

      <div className="tabs">
        <button className={tab === 'categorias' ? 'active' : ''} onClick={() => setTab('categorias')}>Categorias</button>
        <button className={tab === 'balanco' ? 'active' : ''} onClick={() => setTab('balanco')}>Balanço</button>
        <button className={tab === 'tags' ? 'active' : ''} onClick={() => setTab('tags')}>Tags</button>
      </div>

      {tab === 'categorias' && (
        <div className="stack">
          <DonutCard title="Despesas" data={expenses} total={saidas} />
          <DonutCard title="Receitas" data={incomes} total={entradas} />
        </div>
      )}

      {tab === 'balanco' && (
        <div className="card">
          <h2 className="t-section" style={{ marginBottom: 'var(--s-lg)' }}>Entradas x Saídas</h2>
          {entradas === 0 && saidas === 0 ? (
            <div className="list-empty">Não há dados disponíveis no período</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={[{ name: 'Entradas', value: entradas / 100 }, { name: 'Saídas', value: saidas / 100 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(v) => `R$${v}`} tickLine={false} axisLine={false} width={70} />
                  <Tooltip formatter={(v) => formatBRL(Math.round((v as number) * 100))} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    <Cell fill="#1fb97a" />
                    <Cell fill="#e5484d" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <hr className="divider" style={{ margin: 'var(--s-lg) 0' }} />
              <div className="balance-row"><span className="muted">Entradas</span><span className="pos tnum">{formatBRL(entradas)}</span></div>
              <div className="balance-row"><span className="muted">Saídas</span><span className="neg tnum">{formatBRL(saidas)}</span></div>
              <div className="balance-row"><strong>Resultado</strong><strong className="tnum">{formatBRL(entradas - saidas)}</strong></div>
            </>
          )}
        </div>
      )}

      {tab === 'tags' && <TagsReport monthTxIds={new Set(monthTx.map((t) => t.id))} monthTx={monthTx} txTags={txTags} tags={tags} categories={categories} />}
    </div>
  )
}

function DonutCard({ title, data, total }: { title: string; data: Slice[]; total: number }) {
  return (
    <div className="card">
      <h2 className="t-section">{title}</h2>
      {data.length === 0 ? (
        <div className="list-empty">Não há dados disponíveis no período</div>
      ) : (
        <>
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="none">
                  {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatBRL(v as number)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <span className="t-caption">Total</span>
              <strong className="tnum">{formatBRL(total)}</strong>
            </div>
          </div>
          <div className="legend">
            {data.map((d) => (
              <div key={d.name} className="legend-row">
                <span className="legend-dot" style={{ background: d.color }} />
                <span className="legend-name">{d.name}</span>
                <span className="legend-pct muted tnum">{total ? ((d.value / total) * 100).toFixed(1) : '0'}%</span>
                <span className="legend-val tnum">{formatBRL(d.value)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function TagsReport({ monthTx, txTags, tags }: {
  monthTxIds: Set<string>
  monthTx: Transaction[]
  txTags: TransactionTag[]
  tags: TagT[]
  categories: Category[]
}) {
  const txById = new Map(monthTx.map((t) => [t.id, t]))
  const expense = new Map<string, number>()
  const income = new Map<string, number>()
  for (const tt of txTags) {
    const t = txById.get(tt.transaction_id)
    if (!t) continue
    const bucket = t.type === 'income' ? income : t.type === 'expense' ? expense : null
    if (!bucket) continue
    bucket.set(tt.tag_id, (bucket.get(tt.tag_id) ?? 0) + t.amount)
  }
  const tagName = (id: string) => tags.find((x) => x.id === id)?.name ?? 'Tag'
  const tagColor = (id: string) => { const x = tags.find((t) => t.id === id); return x ? argbToHex(x.color) : '#6e7582' }

  const toRows = (m: Map<string, number>) =>
    [...m.entries()].map(([id, value]) => ({ name: tagName(id), value, color: tagColor(id) })).sort((a, b) => b.value - a.value)

  const exp = toRows(expense)
  const inc = toRows(income)

  return (
    <div className="stack">
      <RankCard title="Despesas por tag" rows={exp} />
      <RankCard title="Receitas por tag" rows={inc} />
    </div>
  )
}

function RankCard({ title, rows }: { title: string; rows: { name: string; value: number; color: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <div className="card">
      <h2 className="t-section">{title}</h2>
      {rows.length === 0 ? (
        <div className="list-empty">Não há dados disponíveis no período</div>
      ) : (
        <div className="rank">
          {rows.map((r) => (
            <div key={r.name} className="rank-row">
              <div className="between">
                <span className="lr-title">{r.name}</span>
                <span className="tnum">{formatBRL(r.value)}</span>
              </div>
              <div className="rank-bar"><span style={{ width: `${(r.value / max) * 100}%`, background: r.color }} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
