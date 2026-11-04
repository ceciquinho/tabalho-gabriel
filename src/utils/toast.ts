import { toastController } from '@ionic/vue'
export async function presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
  const toast = await toastController.create({ message, color, duration: 2600, position: 'top' })
  await toast.present()
}
