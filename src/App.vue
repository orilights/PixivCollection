<template>
  <div
    :class="{
      dark: darkMode,
    }"
  >
    <div class="dark:bg-[#1a1a1a] dark:text-white transition-colors min-h-screen">
      <Sidebar :images="images" :filter-config="filterConfig" />
      <div v-show="showSidebar" class="fixed w-screen h-screen left-0 top-0 bg-black/40 z-20" @click="showSidebar = false" />
      <Navbar />
      <div class="px-2 lg:px-0">
        <MasonryView
          :loading="loading" :images="images" :config="{
            col,
            gap,
            showNo: true,
            preload: 3,
          }" :filter="imageFilter"
        />
        <ImageViewer />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from './store'

const store = useStore()

const { darkMode, col, gap, filterConfig, showSidebar } = toRefs(store)

const settingLoaded = ref(false)
const images = ref<Image[]>([])
const loading = ref(true)

watchEffect(() => {
  if (settingLoaded.value)
    localStorage.setItem('darkMode', String(darkMode.value))
})

onMounted(() => {
  darkMode.value = (localStorage.getItem('darkMode') || 'false') === 'true'
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

const imageFilter = computed(() => {
  return (image: Image) => {
    // 过滤_作者
    if (filterConfig.value.author.enable) {
      if (image.detail.author.id !== filterConfig.value.author.id)
        return false
    }
    // 过滤_标签
    if (filterConfig.value.tag.enable) {
      if ((image.detail.tags.find((tag) => {
        if (tag.name === filterConfig.value.tag.name)
          return tag
        return undefined
      })) === undefined)
        return false
    }
    // 过滤_尺寸
    if (filterConfig.value.size.enable) {
      const { max: wMax, min: wMin } = filterConfig.value.size.width
      if (wMax) {
        if (image.size[0] > wMax)
          return false
      }
      if (wMin) {
        if (image.size[0] < wMin)
          return false
      }
      const { max: hMax, min: hMin } = filterConfig.value.size.height
      if (hMax) {
        if (image.size[1] > hMax)
          return false
      }
      if (hMin) {
        if (image.size[1] < hMin)
          return false
      }
    }
    // 过滤_健全度
    if (!filterConfig.value.restrict.r18) {
      if (image.detail.x_restrict >= 1)
        return false
    }
    if (filterConfig.value.restrict.sanity.max) {
      if (image.detail.sanity_level > filterConfig.value.restrict.sanity.max)
        return false
    }

    return true
  }
})
</script>
