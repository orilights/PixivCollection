import { createPinia } from 'pinia'
import App from '@/App.vue'

import '@/assets/tailwind.css'
import '@/assets/transition.css'
import 'overlayscrollbars/overlayscrollbars.css'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)

app.mount('#app')
