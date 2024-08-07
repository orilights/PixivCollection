<template>
  <div
    :class="{
      dark: colorScheme === 'dark',
    }"
  >
    <div class="min-h-screen transition-colors dark:bg-[#1a1a1a] dark:text-white">
      <Sidebar />
      <SidebarMask />
      <Navbar />
      <MasonryView />
      <Tip v-if="loading">
        <IconLoading class="mx-auto w-[60px] pb-2" :dark="colorScheme === 'light'" />
        <div class="text-center">
          数据加载中<br>
          {{ formatBytes(receivedLength) }}<span v-if="contentLength"> / {{ formatBytes(contentLength) }}</span>
        </div>
      </Tip>
      <Tip v-if="!loading && !imagesFiltered.length">
        无数据
      </Tip>
      <ImageViewer />
      <DebugInfo v-if="debug.enable" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { SettingType } from '@orilight/vue-settings'
import { useStore } from '@/store'
import { formatBytes } from '@/utils'
import { DATA_FILE, ONLINE_MODE } from '@/config'

const store = useStore()

const {
  loading,
  preferColorScheme,
  colorScheme,
  imagesFiltered,
  masonryConfig,
  filterConfig,
  debug,
} = toRefs(store)

const receivedLength = ref(0)
const contentLength = ref(0)

function regSettings() {
  store.settings.register('preferColorScheme', preferColorScheme)
  store.settings.register('masonryConfig', masonryConfig, SettingType.Json, {
    deepMerge: true,
  })
  store.settings.register('restrictConfig', toRef(filterConfig.value, 'restrict'), SettingType.Json, {
    deepMerge: true,
  })
}

async function fetchData() {
  try {
    const response = await fetch(DATA_FILE)
    const reader = (response.body as ReadableStream<Uint8Array>).getReader()
    contentLength.value = +(response.headers.get('Content-Length') || 0)
    const chunks = []
    while (true) {
      const { done, value } = await reader.read()
      if (done)
        break
      chunks.push(value)
      receivedLength.value += value.length
    }

    const chunksAll = new Uint8Array(receivedLength.value)
    let position = 0
    for (const chunk of chunks) {
      chunksAll.set(chunk, position)
      position += chunk.length
    }

    const result = new TextDecoder('utf-8').decode(chunksAll)

    store.images = JSON.parse(result)
    store.sortImages()
  }
  catch (e) {
    console.error(e)
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  regSettings()
  if (ONLINE_MODE) {
    store.fetchFromAPI()
  }
  else {
    fetchData()
  }
})

onUnmounted(() => {
  store.settings.unregisterAll()
})
</script>

<style>
body {
  overflow-y: scroll;
}
</style>
