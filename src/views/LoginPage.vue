<template>
  <ion-page><ion-content class="ion-padding login-content"><ion-card class="login-card"><ion-card-header><ion-card-title>Controle Financeiro</ion-card-title><ion-card-subtitle>{{ registering ? 'Crie sua conta' : 'Acesse sua conta' }}</ion-card-subtitle></ion-card-header>
    <ion-card-content><ion-text v-if="!configured" color="danger"><p>Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env para conectar.</p></ion-text>
      <form @submit.prevent="submit"><ion-item><ion-input v-model="email" type="email" label="E-mail" label-placement="stacked" autocomplete="email" required /></ion-item><ion-item><ion-input v-model="password" type="password" label="Senha" label-placement="stacked" :autocomplete="registering ? 'new-password' : 'current-password'" minlength="6" required /></ion-item>
        <ion-button expand="block" type="submit" class="ion-margin-top" :disabled="loading || !configured">{{ loading ? 'Aguarde…' : (registering ? 'Criar conta' : 'Entrar') }}</ion-button></form>
      <ion-button expand="block" fill="clear" @click="registering = !registering">{{ registering ? 'Já tenho uma conta' : 'Criar uma conta' }}</ion-button>
    </ion-card-content></ion-card></ion-content></ion-page>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonInput, IonButton, IonText } from '@ionic/vue'
import { signIn, signUp } from '../services/auth'
import { isSupabaseConfigured as configured } from '../services/supabase'
import { presentToast } from '../utils/toast'
const router = useRouter()
const email = ref('')
const password = ref('')
const registering = ref(false)
const loading = ref(false)
async function submit() {
  if (!email.value.trim() || password.value.length < 6) { presentToast('Informe um e-mail e uma senha com pelo menos 6 caracteres.', 'warning'); return }
  loading.value = true
  try {
    if (registering.value) { const result = await signUp(email.value.trim(), password.value); if (result.session) await router.replace('/dashboard'); else presentToast('Conta criada. Confira seu e-mail para confirmar o cadastro.') }
    else { await signIn(email.value.trim(), password.value); await router.replace('/dashboard') }
  } catch (error) { presentToast(error instanceof Error ? error.message : 'Não foi possível autenticar.', 'danger') }
  finally { loading.value = false }
}
</script>
