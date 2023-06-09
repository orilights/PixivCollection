<template>
  <div
    :class="{
      dark: darkMode,
    }"
  >
    <div class="dark:bg-[#1a1a1a] dark:text-white transition-colors min-h-screen">
      <Sidebar />
      <div
        v-show="showSidebar"
        class="fixed w-screen h-screen left-0 top-0 bg-black/40 z-20 hidden sm:block"
        @click="showSidebar = false"
      />
      <Navbar />
      <div v-show="!imagesFiltered.length" class="w-fit mx-auto px-6 py-4 mt-4 text-lg bg-black/20 rounded-xl">
        <IconLoading v-if="loading" class="w-[60px] mx-auto pb-2" :dark="!darkMode" />
        <div class="text-center">
          {{ loading ? '数据加载中' : '无数据' }}
        </div>
        <div v-if="contentLength && loading">
          {{ byteConv(receivedLength) }} / {{ byteConv(contentLength) }}
        </div>
      </div>
      <MasonryView />
      <ImageViewer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/store'

const store = useStore()

const {
  darkMode,
  showSidebar,
  imagesFiltered,
  masonryConfig,
  filterConfig,
} = toRefs(store)

const settingLoaded = ref(false)
const loading = ref(true)
const receivedLength = ref(0)
const contentLength = ref(0)

watchEffect(() => {
  if (settingLoaded.value) {
    localStorage.setItem('restrict_r18', filterConfig.value.restrict.r18)
    localStorage.setItem('restrict_maxSanityLevel', filterConfig.value.restrict.maxSanityLevel.toString())
    localStorage.setItem('config_darkmode', String(darkMode.value))
    localStorage.setItem('config_masonry', JSON.stringify(masonryConfig.value))
  }
})

onMounted(async () => {
  filterConfig.value.restrict.r18 = localStorage.getItem('restrict_r18') || 'hidden'
  filterConfig.value.restrict.maxSanityLevel = Number(localStorage.getItem('restrict_maxSanityLevel')) || 2
  darkMode.value = (localStorage.getItem('config_darkmode') || 'false') === 'true'
  if (localStorage.getItem('config_masonry'))
    masonryConfig.value = JSON.parse(localStorage.getItem('config_masonry') as string)
  settingLoaded.value = true

  try {
    const response = await fetch('/images.json')
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

function byteConv(bytes: number) {
  if (bytes === 0)
    return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
}
</script>
