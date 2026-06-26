// Período de visualização (Fluxo / Relatórios). Pode ser um mês ou um intervalo
// composto (bimestre, trimestre, …) ou personalizado. Sempre alinhado a meses
// inteiros: start = 00:00 do 1º dia; end = 23:59:59.999 do último dia.
import { monthName, monthShort } from './format'

export type PeriodKind =
  | 'month' | 'bimester' | 'trimester' | 'quadrimester' | 'semester' | 'year' | 'custom'

export interface Period {
  kind: PeriodKind
  start: Date
  end: Date
}

const SPAN: Record<Exclude<PeriodKind, 'custom'>, number> = {
  month: 1, bimester: 2, trimester: 3, quadrimester: 4, semester: 6, year: 12,
}

function firstOfMonth(y: number, m: number): Date {
  return new Date(y, m, 1, 0, 0, 0, 0)
}
function lastOfMonth(y: number, m: number): Date {
  return new Date(y, m + 1, 0, 23, 59, 59, 999)
}

export function monthPeriod(d: Date): Period {
  return { kind: 'month', start: firstOfMonth(d.getFullYear(), d.getMonth()), end: lastOfMonth(d.getFullYear(), d.getMonth()) }
}

/** Período preset alinhado a blocos naturais do calendário (ex.: trimestre = jan–mar). */
export function presetPeriod(kind: PeriodKind, anchor: Date): Period {
  if (kind === 'month' || kind === 'custom') return monthPeriod(anchor)
  const span = SPAN[kind]
  const y = anchor.getFullYear()
  const blockStart = Math.floor(anchor.getMonth() / span) * span
  return { kind, start: firstOfMonth(y, blockStart), end: lastOfMonth(y, blockStart + span - 1) }
}

/** Intervalo personalizado entre dois meses (inclusive); reordena se vier invertido. */
export function customPeriod(sy: number, sm: number, ey: number, em: number): Period {
  let a = firstOfMonth(sy, sm)
  let b = lastOfMonth(ey, em)
  if (a.getTime() > b.getTime()) {
    a = firstOfMonth(ey, em)
    b = lastOfMonth(sy, sm)
  }
  return { kind: 'custom', start: a, end: b }
}

export function periodSpanMonths(p: Period): number {
  return (p.end.getFullYear() - p.start.getFullYear()) * 12 + (p.end.getMonth() - p.start.getMonth()) + 1
}

/** Desloca o período pelo seu próprio tamanho (mês ±1, trimestre ±3, custom ±span…). */
export function shiftPeriod(p: Period, dir: 1 | -1): Period {
  const span = periodSpanMonths(p)
  const start = firstOfMonth(p.start.getFullYear(), p.start.getMonth() + dir * span)
  const end = lastOfMonth(start.getFullYear(), start.getMonth() + span - 1)
  return { kind: p.kind, start, end }
}

export function inPeriod(iso: string, p: Period): boolean {
  const t = new Date(iso).getTime()
  return t >= p.start.getTime() && t <= p.end.getTime()
}

/** Lista de meses (ano/mês) cobertos pelo período — usado p/ gerar faturas. */
export function monthsInPeriod(p: Period): { year: number; month: number }[] {
  const out: { year: number; month: number }[] = []
  let y = p.start.getFullYear()
  let m = p.start.getMonth()
  const ey = p.end.getFullYear()
  const em = p.end.getMonth()
  while (y < ey || (y === ey && m <= em)) {
    out.push({ year: y, month: m })
    m++
    if (m > 11) { m = 0; y++ }
  }
  return out
}

export function labelFor(p: Period): string {
  const span = periodSpanMonths(p)
  const sY = p.start.getFullYear()
  const eY = p.end.getFullYear()
  if (span === 1) {
    return `${monthName(p.start.getMonth())}${sY !== new Date().getFullYear() ? ` ${sY}` : ''}`
  }
  if (p.kind === 'year') return `${sY}`
  const sM = monthShort(p.start.getMonth())
  const eM = monthShort(p.end.getMonth())
  if (sY === eY) return `${sM}–${eM} ${sY}`
  return `${sM}/${String(sY).slice(2)}–${eM}/${String(eY).slice(2)}`
}
