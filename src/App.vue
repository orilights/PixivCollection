<template>
  <div
    :class="{
      dark: darkMode,
    }"
  >
    <div class="dark:bg-[#1a1a1a] dark:text-white transition-colors min-h-screen">
      <Sidebar :images="images" :filter-config="filterConfig" />
      <div v-show="showSidebar" class="fixed w-screen h-screen left-0 top-0 bg-black/40 z-20 hidden sm:block" @click="showSidebar = false" />
      <Navbar />
      <div class="px-2">
        <MasonryView
          :loading="loading" :images="images" :config="{
            col,
            gap,
            showNo: showImageNo,
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

const { darkMode, col, gap, filterConfig, showSidebar, showImageNo } = toRefs(store)

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
    // 过滤_健全度
    if (!filterConfig.value.restrict.r18) {
      if (image.detail.x_restrict >= 1)
        return false
    }
    if (filterConfig.value.restrict.sanity.max) {
      if (image.detail.sanity_level > filterConfig.value.restrict.sanity.max)
        return false
    }
    // 搜索
    if (filterConfig.value.search.enable) {
      if (filterConfig.value.search.value.trim() !== '') {
        const searchStr = (image.id + image.title + image.detail.author.id + image.detail.author.name).toLowerCase()
        if (!searchStr.includes(filterConfig.value.search.value.trim().toLowerCase()))
          return false
      }
      return true
    }
    // 过滤_年份
    if (filterConfig.value.year.enable) {
      const year = Number(image.detail.created_at.split('-')[0])
      if (filterConfig.value.year.value === 1) {
        if (year > 2000)
          return false
      }
      else if (year !== filterConfig.value.year.value) {
        return false
      }
    }
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
    // 过滤_形状
    if (filterConfig.value.shape.enable) {
      if (image.size[0] / image.size[1] < 0.95 || image.size[0] / image.size[1] > 1.05) {
        if (filterConfig.value.shape.value === 'square')
          return false
      }
      if (image.size[0] > image.size[1]) {
        if (filterConfig.value.shape.value === 'vertical')
          return false
      }
      else {
        if (filterConfig.value.shape.value === 'horizontal')
          return false
      }
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
    return true
  }
})
</script>
