export type TransactionKind = 'receitas' | 'despesas'
export interface Transaction {
  id: string
  descricao: string
  valor: number
  categoria: string
  data: string
  user_id: string
}
export const categories: Record<TransactionKind, string[]> = {
  receitas: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
  despesas: ['Alimentação', 'Transporte', 'Moradia', 'Educação', 'Lazer', 'Saúde', 'Outros'],
}
