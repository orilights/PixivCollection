<template>
  <div
    :class="{
      dark: darkMode,
    }"
  >
    <div class="dark:bg-[#1a1a1a] dark:text-white transition-colors min-h-screen">
      <Sidebar :images="images" :filter-config="filterConfig" />
      <div
        v-show="showSidebar"
        class="fixed w-screen h-screen left-0 top-0 bg-black/40 z-20 hidden sm:block"
        @click="showSidebar = false"
      />
      <Navbar />
      <MasonryView
        v-if="virtualListImpl === 'default'"
        :loading="loading"
        :images="images"
        :config="{
          col,
          gap,
          showNo: showImageNo,
          preload: masonryPreload,
          virtualList: true,
        }"
        :filter="imageFilter"
      />
      <MasonryViewVS
        v-else-if="virtualListImpl === 'virtual-scroller'"
        :loading="loading"
        :images="images"
        :config="{
          col,
          gap,
          showNo: showImageNo,
          preload: masonryPreload,
          virtualList: true,
        }"
        :filter="imageFilter"
      />
      <MasonryView
        v-else-if="virtualListImpl === 'none'"
        :loading="loading"
        :images="images"
        :config="{
          col,
          gap,
          showNo: showImageNo,
          preload: masonryPreload,
          virtualList: false,
        }"
        :filter="imageFilter"
      />
      <ImageViewer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/store'
import { masonryPreload } from '@/config'

const store = useStore()

const {
  darkMode,
  col, gap,
  filterConfig,
  showSidebar,
  virtualListImpl,
  showTagTranslation,
  showImageNo,
  infoAtBottom,
  containerFullWidth,
  imageFilter,
} = toRefs(store)

const settingLoaded = ref(false)
const images = ref<Image[]>([])
const loading = ref(true)

watchEffect(() => {
  if (settingLoaded.value) {
    localStorage.setItem('darkMode', String(darkMode.value))
    localStorage.setItem('col', col.value.toString())
    localStorage.setItem('gap', gap.value.toString())
    localStorage.setItem('r18', filterConfig.value.restrict.r18.toString())
    localStorage.setItem('sanity', filterConfig.value.restrict.sanity.max.toString())
    localStorage.setItem('masonryImpl', virtualListImpl.value.toString())
    localStorage.setItem('tagTranslation', showTagTranslation.value.toString())
    localStorage.setItem('showImageNo', showImageNo.value.toString())
    localStorage.setItem('infoAtBottom', infoAtBottom.value.toString())
    localStorage.setItem('containerFullWidth', containerFullWidth.value.toString())
  }
})

onMounted(() => {
  darkMode.value = (localStorage.getItem('darkMode') || 'false') === 'true'
  col.value = Number(localStorage.getItem('col')) || -1
  gap.value = Number(localStorage.getItem('gap') || '10')
  filterConfig.value.restrict.r18 = localStorage.getItem('r18') === 'true'
  filterConfig.value.restrict.sanity.max = Number(localStorage.getItem('sanity')) || 2
  virtualListImpl.value = localStorage.getItem('masonryImpl') || 'virtual-scroller'
  showTagTranslation.value = localStorage.getItem('tagTranslation') === 'true'
  showImageNo.value = localStorage.getItem('showImageNo') === 'true'
  infoAtBottom.value = localStorage.getItem('infoAtBottom') === 'true'
  containerFullWidth.value = localStorage.getItem('containerFullWidth') === 'true'
  settingLoaded.value = true

  fetch('/images.json')
    .then(res => res.json())
    .then((data) => {
      images.value = data
    })
    .finally(() => {
      loading.value = false
    })
})
</script>
