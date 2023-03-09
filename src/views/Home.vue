<template>
  <div class="dark:bg-[#1a1a1a] dark:text-white transition-colors min-h-screen">
    <Sidebar :images="images" :filter-config="filterConfig" />
    <div v-show="showSidebar" class="fixed w-screen h-screen left-0 top-0 bg-black/40 z-10" @click="showSidebar = false" />
    <div class="h-[60px] text-2xl flex items-center justify-center">
      <button class="absolute left-2" @click="showSidebar = !showSidebar">
        <svg
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-8 h-8"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      OriLightの<span class="text-[#0398fa] px-1">Pixiv</span>收藏夹
      <button
        class="absolute right-2 border border-gray-400/50 p-1 hover:border-blue-400 rounded-md transition-colors duration-500"
        @click="darkMode = !darkMode"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-4 h-4"
        >
          <path
            stroke-linecap="round" stroke-linejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      </button>
    </div>

    <div class="px-2 lg:px-0">
      <MasonryView
        :loading="loading" :images="images" :config="{
          col,
          gap,
          showNo: true,
          preload: 3,
        }" :filter="imageFilter"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/store'

const store = useStore()
const { col, gap, filterConfig, darkMode, showSidebar } = toRefs(store)
const images = ref<Image[]>([])
const loading = ref(true)

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

onMounted(() => {
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

<style></style>
