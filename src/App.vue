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
      <div v-show="!imagesFiltered.length" class="w-fit mx-auto px-3 py-1 text-lg bg-black/20 rounded-xl">
        {{ loading ? '数据加载中...' : '无数据' }}
      </div>
      <MasonryView v-if="masonryConfig.virtualListImpl === 'default'" />
      <MasonryViewVS v-else-if="masonryConfig.virtualListImpl === 'virtual-scroller'" />
      <MasonryView v-else-if="masonryConfig.virtualListImpl === 'none'" />
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

watchEffect(() => {
  if (settingLoaded.value) {
    localStorage.setItem('restrict_r18', filterConfig.value.restrict.r18.toString())
    localStorage.setItem('restrict_sanityLevel', filterConfig.value.restrict.sanityLevel.max.toString())
    localStorage.setItem('config_darkmode', String(darkMode.value))
    localStorage.setItem('config_masonry', JSON.stringify(masonryConfig.value))
  }
})

onMounted(() => {
  filterConfig.value.restrict.r18 = localStorage.getItem('restrict_r18') === 'true'
  filterConfig.value.restrict.sanityLevel.max = Number(localStorage.getItem('restrict_sanityLevel')) || 2
  darkMode.value = (localStorage.getItem('config_darkmode') || 'false') === 'true'
  if (localStorage.getItem('config_masonry'))
    masonryConfig.value = JSON.parse(localStorage.getItem('config_masonry') as string)
  settingLoaded.value = true

  fetch('/images.json')
    .then(res => res.json())
    .then((data) => {
      store.images = data
    })
    .finally(() => {
      loading.value = false
    })
})
</script>
