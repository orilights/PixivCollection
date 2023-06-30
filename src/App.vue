<template>
  <div
    :class="{
      dark: colorScheme === 'dark',
    }"
  >
    <div class="dark:bg-[#1a1a1a] dark:text-white transition-colors min-h-screen">
      <Sidebar />
      <div
        v-show="showSidebar"
        class="fixed top-0 left-0 z-20 hidden w-screen h-screen bg-black/40 sm:block"
        @click="showSidebar = false"
      />
      <Navbar />
      <div v-show="!imagesFiltered.length" class="px-6 py-4 mx-auto mt-4 text-lg w-fit bg-black/20 rounded-xl">
        <IconLoading v-if="loading" class="w-[60px] mx-auto pb-2" :dark="colorScheme === 'dark'" />
        <div class="text-center">
          {{ loading ? '数据加载中' : '无数据' }}
        </div>
        <div v-if="loading" class="text-center">
          {{ byteConv(receivedLength) }} <span v-if="contentLength"> / {{ byteConv(contentLength) }}</span>
        </div>
      </div>
      <MasonryView />
      <ImageViewer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/store'
import { byteConv } from '@/utils/file'

const store = useStore()

const {
  preferColorScheme,
  colorScheme,
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
    localStorage.setItem('config_preferColorScheme', String(preferColorScheme.value))
    localStorage.setItem('config_masonry', JSON.stringify(masonryConfig.value))
  }
})

onMounted(async () => {
  filterConfig.value.restrict.r18 = localStorage.getItem('restrict_r18') || 'hidden'
  filterConfig.value.restrict.maxSanityLevel = Number(localStorage.getItem('restrict_maxSanityLevel')) || 2
  preferColorScheme.value = localStorage.getItem('config_preferColorScheme') as any || 'auto'
  if (localStorage.getItem('config_masonry'))
    masonryConfig.value = JSON.parse(localStorage.getItem('config_masonry') as string)
  settingLoaded.value = true

  try {
    const response = await fetch('./images.json')
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
