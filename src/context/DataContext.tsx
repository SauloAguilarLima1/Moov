import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import {
  getAccounts, getCards, getCategories, getTags, getTransactions, getTransactionTags,
  getCardInvoicePayments,
  type TransactionTag,
} from '../lib/db'
import { openInvoiceAmount } from '../lib/cards'
import type {
  Account, AccountWithBalance, Card, Category, Tag, Transaction, CardInvoicePayment,
} from '../types/db'

interface DataValue {
  loading: boolean
  accounts: Account[]
  accountsWithBalance: AccountWithBalance[]
  cards: Card[]
  categories: Category[]
  tags: Tag[]
  transactions: Transaction[]
  txTags: TransactionTag[]
  cardInvoicePayments: CardInvoicePayment[]
  totalBalance: number
  reload: () => Promise<void>
  accountById: (id: string | null) => Account | undefined
  categoryById: (id: string | null) => Category | undefined
  cardById: (id: string | null) => Card | undefined
  tagsForTx: (txId: string) => string[]
  invoiceForCard: (cardId: string, ref?: Date) => number
  invoicePaymentFor: (cardId: string, periodKey: string) => CardInvoicePayment | undefined
}

const Ctx = createContext<DataValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txTags, setTxTags] = useState<TransactionTag[]>([])
  const [cardInvoicePayments, setCardInvoicePayments] = useState<CardInvoicePayment[]>([])

  const reload = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [a, c, cat, t, tx, tt, cip] = await Promise.all([
        getAccounts(), getCards(), getCategories(), getTags(), getTransactions(), getTransactionTags(),
        getCardInvoicePayments(),
      ])
      setAccounts(a); setCards(c); setCategories(cat); setTags(t); setTransactions(tx); setTxTags(tt)
      setCardInvoicePayments(cip)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) reload()
    else {
      setAccounts([]); setCards([]); setCategories([]); setTags([]); setTransactions([]); setTxTags([])
      setCardInvoicePayments([])
      setLoading(false)
    }
  }, [user, reload])

  const accountsWithBalance = useMemo<AccountWithBalance[]>(() => {
    return accounts.map((acc) => {
      let balance = acc.initial_balance
      for (const tx of transactions) {
        if (tx.status !== 'cleared') continue
        // Compras no cartão (card_id) não mexem no saldo: regime de caixa, o
        // dinheiro só sai quando a fatura é paga (abaixo).
        if (tx.type === 'income' && tx.account_id === acc.id) balance += tx.amount
        else if (tx.type === 'expense' && tx.account_id === acc.id) balance -= tx.amount
        else if (tx.type === 'transfer') {
          if (tx.account_id === acc.id) balance -= tx.amount
          if (tx.to_account_id === acc.id) balance += tx.amount
        }
      }
      // Pagamento de fatura = única saída de caixa do cartão.
      for (const p of cardInvoicePayments) {
        if (p.account_id === acc.id) balance -= p.amount
      }
      return { ...acc, balance }
    })
  }, [accounts, transactions, cardInvoicePayments])

  const totalBalance = useMemo(
    () => accountsWithBalance.reduce((s, a) => s + a.balance, 0),
    [accountsWithBalance],
  )

  const value: DataValue = {
    loading,
    accounts,
    accountsWithBalance,
    cards,
    categories,
    tags,
    transactions,
    txTags,
    cardInvoicePayments,
    totalBalance,
    reload,
    accountById: (id) => accounts.find((a) => a.id === id),
    categoryById: (id) => categories.find((c) => c.id === id),
    cardById: (id) => cards.find((c) => c.id === id),
    tagsForTx: (txId) => txTags.filter((tt) => tt.transaction_id === txId).map((tt) => tt.tag_id),
    invoiceForCard: (cardId, ref = new Date()) => {
      const card = cards.find((c) => c.id === cardId)
      return card ? openInvoiceAmount(transactions, card, ref) : 0
    },
    invoicePaymentFor: (cardId, periodKey) =>
      cardInvoicePayments.find((p) => p.card_id === cardId && p.period_key === periodKey),
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useData fora do DataProvider')
  return v
}
