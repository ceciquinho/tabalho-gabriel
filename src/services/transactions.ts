import { supabase } from './supabase'
import type { Transaction, TransactionKind } from '../types/transaction'

export type TransactionInput = Pick<Transaction, 'descricao' | 'valor' | 'categoria' | 'data'>

export async function listTransactions(kind: TransactionKind) {
  const { data, error } = await supabase.from(kind).select('*').order('data', { ascending: false })
  if (error) throw error
  return (data || []) as Transaction[]
}

export async function saveTransaction(kind: TransactionKind, input: TransactionInput, id?: string) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw userError || new Error('Faça login para continuar.')
  const payload = { ...input, user_id: user.id }
  const result = id
    ? await supabase.from(kind).update(payload).eq('id', id).select().single()
    : await supabase.from(kind).insert(payload).select().single()
  if (result.error) throw result.error
  return result.data as Transaction
}

export async function deleteTransaction(kind: TransactionKind, id: string) {
  const { error } = await supabase.from(kind).delete().eq('id', id)
  if (error) throw error
}
