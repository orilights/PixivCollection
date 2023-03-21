<template>
  <Transition name="fade">
    <div
      v-if="imageViewerShow" class="fixed top-0 left-0 w-screen h-screen bg-black/30"
      @mousemove="imageGragging && (postiion.x += $event.movementX, postiion.y += $event.movementY)"
      @mouseup="imageGragging = false" @mouseleave="imageGragging = false"
      @touchmove="imageGragging && handleTouchMove($event)" @wheel="handleZoom"
      @touchend="imageGragging = false"
    >
      <button
        class="bg-black/60 text-white absolute top-0 right-0 text-center w-[80px] h-[80px] z-50"
        @click="store.closeImageViewer()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mx-auto">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button
        class="bg-black/40 text-white absolute left-0 top-[calc(50vh-40px)] w-[40px] h-[80px] z-50"
        @click="store.imageViewerPrev()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mx-auto">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        class="bg-black/40 text-white absolute right-0 top-[calc(50vh-40px)] w-[40px] h-[80px] z-50"
        @click="store.imageViewerNext()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mx-auto">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      <div class="relative">
        <img
          :src="imageSrc"
          class="max-w-none cursor-grab active:cursor-grabbing select-none touch-none absolute" :class="{
            '': !imageGragging,
          }" :style="{
            transform: `scale(${ratio})`,
            left: `${postiion.x}px`,
            top: `${postiion.y}px`,
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

const ratio = ref(1)
const postiion = ref({ x: 0, y: 0 })
const imageGragging = ref(false)
const imageSrc = ref('')
const mouse = useMouse({ type: 'client' })
const loading = ref(false)

const startPosition = { x: 0, y: 0 }
let startDistance = 0
let initialRatio = 0
const minRatio = 0.5
let image: HTMLImageElement

watch(imageViewerShow, (val) => {
  if (!val) {
    if (image)
      image.remove()

    loading.value = false
    document.body.style.overflow = 'visible'
  }
})

watch(imageViewerInfo, () => {
  if (image)
    image.remove()
  loading.value = true
  imageSrc.value = ''
  image = new Image()
  image.addEventListener('load', () => {
    loading.value = false
  })
  image.src = resolvePath(imageViewerInfo.value.original)
  nextTick(() => {
    imageSrc.value = image.src
  })
  document.body.style.overflow = 'hidden'
  const ratioWidth = window.innerWidth / imageViewerInfo.value.size[0]
  const ratioHeight = window.innerHeight / imageViewerInfo.value.size[1]
  ratio.value = Math.min(ratioWidth, ratioHeight)
  initialRatio = ratio.value
  postiion.value.x = (window.innerWidth - imageViewerInfo.value.size[0]) / 2
  postiion.value.y = (window.innerHeight - imageViewerInfo.value.size[1]) / 2
})

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
    postiion.value.x += deltaX
    postiion.value.y += deltaY
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
    let newRatio = ratio.value * delta
    if (newRatio < initialRatio * minRatio)
      newRatio = initialRatio * minRatio
    handleResize(newRatio, centerPostiion)
  }
}

function handleZoom(e: WheelEvent) {
  const delta = e.deltaY / 1000
  let newRatio
  if (delta > 0)
    newRatio = ratio.value - delta
  else
    newRatio = ratio.value - delta
  if (newRatio < initialRatio * minRatio)
    newRatio = initialRatio * minRatio
  handleResize(newRatio, { x: mouse.x.value, y: mouse.y.value })
}

function handleResize(newRatio: number, centerPostiion: { x: number; y: number }) {
  const deltaX = centerPostiion.x - (postiion.value.x - ((window.innerWidth - imageViewerInfo.value.size[0]) / 2) + window.innerWidth / 2)
  const deltaY = centerPostiion.y - (postiion.value.y - ((window.innerHeight - imageViewerInfo.value.size[1]) / 2) + window.innerHeight / 2)
  postiion.value.x -= (newRatio / ratio.value - 1) * deltaX
  postiion.value.y -= (newRatio / ratio.value - 1) * deltaY
  ratio.value = newRatio
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
</style>
