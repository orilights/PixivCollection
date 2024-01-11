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
      <Tip v-show="!imagesFiltered.length">
        <template v-if="loading">
          <IconLoading class="mx-auto w-[60px] pb-2" :dark="colorScheme === 'light'" />
          <div class="text-center">
            数据加载中<br>
            {{ formatBytes(receivedLength) }} <span v-if="contentLength"> / {{ formatBytes(contentLength) }}</span>
          </div>
        </template>
        <template v-else>
          无数据
        </template>
      </Tip>
      <MasonryView />
      <ImageViewer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { SettingType } from '@orilight/vue-settings'
import { DATA_FILE } from './config'
import { useStore } from '@/store'
import { formatBytes } from '@/utils'

const store = useStore()

const {
  preferColorScheme,
  colorScheme,
  imagesFiltered,
  masonryConfig,
  filterConfig,
} = toRefs(store)

const loading = ref(true)
const receivedLength = ref(0)
const contentLength = ref(0)

onMounted(async () => {
  store.settings.register('preferColorScheme', preferColorScheme)
  store.settings.register('masonryConfig', masonryConfig, SettingType.Json, {
    deepMerge: true,
  })
  store.settings.register('restrictConfig', toRef(filterConfig.value, 'restrict'), SettingType.Json, {
    deepMerge: true,
  })

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
})
</script>

<style>
body {
  overflow-y: scroll;
}
</style>
