<template>
  <Transition name="fade">
    <div
      v-if="imageViewerShow" class="fixed top-0 left-0 w-screen h-screen bg-black/30"
      @mousemove="imageGragging && (imagePos.x += $event.movementX, imagePos.y += $event.movementY)"
      @mouseup="imageGragging = false" @mouseleave="imageGragging = false"
      @touchmove="imageGragging && handleTouchMove($event)" @wheel="handleWheelScroll"
      @touchend="imageGragging = false"
    >
      <button
        class="bg-black/40 text-white absolute top-0 left-0 text-center w-[40px] h-[40px] z-50"
        @click="restoreImage"
      >
        <IconTablet class="w-6 h-6 mx-auto" />
      </button>
      <button
        class="bg-black/40 text-white absolute top-0 right-0 text-center w-[40px] h-[40px] z-50"
        @click="store.closeImageViewer()"
      >
        <IconClose class="w-6 h-6 mx-auto" />
      </button>
      <Transition name="hide-left">
        <button
          v-show="!imageGragging"
          class="bg-black/40 text-white absolute left-0 top-[calc(50vh-40px)] w-[40px] h-[80px] z-50"
          @click="store.imageViewerPrev()"
        >
          <IconLeft class="w-6 h-6 mx-auto" />
        </button>
      </Transition>
      <Transition name="hide-right">
        <button
          v-show="!imageGragging"
          class="bg-black/40 text-white absolute right-0 top-[calc(50vh-40px)] w-[40px] h-[80px] z-50"
          @click="store.imageViewerNext()"
        >
          <IconRight class="w-6 h-6 mx-auto" />
        </button>
      </Transition>
      <div class="relative">
        <img
          :src="imageSrc"
          class="max-w-none cursor-grab active:cursor-grabbing select-none touch-none absolute" :class="{
            '': !imageGragging,
          }" :style="{
            transform: `scale(${imageRatio})`,
            left: `${imagePos.x}px`,
            top: `${imagePos.y}px`,
          }"
          @touchstart.prevent="handleTouchStart" @mousedown.prevent="imageGragging = true"
        >
        <img v-show="loading" src="@/assets/loading.svg" class="absolute top-[calc(50vh-19px)] left-[calc(50vw-19px)]">
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useMouse } from '@vueuse/core'
import { useStore } from '@/store'
import { originalImageHost } from '@/config'

const store = useStore()
const { imageViewerShow, imageViewerInfo } = toRefs(store)

const imageRatio = ref(1)
const imagePos = ref({ x: 0, y: 0 })
const imageGragging = ref(false)
const imageSrc = ref('')
const mouse = useMouse({ type: 'client' })
const loading = ref(false)

const startPosition = { x: 0, y: 0 }
const minRatio = 0.5
let startDistance = 0
let initialRatio = 0
let imageLoader: HTMLImageElement

watch(imageViewerShow, (val) => {
  if (!val) {
    if (imageLoader)
      imageLoader.remove()

    loading.value = false
    document.body.style.overflow = 'visible'
  }
})

watch(imageViewerInfo, (val) => {
  if (imageLoader)
    imageLoader.remove()
  imageSrc.value = ''

  loading.value = true
  imageLoader = new Image()
  imageLoader.addEventListener('load', () => {
    loading.value = false
  })
  imageLoader.src = resolvePath(val.original)
  nextTick(() => {
    imageSrc.value = imageLoader.src
  })
  document.body.style.overflow = 'hidden'

  restoreImage()
})

function restoreImage() {
  // 计算图片初始显示比率
  const ratioWidth = window.innerWidth / imageViewerInfo.value.size[0]
  const ratioHeight = window.innerHeight / imageViewerInfo.value.size[1]
  initialRatio = Math.min(ratioWidth, ratioHeight)
  imageRatio.value = initialRatio
  // 计算图片初始显示位置
  imagePos.value.x = (window.innerWidth - imageViewerInfo.value.size[0]) / 2
  imagePos.value.y = (window.innerHeight - imageViewerInfo.value.size[1]) / 2
}

function handleTouchStart(e: TouchEvent) {
  if (e.touches.length < 2) {
    imageGragging.value = true
    startPosition.x = e.touches[0].clientX
    startPosition.y = e.touches[0].clientY
  }
  else {
    const deltaX = e.touches[0].clientX - e.touches[1].clientX
    const deltaY = e.touches[0].clientY - e.touches[1].clientY
    startDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }
}

function handleTouchMove(e: TouchEvent) {
  if (e.touches.length < 2) {
    const deltaX = e.touches[0].clientX - startPosition.x
    const deltaY = e.touches[0].clientY - startPosition.y
    imagePos.value.x += deltaX
    imagePos.value.y += deltaY
    startPosition.x = e.touches[0].clientX
    startPosition.y = e.touches[0].clientY
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
    handleZoom(newRatio, centerPostiion)
  }
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
  handleZoom(newRatio, { x: mouse.x.value, y: mouse.y.value })
}

function handleZoom(newRatio: number, centerPostiion: { x: number; y: number }) {
  const wWidth = window.innerWidth
  const wHeight = window.innerHeight
  const deltaX = centerPostiion.x - (imagePos.value.x - ((wWidth - imageViewerInfo.value.size[0]) / 2) + wWidth / 2)
  const deltaY = centerPostiion.y - (imagePos.value.y - ((wHeight - imageViewerInfo.value.size[1]) / 2) + wHeight / 2)
  imagePos.value.x -= (newRatio / imageRatio.value - 1) * deltaX
  imagePos.value.y -= (newRatio / imageRatio.value - 1) * deltaY
  imageRatio.value = newRatio
}

function resolvePath(pathStr: string) {
  if (import.meta.env.MODE === 'production')
    return originalImageHost + pathStr.substring(pathStr.search(/\d+_p\d+\.(jpg|png)/))
  return pathStr
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.hide-left-enter-active,
.hide-left-leave-active {
  transition: transform .3s;
}

.hide-left-enter-from,
.hide-left-leave-to {
  transform: translateX(-100%);
}

.hide-right-enter-active,
.hide-right-leave-active {
  transition: transform .3s;
}

.hide-right-enter-from,
.hide-right-leave-to {
  transform: translateX(100%);
}
</style>
