<template>
  <div
    ref="container" class="relative mx-auto"
    :class="{
      'lg:w-[960px] 2xl:w-[1200px]': !masonryConfig.containerFullWidth,
    }"
    :style="{
      height: `${Math.max(...colsTop) + masonryConfig.gap}px`,
      padding: `${masonryConfig.gap}px`,
    }"
  >
    <MasonryViewItem
      v-for="item in imagesRenderList" :key="`${item.image.id}_${item.image.part}`" :index="item.idx"
      :image="item.image"
      :show-no="masonryConfig.showImageNo"
      :tag-include-bookmark="filterConfig.tag.includeBookmark"
      :tag-translation="masonryConfig.showTagTranslation"
      :info-at-bottom="masonryConfig.infoAtBottom"
      :shadow="masonryConfig.gap > 2"
      :load-image="imagesShow.includes(item.idx)"
      :style="{
        width: `${imageWidth}px`,
        height: `${getImageHeight(item.image.size) + (masonryConfig.infoAtBottom ? 120 : 0)}px`,
        transform: `translate(${item.left}px, ${item.top}px)`,
      }"
      @open-image="openImageViewer" @open-pixiv="openPixiv" @open-pixiv-user="openPixivUser"
      @filter-author="filterAuthor"
      @destory="itemDestroy"
    />
  </div>
</template>

<script setup lang="ts">
import { useDebounce, useDebounceFn, useElementBounding, useElementSize } from '@vueuse/core'
import { useStore } from '@/store'
import { pixivArtworkLink, pixivUserLink } from '@/config'

const store = useStore()
const { filterConfig, imagesFiltered, masonryConfig } = toRefs(store)
const container = ref()
const { width: containerWidthO } = useElementSize(container)
const { top: containerTopO } = useElementBounding(container)
const containerWidth = useDebounce(containerWidthO, 200, { maxWait: 400 })
const containerTop = useDebounce(containerTopO, 200, { maxWait: 400 })
const col = computed(() => {
  if (masonryConfig.value.col > 0)
    return masonryConfig.value.col
  const cWidth = containerWidth.value + masonryConfig.value.gap * 2
  if (cWidth >= masonryConfig.value.imageMinWidth * 2)
    return Number((cWidth / masonryConfig.value.imageMinWidth).toFixed(0))
  return 2
})
const colsTop = ref(Array.from({ length: col.value }, () => 0))
const imageWidth = computed(() => (containerWidth.value - (col.value - 1) * masonryConfig.value.gap) / col.value)
const imagesPlaced = computed(() => {
  if (!containerWidth.value)
    return []
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
      left: (imageWidth.value + masonryConfig.value.gap) * colPlace,
    })
    colsTop.value[colPlace] += getImageHeight(image.size) + masonryConfig.value.gap + (masonryConfig.value.infoAtBottom ? 120 : 0)
  })
  return _list
})
const imagesRenderList = computed(() => {
  if (masonryConfig.value.virtualListEnable) {
    return imagesPlaced.value.filter((item) => {
      const preload = masonryConfig.value.virtualListPreload
      if (item.top > (-containerTop.value - preload * window.innerHeight) && item.top < (-containerTop.value + (preload + 1) * window.innerHeight))
        return true
      return false
    })
  }
  return imagesPlaced.value
})
const imagesShow = ref<number[]>([])

const lazyloadImage = useDebounceFn(() => {
  nextTick(() => {
    imagesRenderList.value.forEach((item) => {
      if (imagesShow.value.includes(item.idx))
        return

      if (item.top + getImageHeight(item.image.size) + containerTop.value > 0 && item.top + containerTop.value - window.innerHeight < 1000)
        imagesShow.value.push(item.idx)
    })
  })
}, 300, { maxWait: 500 })

onMounted(() => {
  lazyloadImage()
  window.addEventListener('scroll', lazyloadImage, { passive: true })
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

function openImageViewer(idx: number) {
  if (idx < 0 || idx >= imagesFiltered.value.length)
    return
  store.openImageViewer(
    imagesFiltered.value[idx],
    () => {
      openImageViewer(idx - 1)
    },
    () => {
      openImageViewer(idx + 1)
    })
}

function openPixiv(idx: number) {
  window.open(pixivArtworkLink + imagesFiltered.value[idx].id, '_blank')
}

function openPixivUser(idx: number) {
  window.open(pixivUserLink + imagesFiltered.value[idx].author.id, '_blank')
}

function filterAuthor(idx: number) {
  const authorId = imagesFiltered.value[idx].author.id
  if (store.filterConfig.author.enable && store.filterConfig.author.id === authorId) {
    store.filterConfig.author.enable = false
    store.filterConfig.author.id = -1
    return
  }
  store.filterConfig.author.id = authorId
  store.filterConfig.author.enable = true
}

function itemDestroy(idx: number) {
  if (imagesShow.value.includes(idx))
    imagesShow.value.splice(imagesShow.value.indexOf(idx), 1)
}
</script>
