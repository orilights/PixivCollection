import { createPinia } from 'pinia'
import VueVirtualScroller from 'vue-virtual-scroller'
import App from '@/App.vue'

import '@/assets/tailwind.css'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const app = createApp(App)

app.use(createPinia())
app.use(VueVirtualScroller)

app.mount('#app')
