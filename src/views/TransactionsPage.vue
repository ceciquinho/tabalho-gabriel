<template><ion-page><AppNavigation /><ion-content class="ion-padding"><h1>{{ kind === 'receitas' ? 'Receitas' : 'Despesas' }}</h1><TransactionManager :kind="kind" /></ion-content></ion-page></template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { IonPage, IonContent } from '@ionic/vue'
import AppNavigation from '../components/AppNavigation.vue'
import TransactionManager from '../components/TransactionManager.vue'
import type { TransactionKind } from '../types/transaction'
const route = useRoute()
const kind = computed(() => (route.meta.kind === 'receitas' ? 'receitas' : 'despesas') as TransactionKind)
</script>
