<template>
  <Transition name="fade">
    <div
      v-show="imageViewer.show"
      class="fixed left-0 top-0 h-screen w-full bg-black/50 backdrop-blur-lg"

      @wheel.prevent="handleWheelScroll"
    >
      <div class="absolute left-2 top-2 z-50 flex gap-2">
        <div class="flex flex-col gap-2">
          <button
            class="h-[60px] w-[60px] rounded-full bg-black/40 text-center text-white transition-colors hover:bg-gray-900/40"
            title="复位图片"
            @click="restoreImage"
          >
            <IconTablet class="mx-auto h-7 w-7" />
          </button>
          <button
            class="h-[60px] w-[60px] rounded-full bg-black/40 text-center text-white transition-colors hover:bg-gray-900/40"
            title="显示图片信息"
            @click="imageViewer.showInfo = !imageViewer.showInfo"
          >
            <IconInfo class="mx-auto h-7 w-7" />
          </button>
          <button
            class="h-[60px] w-[60px] rounded-full bg-black/40 text-center text-white transition-colors hover:bg-gray-900/40"
            title="下载原图"
            @click="downloadImage"
          >
            <IconDownload class="mx-auto h-7 w-7" />
          </button>
          <div
            v-if="loadingImage"
            class="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-black/40 text-white transition-colors"
          >
            <IconLoading class="h-7 w-7" :dark="false" />
          </div>
        </div>
        <Transition name="popup">
          <div
            v-if="imageViewer.info && imageViewer.showInfo"
            class="fixed bottom-0 left-0 h-fit w-full rounded-t-[30px] bg-black/40 p-4 pb-10 text-white backdrop-blur-md sm:relative sm:w-[300px] sm:rounded-b-[30px]"
          >
            <p
              class="cursor-pointer truncate font-bold transition-colors hover:text-blue-500"
              @click="openPixivIllust(imageViewer.info.id)"
            >
              {{ imageViewer.info.title }}
            </p>
            <p
              class="cursor-pointer truncate text-sm transition-colors hover:text-blue-500"
              @click="openPixivUser(imageViewer.info.author.id)"
            >
              {{ imageViewer.info.author.name }}
            </p>
            <p class="mt-2">
              <span
                v-for="tag, idx in imageViewer.info.tags"
                v-show="!tag.name.includes('users入り') || filterConfig.tag.includeBookmark" :key="idx"
                class="float-left m-0.5 rounded-sm bg-black/30 px-1 text-xs"
                :class="tag.name === 'R-18' ? '!bg-red-500/60' : ''"
              >
                {{ masonryConfig.showTagTranslation ? tag.translated_name || tag.name : tag.name }}
              </span>
            </p>
            <p class="absolute bottom-4 left-4 text-xs text-gray-300">
              <span :title="formatTime(imageViewer.info.created_at)">{{ imageViewer.info.id }}</span>
              {{ `p${imageViewer.info.part}` }}
              {{ `${imageViewer.info.size[0]}×${imageViewer.info.size[1]}` }}
              {{ `sl${imageViewer.info.sanity_level}` }}
              {{ `${imageViewer.info.bookmark}` }}
            </p>
          </div>
        </Transition>
      </div>
      <button
        class="absolute right-2 top-2 z-50 h-[60px] w-[60px] rounded-full bg-black/40 text-center text-white transition-colors hover:bg-gray-900/40"
        title="关闭图片浏览器"
        @click="store.closeImageViewer()"
      >
        <IconClose class="mx-auto h-7 w-7" />
      </button>
      <button
        class="absolute left-2 top-[calc(50%-40px)] z-50 h-[60px] w-[60px] rounded-full bg-black/40 text-white transition-colors hover:bg-gray-900/40"
        title="上一张"
        @click="store.imageViewer.prev()"
      >
        <IconLeft class="mx-auto h-6 w-6 -translate-x-0.5 stroke-2" />
      </button>
      <button
        class="absolute right-2 top-[calc(50%-40px)] z-50 h-[60px] w-[60px] rounded-full bg-black/40 text-white transition-colors hover:bg-gray-900/40"
        title="下一张"
        @click="store.imageViewer.next()"
      >
        <IconRight class="mx-auto h-6 w-6 translate-x-0.5 stroke-2" />
      </button>
      <div class="relative">
        <img
          :src="imageSrc"
          class="absolute max-w-none cursor-grab touch-none select-none active:cursor-grabbing"
          :class="{
            '': !imageGragging,
          }"
          :style="{
            transform: `scale(${imageRatio})`,
            left: `${imagePos.x}px`,
            top: `${imagePos.y}px`,
          }"
          @mousedown.prevent="handleMouseDragStart"
          @touchstart.prevent="handleTouchStart"
        >
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useMouse, useWindowSize } from '@vueuse/core'
import { useStore } from '@/store'
import { IMAGE_FORMAT_PREVIEW, IMAGE_PATH_ORIGINAL, IMAGE_PATH_PREVIEW } from '@/config'
import { formatTime, openPixivIllust, openPixivUser } from '@/utils'

