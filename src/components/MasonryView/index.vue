<template>
  <div
    ref="container" class="w-full lg:w-[700px] xl:w-[960px]  mx-auto relative" :style="{
      height: `${Math.max(...colsTop) + 100}px`,
    }"
  >
    <div class="w-full relative">
      <ul>
        <MasonryViewItem
          v-for="image, index in imagesFiltered" :key="`${image.id}_${image.part}`" :index="index"
          :image="image" :show-no="config.showNo" :load-image="imagesShow.includes(index)" :style="{
            width: `calc((100% - ${config.gap * (col - 1)}px) / ${col})`,
            height: `${getImageHeight(image.size)}px`,
          }"
          @open-image="openImage" @open-pixiv="openPixiv" @image-loaded="imageLoaded"
        />
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounce, useDebounceFn, useElementSize } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    images: Image[]
    config: ComponentOptions
    filter: (image: Image) => boolean
  }>(),
  {
    images: () => [],
    config: () => {
      return {
        col: 3,
        gap: 10,
        showNo: false,
      }
    },
    filter: () => true,
  })

const container = ref()
const { width: containerWidthO } = useElementSize(container)
const containerWidth = useDebounce(containerWidthO, 200, { maxWait: 400 })
const col = computed(() => {
  if (props.config.col > 0)
    return props.config.col
  if (containerWidth.value >= 960)
    return 4
  if (containerWidth.value >= 700)
    return 3
  return 2
})
const colsTop = ref(Array.from({ length: col.value }, () => 0))
const imageWidth = computed(() => (containerWidth.value - (col.value - 1) * props.config.gap) / col.value)
const imagesFiltered = computed(() => props.images.filter(props.filter))
const imagesShow = ref<number[]>([])
const imagesLoaded = ref<number[]>([])

const lazyloadImage = useDebounceFn(() => {
  const imagesEl = document.querySelectorAll('.wf-image')
  imagesEl.forEach((el, idx) => {
    if (imagesShow.value.includes(idx)) {
      const rect = el.getBoundingClientRect()
      if (Math.abs(rect.top) > 20000 || Math.abs(rect.bottom) > 20000)
        imagesShow.value.splice(imagesShow.value.indexOf(idx), 1)
      return
    }

    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0)
      imagesShow.value.push(idx)
  })
}, 100, { maxWait: 200 })

const refresh = useDebounceFn(() => {
  nextTick(() => {
    resetMasonry()
    setTimeout(() => {
      lazyloadImage()
    }, 1000)
  })
}, 10)

onMounted(() => {
  refresh()
  window.onscroll = lazyloadImage
})

watch(imagesFiltered, () => {
  // imagesShow.value = []
  // imagesLoaded.value = []
  refresh()
})

watch(imageWidth, () => {
  refresh()
})

function getColPlace() {
  return colsTop.value.indexOf(Math.min(...colsTop.value))
}

function getImageHeight(size: [number, number]) {
  return size[1] * (imageWidth.value / size[0])
}

function resetMasonry() {
  colsTop.value = Array.from({ length: col.value }, () => 0)
  const imagesEl = document.querySelectorAll('.wf-image')
  imagesEl.forEach((el, idx) => {
    const colPlace = getColPlace();
    (el as HTMLElement).style.top = `${colsTop.value[colPlace]}px`;
    (el as HTMLElement).style.left = `calc(((100% - ${(col.value - 1) * props.config.gap}px) / ${col.value} + ${props.config.gap}px) * ${colPlace})`
    // (el as HTMLElement).style.left = `${((containerWidth.value - (col.value - 1) * props.config.gap) / col.value + props.config.gap) * colPlace}px`
    colsTop.value[colPlace] = colsTop.value[colPlace] + getImageHeight(imagesFiltered.value[idx].size) + props.config.gap
  })
}

function imageLoaded(idx: number) {
  imagesLoaded.value.push(idx)
}

function openImage(idx: number) {
  window.open(imagesFiltered.value[idx].original, '_blank')
}

function openPixiv(idx: number) {
  window.open(`https://www.pixiv.net/artworks/${imagesFiltered.value[idx].id}`, '_blank')
}
</script>
