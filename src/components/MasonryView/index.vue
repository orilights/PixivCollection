<template>
  <div
    ref="container" class="relative mx-auto"
    :class="{
      'lg:w-[960px] 2xl:w-[1200px]': !masonryConfig.containerFullWidth,
    }"
    :style="{
      height: `${containerHeight}px`,
      padding: `${masonryConfig.gap}px`,
    }"
  >
    <MasonryViewItem
      v-for="item in imagesRenderList" :key="`${item.image.id}_${item.image.part}`"
      :image-data="item.image"
      :image-index="item.index"
      :show-no="masonryConfig.showImageNo"
      :tag-include-bookmark="filterConfig.tag.includeBookmark"
      :tag-translation="masonryConfig.showTagTranslation"
      :info-at-bottom="masonryConfig.infoAtBottom"
      :shadow="masonryConfig.gap > 2"
      :load-image="imagesLoad.includes(item.index)"
      :style="{
        width: `${imageWidth}px`,
        height: `${item.height + (masonryConfig.infoAtBottom ? 120 : 0)}px`,
        transform: `translate(${item.left}px, ${item.top}px)`,
      }"
      @open-image="openImageViewer"
      @open-pixiv="openPixiv"
      @open-pixiv-user="openPixivUser"
      @filter-author="filterAuthor"
      @destory="itemDestroy"
    />
  </div>
</template>

<script setup lang="ts">
import { useElementBounding, useElementSize, useThrottle, useThrottleFn } from '@vueuse/core'
import { imageInfoAreaHeight, masonryLazyloadHeight, masonryMinColumns, pixivArtworkLink, pixivUserLink, virtualListRenderRange } from '@/config'
import { useStore } from '@/store'

const store = useStore()
const { filterConfig, imagesFiltered, masonryConfig } = toRefs(store)
const container = ref()

const containerWidth = useThrottle(useElementSize(container).width, 300, true)
const containerTop = useThrottle(useElementBounding(container).top, 30, true)

const containerHeight = ref<number>(0)
const imagesLoad = ref<number[]>([])

const col = computed(() => {
  if (masonryConfig.value.col > 0)
    return masonryConfig.value.col
  const cWidth = containerWidth.value + masonryConfig.value.gap * 2
  if (cWidth >= masonryConfig.value.imageMinWidth * 2)
    return Math.floor(cWidth / masonryConfig.value.imageMinWidth)
  return masonryMinColumns
})

const imageWidth = computed(() => (containerWidth.value - (col.value - 1) * masonryConfig.value.gap) / col.value)

const imagesPlaced = computed(() => {
  if (!containerWidth.value)
    return []

  const colsTop = new Array(col.value).fill(0)
  const result = imagesFiltered.value.map((image, idx) => {
    const colPlace = getColPlace(colsTop)
    const item = {
      image,
      place: colPlace,
      index: idx,
      top: colsTop[colPlace],
      left: (imageWidth.value + masonryConfig.value.gap) * colPlace,
      height: getImageHeight(image.size),
    }
    colsTop[colPlace] += item.height + masonryConfig.value.gap + (masonryConfig.value.infoAtBottom ? imageInfoAreaHeight : 0)
    return Object.freeze(item)
  })
  containerHeight.value = Math.max(...colsTop) + masonryConfig.value.gap

  return result
})

const imagesRenderList = computed(() => {
  if (!masonryConfig.value.virtualListEnable)
    return imagesPlaced.value

  const renderRange = virtualListRenderRange
  const renderRangeTop = -containerTop.value - renderRange.up * window.innerHeight
  const renderRangeBottom = -containerTop.value + window.innerHeight + renderRange.down * window.innerHeight

  return imagesPlaced.value.filter((item) => {
    return (item.top + item.height > renderRangeTop && item.top < renderRangeBottom)
  })
})

const lazyloadImage = useThrottleFn(() => {
  nextTick(() => {
    const loadRangeTop = -containerTop.value
    const loadRangeBottom = -containerTop.value + window.innerHeight + masonryLazyloadHeight

    imagesRenderList.value.forEach((item) => {
      if (imagesLoad.value.includes(item.index))
        return

      if (item.top + item.height > loadRangeTop && item.top < loadRangeBottom)
        imagesLoad.value.push(item.index)
    })
  })
}, 300, true)

onMounted(() => {
  setInterval(() => {
    lazyloadImage()
  }, 1000)
  window.addEventListener('scroll', lazyloadImage, { passive: true })
})

watch(imagesFiltered, () => {
  lazyloadImage()
})

watch(imageWidth, () => {
  lazyloadImage()
})

function getColPlace(colsTop: number[]) {
  return colsTop.indexOf(Math.min(...colsTop))
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
  if (imagesLoad.value.includes(idx))
    imagesLoad.value.splice(imagesLoad.value.indexOf(idx), 1)
}
</script>
