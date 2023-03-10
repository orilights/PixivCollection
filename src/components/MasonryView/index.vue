<template>
  <div v-show="!imagesFiltered.length" class="w-fit mx-auto px-3 py-1 text-lg bg-black/20 rounded-xl">
    {{ loading ? '数据加载中...' : '无数据' }}
  </div>
  <div
    ref="container" class="w-full lg:w-[700px] xl:w-[960px]  mx-auto relative overflow-y-hidden" :style="{
      height: `${Math.max(...colsTop)}px`,
    }"
  >
    <MasonryViewItem
      v-for="item in imagesRenderList" :key="`${item.image.id}_${item.image.part}`" :index="item.idx"
      :image="item.image" :show-no="config.showNo" :load-image="imagesShow.includes(item.idx)" :style="{
        width: `calc((100% - ${config.gap * (col - 1)}px) / ${col})`,
        height: `${getImageHeight(item.image.size)}px`,
        transform: `translate(${item.left}px, ${item.top}px)`,
      }"
      @open-image="openImage" @open-pixiv="openPixiv" @open-pixiv-user="openPixivUser" @destory="itemDestroy"
    />
  </div>
</template>

<script setup lang="ts">
import { useDebounce, useDebounceFn, useElementBounding, useElementSize } from '@vueuse/core'
import { useStore } from '@/store'

const props = withDefaults(
  defineProps<{
    loading: boolean
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
        preload: 3,
      }
    },
    filter: () => true,
  })

const store = useStore()
const container = ref()
const { width: containerWidthO } = useElementSize(container)
const { top: containerTopO } = useElementBounding(container)
const containerWidth = useDebounce(containerWidthO, 200, { maxWait: 400 })
const containerTop = useDebounce(containerTopO, 200, { maxWait: 400 })
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
const imagesRenderList = computed(() => {
  const _list: Array<{
    image: Image
    place: number
    idx: number
    top: number
    left: number
  }> = []
  colsTop.value = Array.from({ length: col.value }, () => 0)
  imagesFiltered.value.forEach((image, idx) => {
    const colPlace = getColPlace()
    _list.push({
      image,
      place: colPlace,
      idx,
      top: colsTop.value[colPlace],
      left: ((containerWidth.value - (col.value - 1) * props.config.gap) / col.value + props.config.gap) * colPlace,
    })
    colsTop.value[colPlace] += getImageHeight(image.size) + props.config.gap
  })

  return _list.filter((item) => {
    const { preload } = props.config
    if (item.top > (-containerTop.value - preload * window.innerHeight) && item.top < (-containerTop.value + (preload + 1) * window.innerHeight))
      return item
    return null
  })
})
const imagesShow = ref<number[]>([])

const lazyloadImage = useDebounceFn(() => {
  nextTick(() => {
    imagesRenderList.value.forEach((item) => {
      if (imagesShow.value.includes(item.idx))
        return

      if (item.top + getImageHeight(item.image.size) + containerTop.value > -1000 && item.top + containerTop.value - window.innerHeight < 1000)
        imagesShow.value.push(item.idx)
    })
  })
}, 300, { maxWait: 500 })

onMounted(() => {
  lazyloadImage()
  window.addEventListener('scroll', lazyloadImage)
})

watch(imagesFiltered, () => {
  lazyloadImage()
})

watch(imageWidth, () => {
  lazyloadImage()
})

function getColPlace() {
  return colsTop.value.indexOf(Math.min(...colsTop.value))
}

function getImageHeight(size: [number, number]) {
  return size[1] * (imageWidth.value / size[0])
}

function openImage(idx: number) {
  // window.open(imagesFiltered.value[idx].original, '_blank')
  store.showImageInfo = imagesFiltered.value[idx]
  store.showImage = true
}

function openPixiv(idx: number) {
  window.open(`https://www.pixiv.net/artworks/${imagesFiltered.value[idx].id}`, '_blank')
}

function openPixivUser(idx: number) {
  window.open(`https://www.pixiv.net/users/${imagesFiltered.value[idx].detail.author.id}`, '_blank')
}

function itemDestroy(idx: number) {
  if (imagesShow.value.includes(idx))
    imagesShow.value.splice(imagesShow.value.indexOf(idx), 1)
}
</script>
