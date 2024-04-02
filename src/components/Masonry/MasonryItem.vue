<template>
  <div
    class="group absolute overflow-hidden bg-gray-100 transition-all duration-300 dark:bg-[#242424]"
    :class="{
      'rounded-[12px] border dark:border-[#505050] ': config.border,
      'shadow-[0_3px_10px_1px_rgba(0,0,0,0.20)]': config.shadow && config.border,
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
          class="absolute size-full"
          :style="{
            backgroundColor: imageData.dominant_color,
          }"
        />
      </Transition>
      <img
        class="w-full cursor-pointer"
        :src="imageLoad ? `${IMAGE_PATH_THUMBNAIL}${imageData.id}_p${imageData.part}.${IMAGE_FORMAT_THUMBNAIL}` : ''"
        @load="handleImageLoaded"
        @click="useStore().viewImage(imageIndex)"
      >
    </div>
    <Transition name="fade">
      <ImageInfo
        v-if="config.infoAtBottom"
        :image-data="imageData"
        :image-index="imageIndex"
        :config="config"
        mode="bottom"
      />
    </Transition>
    <div
      v-if="imageCount > 1"
      class="absolute right-1 top-1 flex items-center rounded-full bg-black/50 px-2 py-0.5 text-sm text-white"
    >
      <IconStack class="mr-1 size-3" />
      {{ imageCount }}
    </div>
    <ImageInfo
      v-if="!config.infoAtBottom"
      class="absolute top-0 size-full cursor-pointer bg-black/50 opacity-0 transition-all duration-300 group-hover:opacity-100"
      :image-data="imageData"
      :image-index="imageIndex"
      :config="config"
      mode="cover"
      @click="useStore().viewImage(imageIndex)"
    />
  </div>
</template>

<script setup lang="ts">
import {
  IMAGE_FORMAT_THUMBNAIL,
  IMAGE_PATH_THUMBNAIL,
  MASONRY_LOAD_DELAY,
} from '@/config'
import { useStore } from '@/store'

const props = defineProps<{
  imageData: Image
  imageIndex: number
  imageHeight: number
  imageCount: number
  config: MasonryItemConfig
}>()

let timer: NodeJS.Timeout | null = null

const imageLoad = ref(false)
const imageLoaded = ref(false)

const imageIdxStr = `${props.imageData.id * 100 + props.imageData.part}`

onMounted(() => {
  if (useStore().imagesLoaded.has(imageIdxStr)) {
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
  useStore().imagesLoaded.add(imageIdxStr)
}
</script>
