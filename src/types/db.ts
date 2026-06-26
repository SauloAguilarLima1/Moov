export type AccountType = 'checking' | 'savings' | 'wallet' | 'investment'
export type TxType = 'income' | 'expense' | 'transfer'
export type TxStatus = 'cleared' | 'pending'
export type CategoryType = 'income' | 'expense'

export interface Profile {
  id: string
  name: string | null
  avatar_url: string | null
}

export interface Account {
  id: string
  user_id: string
  name: string
  bank: string | null
  type: AccountType
  initial_balance: number // centavos
  color: number // ARGB
  icon: string | null
  created_at: string
}

export interface Card {
  id: string
  user_id: string
  name: string
  credit_limit: number // centavos
  closing_day: number
  due_day: number
  color: number
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: CategoryType
  color: number
  icon: string | null
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: number
}

export interface Transaction {
  id: string
  user_id: string
  description: string
  amount: number // centavos (sempre positivo)
  type: TxType
  date: string // ISO
  account_id: string | null
  to_account_id: string | null
  card_id: string | null
  category_id: string | null
  status: TxStatus
  installment_no: number | null
  installment_of: number | null
  created_at: string
}

/** Pagamento de fatura de cartão (registro de caixa do pagamento). */
export interface CardInvoicePayment {
  id: string
  user_id: string
  card_id: string
  period_key: string // 'YYYY-MM' do fechamento
  paid_date: string // ISO (data do pagamento)
  account_id: string | null // conta de onde saiu o dinheiro
  amount: number // centavos, snapshot no momento do pagamento
  created_at: string
}

/** Conta com saldo calculado (inicial + lançamentos cleared). */
export interface AccountWithBalance extends Account {
  balance: number
}
