import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import {
  getAccounts, getCards, getCategories, getTags, getTransactions, getTransactionTags,
  type TransactionTag,
} from '../lib/db'
import type {
  Account, AccountWithBalance, Card, Category, Tag, Transaction,
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
  totalBalance: number
  reload: () => Promise<void>
  accountById: (id: string | null) => Account | undefined
  categoryById: (id: string | null) => Category | undefined
  cardById: (id: string | null) => Card | undefined
  tagsForTx: (txId: string) => string[]
  invoiceForCard: (cardId: string, ref?: Date) => number
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

  const reload = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [a, c, cat, t, tx, tt] = await Promise.all([
        getAccounts(), getCards(), getCategories(), getTags(), getTransactions(), getTransactionTags(),
      ])
      setAccounts(a); setCards(c); setCategories(cat); setTags(t); setTransactions(tx); setTxTags(tt)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) reload()
    else {
      setAccounts([]); setCards([]); setCategories([]); setTags([]); setTransactions([]); setTxTags([])
      setLoading(false)
    }
  }, [user, reload])

  const accountsWithBalance = useMemo<AccountWithBalance[]>(() => {
    return accounts.map((acc) => {
      let balance = acc.initial_balance
      for (const tx of transactions) {
        if (tx.status !== 'cleared') continue
        if (tx.type === 'income' && tx.account_id === acc.id) balance += tx.amount
        else if (tx.type === 'expense' && tx.account_id === acc.id) balance -= tx.amount
        else if (tx.type === 'transfer') {
          if (tx.account_id === acc.id) balance -= tx.amount
          if (tx.to_account_id === acc.id) balance += tx.amount
        }
      }
      return { ...acc, balance }
    })
  }, [accounts, transactions])

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
    totalBalance,
    reload,
    accountById: (id) => accounts.find((a) => a.id === id),
    categoryById: (id) => categories.find((c) => c.id === id),
    cardById: (id) => cards.find((c) => c.id === id),
    tagsForTx: (txId) => txTags.filter((tt) => tt.transaction_id === txId).map((tt) => tt.tag_id),
    invoiceForCard: (cardId, ref = new Date()) =>
      transactions
        .filter(
          (tx) =>
            tx.card_id === cardId &&
            tx.type === 'expense' &&
            new Date(tx.date).getMonth() === ref.getMonth() &&
            new Date(tx.date).getFullYear() === ref.getFullYear(),
        )
        .reduce((s, tx) => s + tx.amount, 0),
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useData fora do DataProvider')
  return v
}
