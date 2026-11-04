<template>
  <ion-card>
    <ion-card-header><ion-card-title>{{ editingId ? 'Editar lançamento' : `Nova ${singular}` }}</ion-card-title></ion-card-header>
    <ion-card-content>
      <form @submit.prevent="submit">
        <ion-item><ion-input v-model="form.descricao" label="Descrição" label-placement="stacked" required :maxlength="120" /></ion-item>
        <ion-item><ion-input v-model.number="form.valor" label="Valor (R$)" label-placement="stacked" type="number" min="0.01" step="0.01" required /></ion-item>
        <ion-item><ion-select v-model="form.categoria" label="Categoria" label-placement="stacked" interface="popover" required><ion-select-option v-for="category in options" :key="category" :value="category">{{ category }}</ion-select-option></ion-select></ion-item>
        <ion-item><ion-input v-model="form.data" label="Data" label-placement="stacked" type="date" required /></ion-item>
        <div class="form-actions"><ion-button type="submit" :disabled="saving">{{ saving ? 'Salvando…' : (editingId ? 'Atualizar' : 'Cadastrar') }}</ion-button><ion-button v-if="editingId" fill="outline" color="medium" @click="reset">Cancelar</ion-button></div>
      </form>
    </ion-card-content>
  </ion-card>
  <ion-card>
    <ion-card-header><ion-card-title>Lista de {{ kind }}</ion-card-title></ion-card-header>
    <ion-card-content>
      <ion-spinner v-if="loading" />
      <ion-text v-else-if="items.length === 0" color="medium"><p>Nenhum lançamento cadastrado.</p></ion-text>
      <ion-list v-else>
        <ion-item v-for="item in items" :key="item.id">
          <ion-label><h2>{{ item.descricao }}</h2><p>{{ item.categoria }} · {{ formatDate(item.data) }}</p><p class="amount">{{ formatCurrency(item.valor) }}</p></ion-label>
          <ion-button slot="end" fill="clear" aria-label="Editar" @click="edit(item)">Editar</ion-button>
          <ion-button slot="end" fill="clear" color="danger" aria-label="Excluir" @click="remove(item)">Excluir</ion-button>
        </ion-item>
      </ion-list>
    </ion-card-content>
  </ion-card>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonList, IonLabel, IonText, IonSpinner, alertController } from '@ionic/vue'
import type { Transaction, TransactionKind } from '../types/transaction'
import { categories } from '../types/transaction'
import { deleteTransaction, listTransactions, saveTransaction } from '../services/transactions'
import { presentToast } from '../utils/toast'

const props = defineProps<{ kind: TransactionKind }>()
const items = ref<Transaction[]>([])
const loading = ref(true)
const saving = ref(false)
const editingId = ref<string>()
const options = computed(() => categories[props.kind])
const singular = computed(() => props.kind === 'receitas' ? 'receita' : 'despesa')
const today = () => new Date().toISOString().slice(0, 10)
const blank = () => ({ descricao: '', valor: undefined as number | undefined, categoria: '', data: today() })
const form = reactive(blank())
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
const formatDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')
async function refresh() { loading.value = true; try { items.value = await listTransactions(props.kind) } catch (error) { presentToast(error instanceof Error ? error.message : 'Erro ao carregar lançamentos.', 'danger') } finally { loading.value = false } }
function reset() { Object.assign(form, blank()); editingId.value = undefined }
function edit(item: Transaction) { editingId.value = item.id; Object.assign(form, { descricao: item.descricao, valor: item.valor, categoria: item.categoria, data: item.data }) }
async function submit() {
  const description = form.descricao.trim()
  if (!description || !form.categoria || !form.data || !Number.isFinite(Number(form.valor)) || Number(form.valor) <= 0) { presentToast('Preencha todos os campos e informe um valor maior que zero.', 'warning'); return }
  saving.value = true
  try { await saveTransaction(props.kind, { descricao: description, valor: Number(form.valor), categoria: form.categoria, data: form.data }, editingId.value); presentToast(`${singular.value[0].toUpperCase()}${singular.value.slice(1)} ${editingId.value ? 'atualizada' : 'cadastrada'} com sucesso.`); reset(); await refresh() }
  catch (error) { presentToast(error instanceof Error ? error.message : 'Erro ao salvar lançamento.', 'danger') }
  finally { saving.value = false }
}
async function remove(item: Transaction) {
  const alert = await alertController.create({ header: 'Excluir lançamento?', message: `Deseja excluir “${item.descricao}”?`, buttons: [{ text: 'Cancelar', role: 'cancel' }, { text: 'Excluir', role: 'destructive', handler: async () => { try { await deleteTransaction(props.kind, item.id); presentToast('Lançamento excluído.'); await refresh() } catch (error) { presentToast(error instanceof Error ? error.message : 'Erro ao excluir.', 'danger') } } }] })
  await alert.present()
}
onMounted(refresh)
</script>
