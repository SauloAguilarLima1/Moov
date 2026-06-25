// Cores são guardadas como inteiro ARGB (compat. com o schema). Aqui convertemos
// para hex CSS (ignorando o alfa) e oferecemos uma paleta para novos itens.

export function argbToHex(argb: number): string {
  const rgb = (argb & 0xffffff).toString(16).padStart(6, '0')
  return `#${rgb}`
}

export function hexToArgb(hex: string): number {
  const clean = hex.replace('#', '')
  return 0xff000000 + parseInt(clean, 16)
}

// Paleta premium para escolher cor de conta/cartão/categoria/tag.
export const PALETTE: string[] = [
  '#1e5eff', '#4d7cff', '#123d91', '#20c997', '#1fb97a',
  '#f4a62a', '#e5484d', '#7c5cfc', '#ff6b6b', '#0ea5e9',
  '#6e7582', '#ec4899',
]

// Ícones (emoji) por nome — usado em contas/categorias.
const ICONS: Record<string, string> = {
  // categorias padrão
  salary: '💼', income: '💰', food: '🍔', transport: '🚗', home: '🏠',
  fun: '🎉', health: '🩺', other: '🏷️',
  // contas
  wallet: '👛', bank: '🏦', savings: '🐷', investment: '📈', cash: '💵',
  // genéricos
  card: '💳', star: '⭐', tag: '🏷️', transfer: '🔁',
}

export function iconFor(name?: string | null, fallback = '🏷️'): string {
  if (!name) return fallback
  return ICONS[name] ?? fallback
}

export const ACCOUNT_ICONS = ['wallet', 'bank', 'savings', 'investment', 'cash', 'card']
export const CATEGORY_ICONS = ['food', 'transport', 'home', 'fun', 'health', 'salary', 'income', 'star', 'other']
