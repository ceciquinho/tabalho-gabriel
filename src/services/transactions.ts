import { supabase } from './supabase'
import type { Transaction, TransactionKind } from '../types/transaction'

export type TransactionInput = Pick<Transaction, 'descricao' | 'valor' | 'categoria' | 'data'>

async function getCurrentUserId() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw error || new Error('Faça login para continuar.')
  return user.id
}

export async function listTransactions(kind: TransactionKind) {
  const userId = await getCurrentUserId()
  const { data, error } = await supabase.from(kind).select('*').eq('user_id', userId).order('data', { ascending: false })
  if (error) throw error
  return (data || []) as Transaction[]
}

export async function saveTransaction(kind: TransactionKind, input: TransactionInput, id?: string) {
  const userId = await getCurrentUserId()
  const payload = { ...input, user_id: userId }
  const result = id
    ? await supabase.from(kind).update(payload).eq('id', id).eq('user_id', userId).select().single()
    : await supabase.from(kind).insert(payload).select().single()
  if (result.error) throw result.error
  if (result.data.user_id !== userId) throw new Error('O lançamento não foi associado à conta autenticada.')
  return result.data as Transaction
}

export async function deleteTransaction(kind: TransactionKind, id: string) {
  const userId = await getCurrentUserId()
  const { error } = await supabase.from(kind).delete().eq('id', id).eq('user_id', userId)
  if (error) throw error
}
