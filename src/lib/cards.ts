// Lógica do ciclo de fatura do cartão de crédito (regime de caixa).
// Regra (confirmada pelo Saulo): a fatura fecha no `closing_day` e é paga no
// `due_day` do mês seguinte ao fechamento. A fatura paga no mês M cobre as
// compras feitas em (fechamento de M-2, fechamento de M-1].
// Ex.: fatura paga em 07/jul cobre 26/mai→25/jun; paga em 07/ago cobre 26/jun→25/jul.
import type { Card, Transaction } from '../types/db'

export interface InvoiceCycle {
  windowStart: Date // exclusivo: compras > windowStart
  windowEnd: Date // inclusivo: compras <= windowEnd (= data de fechamento)
  payDate: Date // vencimento
  periodKey: string // 'YYYY-MM' do mês de fechamento — identifica a fatura
}

function lastDay(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate()
}
/** Fim do dia do `day` no mês y/m, com clamp ao último dia (ex.: fechamento 31 em fev). */
function endOfDay(y: number, m: number, day: number): Date {
  return new Date(y, m, Math.min(day, lastDay(y, m)), 23, 59, 59, 999)
}

/** Ciclo cuja fatura é PAGA no mês de `payMonth` (qualquer Date dentro do mês). */
export function invoiceCycleForPayMonth(card: Card, payMonth: Date): InvoiceCycle {
  const y = payMonth.getFullYear()
  const m = payMonth.getMonth()
  const payDay = Math.min(card.due_day, lastDay(y, m))
  const payDate = new Date(y, m, payDay, 12, 0, 0, 0)
  const windowEnd = endOfDay(y, m - 1, card.closing_day) // fechamento (mês anterior ao vencimento)
  const windowStart = endOfDay(y, m - 2, card.closing_day) // fechamento anterior
  const periodKey = `${windowEnd.getFullYear()}-${String(windowEnd.getMonth() + 1).padStart(2, '0')}`
  return { windowStart, windowEnd, payDate, periodKey }
}

/** Soma das compras (despesas no cartão) dentro da janela do ciclo. */
export function invoiceAmount(transactions: Transaction[], card: Card, cycle: InvoiceCycle): number {
  let sum = 0
  for (const t of transactions) {
    if (t.card_id !== card.id || t.type !== 'expense') continue
    const d = new Date(t.date).getTime()
    if (d > cycle.windowStart.getTime() && d <= cycle.windowEnd.getTime()) sum += t.amount
  }
  return sum
}

/** Fatura ABERTA: compras do ciclo corrente (após o último fechamento já ocorrido). */
export function openInvoiceAmount(transactions: Transaction[], card: Card, ref: Date = new Date()): number {
  const y = ref.getFullYear()
  const m = ref.getMonth()
  const thisClosing = endOfDay(y, m, card.closing_day)
  let windowStart: Date
  let windowEnd: Date
  if (ref.getTime() > thisClosing.getTime()) {
    windowStart = thisClosing
    windowEnd = endOfDay(y, m + 1, card.closing_day)
  } else {
    windowStart = endOfDay(y, m - 1, card.closing_day)
    windowEnd = thisClosing
  }
  let sum = 0
  for (const t of transactions) {
    if (t.card_id !== card.id || t.type !== 'expense') continue
    const d = new Date(t.date).getTime()
    if (d > windowStart.getTime() && d <= windowEnd.getTime()) sum += t.amount
  }
  return sum
}

/** Mês em que a fatura desta compra será paga — usado p/ rotular a compra no Fluxo. */
export function payMonthForPurchase(card: Card, iso: string): Date {
  const d = new Date(iso)
  const closingThis = endOfDay(d.getFullYear(), d.getMonth(), card.closing_day)
  const closeOffset = d.getTime() <= closingThis.getTime() ? 0 : 1
  return new Date(d.getFullYear(), d.getMonth() + closeOffset + 1, 1)
}
