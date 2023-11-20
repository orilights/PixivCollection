<template>
  <div class="h-[60px]">
    <div
      class="fixed left-0 top-0 z-10 h-[60px] w-full bg-white shadow-md transition-[transform,background] dark:bg-[#202020]"
      :class="{
        'translate-y-[-70px]': (!showNav || imageViewer.show) && !showSidebar,
      }"
    >
      <div
        class="absolute left-0 top-0 flex"
        :class="{
          'w-full': filterConfig.search.enable,
        }"
      >
        <button
          class="h-[60px] w-[60px] hover:bg-gray-400/20"
          @click="showSidebar = !showSidebar"
        >
          <IconMenu class="mx-auto h-7 w-7" />
        </button>
        <button
          class="hidden h-[60px] w-[60px] hover:bg-gray-400/20 sm:block"
          @click="store.toggleSearch"
        >
          <IconSearch v-if="!filterConfig.search.enable" class="mx-auto h-6 w-6" />
          <IconClose v-else class="mx-auto h-6 w-6" />
        </button>
        <div v-show="filterConfig.search.enable" class="mr-[60px] flex-1 sm:mr-0">
          <input
            class="box-border h-[60px] w-full border-x border-gray-400/50 bg-transparent px-4 outline-none"
            type="text"
            placeholder="图片id/图片标题/作者id/作者昵称/标签"
            :value="filterConfig.search.value"
            @input="handleSearchInput"
          >
        </div>
      </div>
      <button
        class="absolute right-0 block h-[60px] w-[60px] hover:bg-gray-400/20 sm:hidden"
        @click="store.toggleSearch"
      >
        <IconSearch v-if="!filterConfig.search.enable" class="mx-auto h-6 w-6" />
        <IconClose v-else class="mx-auto h-6 w-6" />
      </button>
      <div
        v-show="!filterConfig.search.enable"
        class="mx-[60px] h-[60px] select-none text-center text-lg leading-[60px]"
        @dblclick="navToTop"
      >
        OriLightの<span class="px-1 text-[#0398fa]">Pixiv</span>收藏夹
      </div>
      <div class="absolute right-0 top-0 hidden lg:flex">
        <button
          class="h-[60px] w-[60px] hover:bg-gray-400/20"
          @click="openGithub"
        >
          <IconGithub class="mx-auto h-6 w-6" />
        </button>
        <button
          class="h-[60px] w-[60px] hover:bg-gray-400/20"
          @click="store.toggleColorScheme"
        >
          <IconSun v-if="preferColorScheme === 'light'" class="mx-auto h-6 w-6" />
          <IconMoon v-if="preferColorScheme === 'dark'" class="mx-auto h-5 w-5" />
          <IconAuto v-if="preferColorScheme === 'auto'" class="mx-auto h-5 w-5" />
        </button>
        <button
          class="h-[60px] w-[60px] hover:bg-gray-400/20"
          @click="store.toggleFullscreen"
        >
          <IconShrink v-if="isFullscreen" class="mx-auto h-5 w-5" />
          <IconExpand v-else class="mx-auto h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { useStore } from '@/store'
import { LINK_GITHUB, NAVBAR_HIDE_DISTANCE } from '@/config'

const store = useStore()
const { preferColorScheme, showSidebar, showNav, imageViewer, isFullscreen, filterConfig } = toRefs(store)

const updateSearchStr = useDebounceFn((value) => {
  store.updateSeatchValue(value)
}, 300)

let oldY = 0

onMounted(() => {
  window.addEventListener('scroll', () => {
    const newY = document.documentElement.scrollTop
    if (newY > oldY && newY > NAVBAR_HIDE_DISTANCE)
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
  window.open(LINK_GITHUB, '_blank')
}

function handleSearchInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  updateSearchStr(value)
}
</script>
