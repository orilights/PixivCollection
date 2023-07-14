import { createPinia } from 'pinia'
import App from '@/App.vue'

import '@/assets/tailwind.css'
import '@/assets/transition.css'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
