<template>
  <Transition>
    <div
      v-if="showImage" class="fixed top-0 left-0 w-screen h-screen bg-black/30"
      @mousemove="imageGragging && (postiion.x += $event.movementX, postiion.y += $event.movementY)"
      @mouseup="imageGragging = false" @mouseleave="imageGragging = false"
      @touchmove="imageGragging && handleTouchMove($event)" @wheel="handleZoom"
      @touchend="imageGragging = false"
    >
      <button
        class="bg-black/60 text-white absolute top-0 right-0 text-center w-[80px] h-[80px] leading-[80px] text-3xl z-50"
        @click="showImage = false"
      >
        ×
      </button>
      <div class="relative">
        <img
          :src="resolvePath(showImageInfo.original)"
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

const store = useStore()
const { showImageViewer: showImage, showImageInfo } = toRefs(store)

const ratio = ref(1)
const postiion = ref({ x: 0, y: 0 })
const imageGragging = ref(false)
const mouse = useMouse({ type: 'client' })
const loading = ref(false)

const startPosition = { x: 0, y: 0 }
let startDistance = 0

watch(showImage, (val) => {
  if (val) {
    loading.value = true
    const image = new Image()
    image.addEventListener('load', () => {
      loading.value = false
    })
    image.src = resolvePath(showImageInfo.value.original)
    document.body.style.overflow = 'hidden'
    const ratioWidth = window.innerWidth / showImageInfo.value.size[0]
    const ratioHeight = window.innerHeight / showImageInfo.value.size[1]
    ratio.value = Math.min(ratioWidth, ratioHeight)
    postiion.value.x = (window.innerWidth - showImageInfo.value.size[0]) / 2
    postiion.value.y = (window.innerHeight - showImageInfo.value.size[1]) / 2
  }
  else {
    loading.value = false
    document.body.style.overflow = 'visible'
  }
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
    if (newRatio < 0.1)
      newRatio = 0.1
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
  if (newRatio < 0.1)
    newRatio = 0.1
  handleResize(newRatio, { x: mouse.x.value, y: mouse.y.value })
}

function handleResize(newRatio: number, centerPostiion: { x: number; y: number }) {
  const deltaX = centerPostiion.x - (postiion.value.x - ((window.innerWidth - showImageInfo.value.size[0]) / 2) + window.innerWidth / 2)
  const deltaY = centerPostiion.y - (postiion.value.y - ((window.innerHeight - showImageInfo.value.size[1]) / 2) + window.innerHeight / 2)
  postiion.value.x -= (newRatio / ratio.value - 1) * deltaX
  postiion.value.y -= (newRatio / ratio.value - 1) * deltaY
  ratio.value = newRatio
}

function resolvePath(pathStr: string) {
  if (import.meta.env.MODE === 'production')
    return `https://dl.orilight.top/d/pixiv/${pathStr.substring(pathStr.search(/\d+_p\d+\.(jpg|png)/))}`
  return pathStr
}
</script>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity .3s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
