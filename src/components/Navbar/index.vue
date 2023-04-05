<template>
  <div class="h-[60px] mb-2">
    <div
      class="fixed top-0 left-0 w-full h-[60px] z-10 bg-white dark:bg-[#202020] transition-[transform,background] shadow-md"
      :class="{
        'translate-y-[-70px]': (!showNav || imageViewerShow) && !showSidebar,
      }"
    >
      <div class="absolute top-0 left-0 flex w-full">
        <button class="w-[60px] h-[60px] hover:bg-gray-400/20" @click="showSidebar = !showSidebar">
          <IconMenu class="w-7 h-7 mx-auto" />
        </button>
        <button class="w-[60px] h-[60px] hover:bg-gray-400/20" @click="store.toggleSearch">
          <IconSearch v-if="!filterConfig.search.enable" class="w-6 h-6 mx-auto" />
          <IconClose v-else class="w-6 h-6 mx-auto" />
        </button>
        <div v-show="filterConfig.search.enable" class="flex-1 inline-block">
          <input
            class="w-full h-[60px] outline-none px-4 box-border border-l border-gray-400/50 bg-transparent" type="text" placeholder="图片id/图片标题/作者id/作者昵称"
            @input="handleSearchInput"
          >
        </div>
      </div>
      <div v-show="!filterConfig.search.enable" class="text-lg h-[60px] leading-[60px] select-none text-center ml-[60px] sm:ml-0" @dblclick="navToTop">
        OriLightの<span class="text-[#0398fa] px-1">Pixiv</span>收藏夹
      </div>
      <div class="absolute top-0 right-0 hidden lg:flex">
        <button
          class="w-[60px] h-[60px] hover:bg-gray-400/20"
          @click="openGithub"
        >
          <IconGithub class="w-6 h-6 mx-auto" />
        </button>
        <button
          class="w-[60px] h-[60px] hover:bg-gray-400/20"
          @click="store.toggleDarkMode"
        >
          <IconSun v-if="!darkMode" class="w-6 h-6 mx-auto" />
          <IconMoon v-else class="w-5 h-5 mx-auto" />
        </button>
        <button
          class="w-[60px] h-[60px] hover:bg-gray-400/20"
          @click="store.toggleFullscreen"
        >
          <IconShrink v-if="isFullscreen" class="w-5 h-5 mx-auto" />
          <IconExpand v-else class="w-5 h-5 mx-auto" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { useStore } from '@/store'
import { githubLink } from '@/config'

const store = useStore()
const { darkMode, showSidebar, showNav, imageViewerShow, isFullscreen, filterConfig } = toRefs(store)

const updateSearchStr = useDebounceFn((value) => {
  filterConfig.value.search.value = value
}, 300)

let oldY = 0

onMounted(() => {
  window.addEventListener('scroll', () => {
    const newY = document.documentElement.scrollTop
    if (newY > oldY && newY > 200)
      showNav.value = false
    else if (newY < oldY)
      showNav.value = true
    oldY = newY
  })
})

function navToTop() {
  document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function openGithub() {
  window.open(githubLink, '_blank')
}

function handleSearchInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  updateSearchStr(value)
}
</script>