const store = useStore()
const { imageViewer, filterConfig, masonryConfig } = toRefs(store)
const { show: imageViewerShow, info: imageViewerInfo } = toRefs(imageViewer.value)

const imageRatio = ref(1)
const imagePos = ref({ x: 0, y: 0 })
const imageGragging = ref(false)
const imageSrc = ref('')
const mouseRef = useMouse({ type: 'client' })
const loadingImage = ref(false)
const loadingImageId = ref('')
const windowSize = reactive(useWindowSize())

const touchStartPosition = { x: 0, y: 0 }
const touchCenterPosition = { x: 0, y: 0 }
const minRatio = 0.3
let startDistance = 0
let initialRatio = 0
let imageLoader: HTMLImageElement
const imageSize = { width: 0, height: 0 }

watch(imageViewerShow, (val) => {
  if (!val) {
    if (imageLoader)
      imageLoader.remove()

    loadingImage.value = false
  }
  else {
    restoreImage()
  }
})

watch(imageViewerInfo, (val) => {
  if (!val)
    return
  if (imageLoader)
    imageLoader.remove()
  imageSrc.value = ''

  loadingImage.value = true
  loadingImageId.value = `${val.id}_${val.part}`

  imageLoader = new Image()
  imageLoader.addEventListener('load', () => {
    if (`${val.id}_${val.part}` === loadingImageId.value) {
      loadingImage.value = false
      preloadNearbyImage(imageViewer.value.index)
    }
  })
  imageLoader.src = `${IMAGE_PATH_PREVIEW}${val.id}_p${val.part}.${IMAGE_FORMAT_PREVIEW}`

  nextTick(() => {
    imageSrc.value = imageLoader.src
  })

  restoreImage()
})

watch(windowSize, () => {
  if (!imageViewer.value.show)
    return
  nextTick(() => {
    restoreImage()
  })
})

function preloadNearbyImage(index: number) {
  if (index - 1 >= 0) {
    const imageUrl = `${IMAGE_PATH_PREVIEW}${store.imagesFiltered[index - 1].id}_p${store.imagesFiltered[index - 1].part}.${IMAGE_FORMAT_PREVIEW}`
    const imageLoader = new Image()
    imageLoader.src = imageUrl
  }
  if (index + 1 < store.imagesFiltered.length) {
    const imageUrl = `${IMAGE_PATH_PREVIEW}${store.imagesFiltered[index + 1].id}_p${store.imagesFiltered[index + 1].part}.${IMAGE_FORMAT_PREVIEW}`
    const imageLoader = new Image()
    imageLoader.src = imageUrl
  }
}

function restoreImage() {
  if (!imageViewer.value.info)
    return
  if (imageViewer.value.info.size[0] <= 2000 && imageViewer.value.info.size[1] <= 2000) {
    imageSize.width = imageViewer.value.info.size[0]
    imageSize.height = imageViewer.value.info.size[1]
  }
  else {
    if (imageViewer.value.info.size[0] > imageViewer.value.info.size[1]) {
      imageSize.width = 2000
      imageSize.height = Math.round(imageViewer.value.info.size[1] * 2000 / imageViewer.value.info.size[0])
    }
    else {
      imageSize.width = Math.round(imageViewer.value.info.size[0] * 2000 / imageViewer.value.info.size[1])
      imageSize.height = 2000
    }
  }
  // 计算图片初始显示比率
  const ratioWidth = window.innerWidth / imageSize.width
  const ratioHeight = window.innerHeight / imageSize.height
  initialRatio = Math.min(ratioWidth, ratioHeight)
  imageRatio.value = initialRatio
  // 计算图片初始显示位置
  imagePos.value.x = (window.innerWidth - imageSize.width) / 2
  imagePos.value.y = (window.innerHeight - imageSize.height) / 2
}

