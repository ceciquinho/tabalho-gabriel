<template>
  <ion-header><ion-toolbar color="primary"><ion-title>Controle Financeiro</ion-title><ion-buttons slot="end"><ion-label class="account-email">{{ accountEmail }}</ion-label><ion-button @click="logout">Sair</ion-button></ion-buttons></ion-toolbar>
    <ion-toolbar><ion-segment :value="route.path" @ionChange="navigate">
      <ion-segment-button value="/dashboard"><ion-label>Dashboard</ion-label></ion-segment-button>
      <ion-segment-button value="/receitas"><ion-label>Receitas</ion-label></ion-segment-button>
      <ion-segment-button value="/despesas"><ion-label>Despesas</ion-label></ion-segment-button>
    </ion-segment></ion-toolbar>
  </ion-header>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonSegment, IonSegmentButton, IonLabel } from '@ionic/vue'
import { useRoute, useRouter } from 'vue-router'
import { signOut } from '../services/auth'
import { supabase } from '../services/supabase'
import { presentToast } from '../utils/toast'
const route = useRoute()
const router = useRouter()
const accountEmail = ref('')
let authSubscription: ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription'] | undefined
function navigate(event: CustomEvent) { const path = event.detail.value as string; if (path) router.push(path) }
async function logout() {
  try { await signOut(); await router.replace('/login') }
  catch (error) { presentToast(error instanceof Error ? error.message : 'Não foi possível sair.', 'danger') }
}
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  accountEmail.value = user?.email || ''
  const { data } = supabase.auth.onAuthStateChange((_event, session) => { accountEmail.value = session?.user.email || '' })
  authSubscription = data.subscription
})
onUnmounted(() => authSubscription?.unsubscribe())
</script>
<style scoped>
.account-email { color: white; font-size: 0.8rem; max-width: 38vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
