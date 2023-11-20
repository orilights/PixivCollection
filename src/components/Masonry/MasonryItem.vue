<template>
  <div
    class="group absolute overflow-hidden bg-gray-100 transition-all duration-300 dark:bg-[#242424]"
    :class="{
      'rounded-[12px] border dark:border-[#505050] ': border,
      'shadow-[0_3px_10px_1px_rgba(0,0,0,0.20)]': shadow && border,
    }"
  >
    <div
      class="relative"
      :style="{
        height: `${imageHeight}px`,
      }"
    >
      <Transition name="fade-slow">
        <div
          v-show="!imageLoaded"
          class="absolute h-full w-full"
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
          class="cursor-pointer truncate font-bold transition-colors hover:text-blue-500"
          @click="openPixiv(imageData.id)"
        >
          {{ imageData.title }}
        </p>
        <p class="flex cursor-pointer items-center">
          <span
            class="truncate text-sm transition-colors hover:text-blue-500"
            @click="openPixivUser(imageData.author.id)"
          >{{ imageData.author.name }}</span>
          <IconFunnelSolid
            class="ml-1 inline-block h-3 w-3 transition-colors hover:text-blue-500"
            @click="$emit('filterAuthor', imageIndex)"
          />
        </p>
        <p class="mx-[-4px] h-[50px] overflow-y-auto">
          <span
            v-for="tag, idx in imageData.tags"
            v-show="!tag.name.includes('users入り') || tagIncludeBookmark" :key="idx"
            class="float-left m-0.5 rounded-sm bg-black/10 px-1 text-xs"
            :class="tag.name === 'R-18' ? '!bg-red-500/60' : ''"
          >
            {{ tagTranslation ? tag.translated_name || tag.name : tag.name }}
          </span>
        </p>
        <p class="mt-0.5 flex items-center whitespace-nowrap text-left text-xs text-gray-500">
          {{ imageData.id }}
          {{ `p${imageData.part}` }}
          {{ `${imageData.size[0]}×${imageData.size[1]}` }}
          {{ `sl${imageData.sanity_level}` }}
          {{ imageData.bookmark }}
        </p>
      </div>
    </Transition>
    <div
      v-if="showNo"
      class="absolute top-0 rounded-br-[12px] bg-black/60 px-2 text-white"
    >
      {{ imageIndex + 1 }}
    </div>
    <div
      v-if="!infoAtBottom"
      class="absolute top-0 h-full w-full cursor-pointer bg-black/50 px-2 pt-2 text-sm text-white opacity-0 transition-all group-hover:opacity-100"
      @click="$emit('viewImage', imageIndex)"
    >
      <p class="flex whitespace-nowrap">
        标题：<span
          class="overflow-hidden text-ellipsis transition-colors hover:text-blue-500"
          @click.stop="openPixiv(imageData.id)"
        >{{ imageData.title }}</span>
      </p>
      <p class="flex items-center whitespace-nowrap">
        作者：<span
          class="overflow-hidden text-ellipsis transition-colors hover:text-blue-500"
          @click.stop="openPixivUser(imageData.author.id)"
        >{{ imageData.author.name }}</span>
        <IconFunnelSolid
          class="ml-1 inline-block h-3 w-3 transition-colors hover:text-blue-500"
          @click.stop="$emit('filterAuthor', imageIndex)"
        />
      </p>
      <p>
        标签：<span
          v-for="tag, idx in imageData.tags"
          v-show="!tag.name.includes('users入り') || tagIncludeBookmark"
          :key="idx"
          class="mx-1 my-0.5 inline-block rounded-sm bg-black/30 px-1 text-xs"
          :class="tag.name === 'R-18' ? 'bg-red-500/80' : ''"
        >
          {{ tagTranslation ? tag.translated_name || tag.name : tag.name }}
        </span>
      </p>
      <p class="mt-1 text-xs">
        {{ `${imageData.id} p${imageData.part} ${imageData.bookmark} ${imageData.size[0]}×${imageData.size[1]} sl${imageData.sanity_level}` }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IMAGE_FORMAT_THUMBNAIL, IMAGE_PATH_THUMBNAIL, MASONRY_LOAD_DELAY } from '@/config'
import { useStore } from '@/store'
import { openPixiv, openPixivUser } from '@/utils'

const props = defineProps<{
  imageData: Image
  imageIndex: number
  imageHeight: number
  infoAtBottom: boolean
  tagIncludeBookmark: boolean
  tagTranslation: boolean
  showNo: boolean
  shadow: boolean
  border: boolean
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
