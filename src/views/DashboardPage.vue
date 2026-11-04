<template>
  <ion-page><AppNavigation /><ion-content class="ion-padding"><h1>Resumo financeiro</h1>
    <ion-spinner v-if="loading" />
    <template v-else>
      <div class="summary-grid">
        <ion-card><ion-card-header><ion-card-subtitle>Total de receitas</ion-card-subtitle><ion-card-title>{{ money(incomeTotal) }}</ion-card-title></ion-card-header></ion-card>
        <ion-card><ion-card-header><ion-card-subtitle>Total de despesas</ion-card-subtitle><ion-card-title>{{ money(expenseTotal) }}</ion-card-title></ion-card-header></ion-card>
        <ion-card><ion-card-header><ion-card-subtitle>Saldo atual</ion-card-subtitle><ion-card-title>{{ money(incomeTotal - expenseTotal) }}</ion-card-title></ion-card-header></ion-card>
      </div>
      <div class="summary-grid indicators"><ion-card><ion-card-header><ion-card-subtitle>Maior categoria de gasto</ion-card-subtitle><ion-card-title>{{ topCategory }}</ion-card-title></ion-card-header></ion-card><ion-card><ion-card-header><ion-card-subtitle>Quantidade de lançamentos</ion-card-subtitle><ion-card-title>{{ allItems.length }}</ion-card-title></ion-card-header></ion-card><ion-card><ion-card-header><ion-card-subtitle>Despesas / receitas</ion-card-subtitle><ion-card-title>{{ expenseRatio }}</ion-card-title></ion-card-header></ion-card></div>
      <ion-grid><ion-row><ion-col size="12" size-md="6"><ion-card><ion-card-header><ion-card-title>Despesas por categoria</ion-card-title></ion-card-header><ion-card-content><apexchart v-if="pieSeries.length" type="pie" height="300" :options="pieOptions" :series="pieSeries" /><p v-else>Cadastre despesas para visualizar o gráfico.</p></ion-card-content></ion-card></ion-col>
        <ion-col size="12" size-md="6"><ion-card><ion-card-header><ion-card-title>Receitas e despesas por mês</ion-card-title></ion-card-header><ion-card-content><apexchart type="bar" height="300" :options="barOptions" :series="barSeries" /></ion-card-content></ion-card></ion-col></ion-row></ion-grid>
    </template>
  </ion-content></ion-page>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonGrid, IonRow, IonCol, IonSpinner } from '@ionic/vue'
import AppNavigation from '../components/AppNavigation.vue'
import { listTransactions } from '../services/transactions'
import { supabase } from '../services/supabase'
import type { Transaction } from '../types/transaction'
import { presentToast } from '../utils/toast'
const incomes = ref<Transaction[]>([])
const expenses = ref<Transaction[]>([])
const loading = ref(true)
const allItems = computed(() => [...incomes.value, ...expenses.value])
const incomeTotal = computed(() => incomes.value.reduce((sum, item) => sum + Number(item.valor), 0))
const expenseTotal = computed(() => expenses.value.reduce((sum, item) => sum + Number(item.valor), 0))
const money = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
const topCategory = computed(() => {
  const totals = new Map<string, number>()
  expenses.value.forEach(item => totals.set(item.categoria, (totals.get(item.categoria) || 0) + Number(item.valor)))
  return [...totals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
})
const expenseRatio = computed(() => incomeTotal.value > 0 ? `${((expenseTotal.value / incomeTotal.value) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%` : '—')
const categoryTotals = computed(() => {
  const totals = new Map<string, number>()
  expenses.value.forEach(item => totals.set(item.categoria, (totals.get(item.categoria) || 0) + Number(item.valor)))
  return [...totals.entries()]
})
const pieSeries = computed(() => categoryTotals.value.map(([, total]) => total))
const pieOptions = computed(() => ({ labels: categoryTotals.value.map(([category]) => category), legend: { position: 'bottom' as const }, responsive: [{ breakpoint: 480, options: { chart: { width: '100%' }, legend: { position: 'bottom' as const } } }] }))
const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const monthKeys = computed(() => {
  const keys = new Set<string>()
  for (let offset = 5; offset >= 0; offset--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - offset); keys.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`) }
  return [...keys]
})
const monthLabels = computed(() => monthKeys.value.map(key => { const [year, month] = key.split('-').map(Number); return `${monthNames[month - 1]}/${String(year).slice(-2)}` }))
function totalsByMonth(rows: Transaction[]) { const values = new Map<string, number>(); rows.forEach(row => { const key = row.data.slice(0, 7); values.set(key, (values.get(key) || 0) + Number(row.valor)) }); return monthKeys.value.map(key => values.get(key) || 0) }
const barSeries = computed(() => [{ name: 'Receitas', data: totalsByMonth(incomes.value) }, { name: 'Despesas', data: totalsByMonth(expenses.value) }])
const barOptions = computed(() => ({ chart: { toolbar: { show: false } }, xaxis: { categories: monthLabels.value }, yaxis: { labels: { formatter: (value: number) => `R$ ${value.toLocaleString('pt-BR')}` } }, plotOptions: { bar: { horizontal: false, columnWidth: '55%' } }, dataLabels: { enabled: false }, legend: { position: 'bottom' as const } }))
async function refresh() {
  loading.value = true
  try { [incomes.value, expenses.value] = await Promise.all([listTransactions('receitas'), listTransactions('despesas')]) }
  catch (error) { presentToast(error instanceof Error ? error.message : 'Erro ao carregar o dashboard.', 'danger') }
  finally { loading.value = false }
}
onMounted(async () => {
  await refresh()
  supabase.channel('dashboard-refresh').on('postgres_changes', { event: '*', schema: 'public', table: 'receitas' }, refresh).on('postgres_changes', { event: '*', schema: 'public', table: 'despesas' }, refresh).subscribe()
})
</script>
