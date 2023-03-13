<template>
  <div class="h-[60px] mb-2">
    <div
      class="fixed top-0 left-0 w-full h-[60px] flex items-center justify-between z-10 bg-white dark:bg-[#202020] transition-[transform,background] shadow-md"
      :class="{
        'translate-y-[-70px]': !showNav || showImageViewer,
      }"
    >
      <button class="w-[60px] h-[60px] hover:bg-gray-400/20" @click="showSidebar = !showSidebar">
        <svg
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-7 h-7 mx-auto"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      <div class="text-lg h-[60px] leading-[60px] select-none" @dblclick="navToTop">
        OriLightの<span class="text-[#0398fa] px-1">Pixiv</span>收藏夹
      </div>
      <button
        class="w-[60px] h-[60px] hover:bg-gray-400/20"
        @click="darkMode = !darkMode"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-5 h-5 mx-auto"
        >
          <path
            stroke-linecap="round" stroke-linejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/store'

const store = useStore()
const { darkMode, showSidebar, showNav, showImageViewer } = toRefs(store)

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
</script>
