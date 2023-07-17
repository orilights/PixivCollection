<template>
  <div
    class="absolute bg-gray-100 overflow-hidden transition-all duration-300 group dark:bg-[#242424]"
    :class="{
      'rounded-[12px] shadow-[0_3px_10px_1px_rgba(0,0,0,0.20)]': shadow,
    }"
  >
    <div
      class="relative"
      :style="{
        height: `${imageHeight}px`,
      }"
    >
      <Transition name="fade">
        <div
          v-show="!imageLoaded"
          class="absolute w-full h-full"
          :style="{
            backgroundColor: imageData.dominant_color,
          }"
        />
      </Transition>
      <img
        class="w-full cursor-pointer"
        :src="imageLoad ? `${IMAGE_PATH_THUMBNAIL}${imageData.id}_p${imageData.part}.${IMAGE_FORMAT_THUMBNAIL}` : ''"
        @load="handleImageLoaded"
        @click="$emit('viewImage', imageIndex)"
      >
    </div>
    <Transition name="fade">
      <div
        v-if="infoAtBottom"
        class="w-full px-2 py-1"
      >
        <p
          class="overflow-hidden font-bold transition-colors cursor-pointer hover:text-blue-500 whitespace-nowrap overflow-ellipsis"
          @click="openPixiv(imageData.id)"
        >
          {{ imageData.title }}
        </p>
        <p class="flex items-center cursor-pointer">
          <span
            class="overflow-hidden text-sm transition-colors hover:text-blue-500 whitespace-nowrap overflow-ellipsis"
            @click="openPixivUser(imageData.author.id)"
          >{{ imageData.author.name }}</span>
          <IconFunnelSolid
            class="inline-block w-3 h-3 ml-1 transition-colors hover:text-blue-500"
            @click="$emit('filterAuthor', imageIndex)"
          />
        </p>
        <p class="overflow-y-auto h-[50px] mx-[-4px]">
          <span
            v-for="tag, idx in imageData.tags"
            v-show="!tag.name.includes('users入り') || tagIncludeBookmark" :key="idx"
            class="px-1 mx-0.5 my-0.5 float-left bg-black/10 rounded-sm text-xs"
            :class="tag.name === 'R-18' ? '!bg-red-500/60' : ''"
          >
            {{ tagTranslation ? tag.translated_name || tag.name : tag.name }}
          </span>
        </p>
        <p class="text-xs text-left text-gray-500 flex items-center mt-0.5 whitespace-nowrap">
          {{ imageData.id }}
          {{ `p${imageData.part}` }}
          {{ `${imageData.size[0]}×${imageData.size[1]}` }}
          {{ `sl${imageData.sanity_level}` }}
        </p>
      </div>
    </Transition>
    <div
      v-if="showNo"
      class="absolute top-0 bg-black/60 text-white px-2 rounded-br-[12px]"
    >
      {{ imageIndex + 1 }}
    </div>
    <div
      v-if="!infoAtBottom"
      class="absolute top-0 w-full h-full px-2 pt-10 text-sm text-white transition-all opacity-0 cursor-pointer bg-black/50 group-hover:opacity-100"
      @click="$emit('viewImage', imageIndex)"
    >
      <div class="absolute top-1.5 right-1.5 text-right text-xs">
        {{ `${imageData.id} p${imageData.part}` }} <br>{{ `${imageData.size[0]}×${imageData.size[1]} sl${imageData.sanity_level}` }}
      </div>
      <p class="flex whitespace-nowrap">
        标题：<span
          class="overflow-hidden transition-colors hover:text-blue-500 overflow-ellipsis"
          @click.stop="openPixiv(imageData.id)"
        >{{ imageData.title }}</span>
      </p>
      <p class="flex items-center whitespace-nowrap">
        作者：<span
          class="overflow-hidden transition-colors hover:text-blue-500 overflow-ellipsis"
          @click.stop="openPixivUser(imageData.author.id)"
        >{{ imageData.author.name }}</span>
        <IconFunnelSolid
          class="inline-block w-3 h-3 ml-1 transition-colors hover:text-blue-500"
          @click.stop="$emit('filterAuthor', imageIndex)"
        />
      </p>
      <p>
        标签：<span
          v-for="tag, idx in imageData.tags"
          v-show="!tag.name.includes('users入り') || tagIncludeBookmark"
          :key="idx"
          class="px-1 mx-1 my-0.5 inline-block bg-black/30 rounded-sm text-xs"
          :class="tag.name === 'R-18' ? 'bg-red-500/80' : ''"
        >
          {{ tagTranslation ? tag.translated_name || tag.name : tag.name }}
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MASONRY_LOAD_DELAY, IMAGE_FORMAT_THUMBNAIL, IMAGE_PATH_THUMBNAIL } from '@/config'
import { useStore } from '@/store'
import { openPixiv, openPixivUser } from '@/utils'

const props = defineProps<{
  imageData: Image
  imageIndex: number
  imageHeight: number
  shadow: boolean
  showNo: boolean
  infoAtBottom: boolean
  tagIncludeBookmark: boolean
  tagTranslation: boolean
}>()

defineEmits(['viewImage', 'filterAuthor'])

let timer: NodeJS.Timeout | null = null

const store = useStore()
const imageLoad = ref(false)
const imageLoaded = ref(false)

onMounted(() => {
  if (store.imagesLoaded.includes(`${props.imageData.id * 100 + props.imageData.part}`)) {
    imageLoad.value = true
    return
  }
  timer = setTimeout(() => {
    imageLoad.value = true
    timer = null
  }, MASONRY_LOAD_DELAY)
})

onUnmounted(() => {
  if (timer)
    clearTimeout(timer)
})

function handleImageLoaded() {
  imageLoaded.value = true
  if (!store.imagesLoaded.includes(`${props.imageData.id * 100 + props.imageData.part}`))
    store.imagesLoaded.push(`${props.imageData.id * 100 + props.imageData.part}`)
}
</script>
