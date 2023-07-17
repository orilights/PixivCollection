<template>
  <div
    :class="{
      dark: colorScheme === 'dark',
    }"
  >
    <div class="dark:bg-[#1a1a1a] dark:text-white transition-colors min-h-screen">
      <Sidebar />
      <SidebarMask />
      <Navbar />
      <Tip v-show="!imagesFiltered.length">
        <template v-if="loading">
          <IconLoading class="w-[60px] mx-auto pb-2" :dark="colorScheme === 'light'" />
          <div class="text-center">
            数据加载中<br>
            {{ byteConv(receivedLength) }} <span v-if="contentLength"> / {{ byteConv(contentLength) }}</span>
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
import { Setting } from './utils'
import { DATA_FILE } from './config'
import { useStore } from '@/store'
import { byteConv } from '@/utils/file'

const store = useStore()

const {
  preferColorScheme,
  colorScheme,
  imagesFiltered,
  masonryConfig,
  filterConfig,
} = toRefs(store)

const settingLoaded = ref(false)
const loading = ref(true)
const receivedLength = ref(0)
const contentLength = ref(0)

watchEffect(() => {
  if (!settingLoaded.value)
    return

  Setting.set('preferColorScheme', preferColorScheme.value)
  Setting.set('masonryConfig', JSON.stringify(masonryConfig.value))
  Setting.set('restrictConfig', JSON.stringify(filterConfig.value.restrict))
})

onMounted(async () => {
  preferColorScheme.value = Setting.get('preferColorScheme', 'str', 'auto')
  masonryConfig.value = Setting.get('masonryConfig', 'json', masonryConfig.value)
  filterConfig.value.restrict = Setting.get('restrictConfig', 'json', filterConfig.value.restrict)

  settingLoaded.value = true

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
  }
  catch (e) {
    console.error(e)
  }
  finally {
    loading.value = false
  }
})
</script>
