<template>
  <div class="h-[60px] mb-2">
    <div
      class="fixed top-0 left-0 w-full h-[60px] z-10 bg-white dark:bg-[#202020] transition-[transform,background] shadow-md"
      :class="{
        'translate-y-[-70px]': !showNav || imageViewerShow,
      }"
    >
      <div class="absolute top-0 left-0">
        <button class="w-[60px] h-[60px] hover:bg-gray-400/20" @click="showSidebar = !showSidebar">
          <IconMenu class="w-7 h-7 mx-auto" />
        </button>
      </div>
      <div class="text-lg h-[60px] leading-[60px] select-none text-center" @dblclick="navToTop">
        OriLightの<span class="text-[#0398fa] px-1">Pixiv</span>收藏夹
      </div>
      <div class="absolute top-0 right-0 hidden lg:block">
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
import { useStore } from '@/store'
import { githubLink } from '@/config'

const store = useStore()
const { darkMode, showSidebar, showNav, imageViewerShow, isFullscreen } = toRefs(store)

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
</script>
