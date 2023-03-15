<template>
  <div class="h-[60px] mb-2">
    <div
      class="fixed top-0 left-0 w-full h-[60px] z-10 bg-white dark:bg-[#202020] transition-[transform,background] shadow-md"
      :class="{
        'translate-y-[-70px]': !showNav || showImageViewer,
      }"
    >
      <div class="absolute top-0 left-0">
        <button class="w-[60px] h-[60px] hover:bg-gray-400/20" @click="showSidebar = !showSidebar">
          <svg
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="w-7 h-7 mx-auto"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>
      <div class="text-lg h-[60px] leading-[60px] select-none text-center" @dblclick="navToTop">
        OriLightの<span class="text-[#0398fa] px-1">Pixiv</span>收藏夹
      </div>
      <div class="absolute top-0 right-0">
        <button
          class="w-[60px] h-[60px] hover:bg-gray-400/20"
          @click="openGithub"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 1024 1024" stroke="currentColor"
            class="w-6 h-6 mx-auto"
          >
            <path
              d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c0.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"
            />
          </svg>
        </button>
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

function openGithub() {
  window.open('https://github.com/orilights/PixivCollection')
}
</script>
