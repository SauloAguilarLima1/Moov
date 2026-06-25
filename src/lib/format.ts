// Dinheiro é sempre armazenado em CENTAVOS (inteiro). Formatação só aqui.

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
})

/** centavos -> "R$ 1.234,56" */
export function formatBRL(cents: number): string {
  return brl.format((cents ?? 0) / 100)
}

/** centavos -> "+R$ 1.234,56" / "-R$ 1.234,56" */
export function formatBRLSigned(cents: number): string {
  const s = cents > 0 ? '+' : cents < 0 ? '-' : ''
  return `${s}${brl.format(Math.abs(cents) / 100)}`
}

/** "1.234,56" (sem símbolo) a partir de centavos — para inputs */
export function centsToDisplay(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Texto digitado (qualquer) -> centavos. Considera só os dígitos. */
export function parseToCents(text: string): number {
  const digits = (text || '').replace(/\D/g, '')
  return digits ? parseInt(digits, 10) : 0
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function monthName(monthIndex0: number): string {
  return monthNames[((monthIndex0 % 12) + 12) % 12]
}

/** "5 de junho" */
export function formatDayMonth(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} de ${monthName(d.getMonth()).toLowerCase()}`
}

/** "05/06/2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}

/** "yyyy-mm-dd" no fuso local (para <input type=date>) */
export function toDateInput(iso: string): string {
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}
