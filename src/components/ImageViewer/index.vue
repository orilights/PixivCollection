<template>
  <Transition name="fade">
    <div
      v-show="imageViewerShow"
      class="fixed top-0 left-0 w-full h-screen bg-black/30"

      @wheel.prevent="handleWheelScroll"
    >
      <div class="absolute z-50 top-2 left-2">
        <button
          class="bg-black/40 hover:bg-black/30 dark:hover:bg-white/10 text-white text-center w-[60px] h-[60px] rounded-full transition-colors"
          @click="restoreImage"
        >
          <IconTablet class="mx-auto w-7 h-7" />
        </button>
        <Transition name="fade">
          <div
            v-if="loadingImage"
            class="bg-black/40 text-white w-[60px] h-[60px] rounded-full transition-colors flex items-center justify-center mt-2"
          >
            <img src="@/assets/loading.svg" class="w-7 h-7">
          </div>
        </Transition>
      </div>
      <button
        class="bg-black/40 hover:bg-black/30 dark:hover:bg-white/10 text-white absolute top-2 right-2 text-center w-[60px] h-[60px] rounded-full transition-colors z-50"
        @click="store.closeImageViewer()"
      >
        <IconClose class="mx-auto w-7 h-7" />
      </button>
      <button
        class="bg-black/40 hover:bg-black/30 dark:hover:bg-white/10 text-white absolute left-2 top-[calc(50%-40px)] w-[60px] h-[60px] rounded-full transition-colors z-50"
        @click="store.imageViewerPrev()"
      >
        <IconLeft class="w-6 h-6 mx-auto stroke-2 -translate-x-0.5" />
      </button>
      <button
        class="bg-black/40 hover:bg-black/30 dark:hover:bg-white/10 text-white absolute right-2 top-[calc(50%-40px)] w-[60px] h-[60px] rounded-full transition-colors z-50"
        @click="store.imageViewerNext()"
      >
        <IconRight class="w-6 h-6 mx-auto stroke-2 translate-x-0.5" />
      </button>
      <div class="relative">
        <img
          :src="imageSrc"
          class="absolute select-none max-w-none cursor-grab active:cursor-grabbing touch-none"
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
import { useMouse } from '@vueuse/core'
import { useStore } from '@/store'
import { imageFormat, imagePath } from '@/config'

const store = useStore()
const { imageViewerShow, imageViewerInfo } = toRefs(store)

const imageRatio = ref(1)
const imagePos = ref({ x: 0, y: 0 })
const imageGragging = ref(false)
const imageSrc = ref('')
const mouseRef = useMouse({ type: 'client' })
const loadingImage = ref(false)
const loadingImageId = ref('')

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
  if (imageLoader)
    imageLoader.remove()
  imageSrc.value = ''

  loadingImage.value = true
  loadingImageId.value = `${val.id}_${val.part}`

  imageLoader = new Image()
  imageLoader.addEventListener('load', () => {
    if (`${val.id}_${val.part}` === loadingImageId.value)
      loadingImage.value = false
  })
  imageLoader.src = `${imagePath}${val.id}_p${val.part}.${imageFormat}`

  nextTick(() => {
    imageSrc.value = imageLoader.src
  })

  restoreImage()
})

function restoreImage() {
  if (imageViewerInfo.value.size[0] <= 2000 && imageViewerInfo.value.size[1] <= 2000) {
    imageSize.width = imageViewerInfo.value.size[0]
    imageSize.height = imageViewerInfo.value.size[1]
  }
  else {
    if (imageViewerInfo.value.size[0] > imageViewerInfo.value.size[1]) {
      imageSize.width = 2000
      imageSize.height = Math.round(imageViewerInfo.value.size[1] * 2000 / imageViewerInfo.value.size[0])
    }
    else {
      imageSize.width = Math.round(imageViewerInfo.value.size[0] * 2000 / imageViewerInfo.value.size[1])
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

function handleZoom(newRatio: number, centerPostiion: { x: number; y: number }, touch = false) {
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
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