function handleMouseDragStart() {
  imageGragging.value = true

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseDragEnd)
  window.addEventListener('mouseleave', handleMouseDragEnd)
}

function handleMouseMove(e: MouseEvent) {
  imagePos.value.x += e.movementX
  imagePos.value.y += e.movementY
}

function handleMouseDragEnd() {
  imageGragging.value = false

  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseDragEnd)
  window.removeEventListener('mouseleave', handleMouseDragEnd)
}

function handleTouchStart(e: TouchEvent) {
  if (e.touches.length < 2) {
    imageGragging.value = true
    touchStartPosition.x = e.touches[0].clientX
    touchStartPosition.y = e.touches[0].clientY
  }
  else {
    const deltaX = e.touches[0].clientX - e.touches[1].clientX
    const deltaY = e.touches[0].clientY - e.touches[1].clientY
    startDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    touchCenterPosition.x = (e.touches[0].clientX + e.touches[1].clientX) / 2
    touchCenterPosition.y = (e.touches[0].clientY + e.touches[1].clientY) / 2
  }

  window.addEventListener('touchmove', handleTouchMove)
  window.addEventListener('touchend', handleTouchEnd)
}

function handleTouchMove(e: TouchEvent) {
  if (e.touches.length < 2) {
    const deltaX = e.touches[0].clientX - touchStartPosition.x
    const deltaY = e.touches[0].clientY - touchStartPosition.y
    imagePos.value.x += deltaX
    imagePos.value.y += deltaY
    touchStartPosition.x = e.touches[0].clientX
    touchStartPosition.y = e.touches[0].clientY
  }
  else {
    const deltaX = e.touches[0].clientX - e.touches[1].clientX
    const deltaY = e.touches[0].clientY - e.touches[1].clientY
    const centerPostiion = {
      x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
      y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
    }
    const newDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const delta = newDistance / startDistance
    startDistance = newDistance
    let newRatio = imageRatio.value * delta
    if (newRatio < initialRatio * minRatio)
      newRatio = initialRatio * minRatio
    handleZoom(newRatio, centerPostiion, true)
  }
}

function handleTouchEnd() {
  imageGragging.value = false

  window.removeEventListener('touchmove', handleTouchMove)
}

function handleWheelScroll(e: WheelEvent) {
  const delta = e.deltaY / 1000
  let newRatio
  if (delta > 0)
    newRatio = imageRatio.value - delta
  else
    newRatio = imageRatio.value - delta
  if (newRatio < initialRatio * minRatio)
    newRatio = initialRatio * minRatio
  handleZoom(newRatio, { x: mouseRef.x.value, y: mouseRef.y.value })
}

function handleZoom(newRatio: number, centerPostiion: { x: number, y: number }, touch = false) {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const deltaX = centerPostiion.x - (imagePos.value.x - ((windowWidth - imageSize.width) / 2) + windowWidth / 2)
  const deltaY = centerPostiion.y - (imagePos.value.y - ((windowHeight - imageSize.height) / 2) + windowHeight / 2)
  if (touch) {
    imagePos.value.x -= (newRatio / imageRatio.value - 1) * deltaX + (touchCenterPosition.x - centerPostiion.x)
    imagePos.value.y -= (newRatio / imageRatio.value - 1) * deltaY + (touchCenterPosition.y - centerPostiion.y)
    touchCenterPosition.x = centerPostiion.x
    touchCenterPosition.y = centerPostiion.y
  }
  else {
    imagePos.value.x -= (newRatio / imageRatio.value - 1) * deltaX
    imagePos.value.y -= (newRatio / imageRatio.value - 1) * deltaY
  }

  imageRatio.value = newRatio
}

function downloadImage() {
  if (!imageViewer.value.info)
    return
  const link = document.createElement('a')
  link.target = '_blank'
  link.href = `${IMAGE_PATH_ORIGINAL}${imageViewer.value.info.id}_p${imageViewer.value.info.part}.${imageViewer.value.info.ext}`
  link.click()
}
</script>
