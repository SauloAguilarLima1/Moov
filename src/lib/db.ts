import { supabase } from './supabase'
import type {
  Account, Card, Category, Tag, Transaction, Profile,
} from '../types/db'

// Nota: nas inserções não passamos user_id — a coluna tem DEFAULT auth.uid()
// no Postgres e a RLS garante que cada usuário só acessa as próprias linhas.

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data as T
}

/* ----------------------------- profiles ----------------------------- */
export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle()
  if (error) throw new Error(error.message)
  return data
}
export async function updateProfile(patch: Partial<Pick<Profile, 'name' | 'avatar_url'>>) {
  const { data: u } = await supabase.auth.getUser()
  return unwrap(await supabase.from('profiles').update(patch).eq('id', u.user!.id).select().single())
}

/* ----------------------------- accounts ----------------------------- */
export async function getAccounts(): Promise<Account[]> {
  return unwrap(await supabase.from('accounts').select('*').is('deleted_at', null).order('created_at'))
}
export async function createAccount(a: Partial<Account>) {
  return unwrap(await supabase.from('accounts').insert(a).select().single())
}
export async function updateAccount(id: string, patch: Partial<Account>) {
  return unwrap(await supabase.from('accounts').update(patch).eq('id', id).select().single())
}
export async function deleteAccount(id: string) {
  const { error } = await supabase.from('accounts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/* ------------------------------- cards ------------------------------ */
export async function getCards(): Promise<Card[]> {
  return unwrap(await supabase.from('cards').select('*').is('deleted_at', null).order('created_at'))
}
export async function createCard(c: Partial<Card>) {
  return unwrap(await supabase.from('cards').insert(c).select().single())
}
export async function updateCard(id: string, patch: Partial<Card>) {
  return unwrap(await supabase.from('cards').update(patch).eq('id', id).select().single())
}
export async function deleteCard(id: string) {
  const { error } = await supabase.from('cards').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/* ---------------------------- categories ---------------------------- */
export async function getCategories(): Promise<Category[]> {
  return unwrap(await supabase.from('categories').select('*').is('deleted_at', null).order('name'))
}
export async function createCategory(c: Partial<Category>) {
  return unwrap(await supabase.from('categories').insert(c).select().single())
}
export async function updateCategory(id: string, patch: Partial<Category>) {
  return unwrap(await supabase.from('categories').update(patch).eq('id', id).select().single())
}
export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/* ------------------------------- tags ------------------------------- */
export async function getTags(): Promise<Tag[]> {
  return unwrap(await supabase.from('tags').select('*').is('deleted_at', null).order('name'))
}
export async function createTag(t: Partial<Tag>) {
  return unwrap(await supabase.from('tags').insert(t).select().single())
}
export async function updateTag(id: string, patch: Partial<Tag>) {
  return unwrap(await supabase.from('tags').update(patch).eq('id', id).select().single())
}
export async function deleteTag(id: string) {
  const { error } = await supabase.from('tags').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/* --------------------------- transactions --------------------------- */
export async function getTransactions(): Promise<Transaction[]> {
  return unwrap(
    await supabase.from('transactions').select('*').is('deleted_at', null).order('date', { ascending: false }),
  )
}
export async function createTransaction(t: Partial<Transaction>): Promise<Transaction> {
  return unwrap(await supabase.from('transactions').insert(t).select().single())
}
export async function updateTransaction(id: string, patch: Partial<Transaction>) {
  return unwrap(await supabase.from('transactions').update(patch).eq('id', id).select().single())
}
export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/* -------------------------- transaction_tags ------------------------ */
export interface TransactionTag { transaction_id: string; tag_id: string }

export async function getTransactionTags(): Promise<TransactionTag[]> {
  return unwrap(await supabase.from('transaction_tags').select('transaction_id, tag_id'))
}

/** Substitui as tags de um lançamento pelo conjunto informado. */
export async function setTransactionTags(transactionId: string, tagIds: string[]) {
  const del = await supabase.from('transaction_tags').delete().eq('transaction_id', transactionId)
  if (del.error) throw new Error(del.error.message)
  if (tagIds.length === 0) return
  const rows = tagIds.map((tag_id) => ({ transaction_id: transactionId, tag_id }))
  const ins = await supabase.from('transaction_tags').insert(rows)
  if (ins.error) throw new Error(ins.error.message)
}
