<template>
  <div
    ref="container" class="relative mx-auto"
    :class="{
      'lg:w-[960px] 2xl:w-[1200px]': !masonryConfig.containerFullWidth,
    }"
    :style="{
      height: `${containerHeight}px`,
    }"
  >
    <MasonryItem
      v-for="item in imagesRenderList" :key="`${item.image.id}_${item.image.part}`"
      :image-data="item.image"
      :image-index="item.index"
      :image-height="item.height"
      :image-count="item.count"
      :style="{
        width: `${imageWidth}px`,
        height: `${item.height + itemExtraHeight}px`,
        transform: `translate(${item.left}px, ${item.top}px)`,
      }"
      :config="itemConfig"
      @view-image="store.viewImage"
    />
  </div>
</template>

<script setup lang="ts">
import { useElementBounding, useElementSize, useThrottle } from '@vueuse/core'
import { MASONRY_INFO_AREA_HEIGHT, MASONRY_MIN_COLUMNS, MASONRY_RENDER_RANGE } from '@/config'
import { useStore } from '@/store'

const store = useStore()
const { filterConfig, imagesFiltered, masonryConfig } = toRefs(store)
const container = ref()
const containerWidth = useThrottle(useElementSize(container).width, 300, true)
const containerTop = useThrottle(useElementBounding(container).top, 30, true)

const containerHeight = ref<number>(0)

const col = computed(() => {
  if (masonryConfig.value.col > 0)
    return masonryConfig.value.col

  const cWidth = containerWidth.value + masonryConfig.value.gap * 2
  if (cWidth >= masonryConfig.value.imageMinWidth * 2)
    return Math.floor(cWidth / masonryConfig.value.imageMinWidth)

  return MASONRY_MIN_COLUMNS
})

const imageWidth = computed(() => (containerWidth.value - (col.value + 1) * masonryConfig.value.gap) / col.value)

const itemExtraHeight = computed(() => masonryConfig.value.infoAtBottom ? MASONRY_INFO_AREA_HEIGHT : 0)

const imagesPlaced = computed(() => {
  if (!containerWidth.value)
    return []

  const colsTop = Array.from<number>({ length: col.value }).fill(masonryConfig.value.gap)

  const result = []
  for (let i = 0; i < imagesFiltered.value.length; i++) {
    const colPlace = getColToPlace(colsTop)
    const imageIndex = i
    if (masonryConfig.value.mergeSameIdImage) {
      while (
        i < imagesFiltered.value.length - 1
        && imagesFiltered.value[i].id === imagesFiltered.value[i + 1].id
      ) i++
    }

    const item = {
      image: imagesFiltered.value[imageIndex],
      place: colPlace,
      index: imageIndex,
      top: colsTop[colPlace],
      left: (imageWidth.value + masonryConfig.value.gap) * colPlace + masonryConfig.value.gap,
      height: getImageHeight(imagesFiltered.value[imageIndex].size),
      count: i - imageIndex + 1,
    }
    colsTop[colPlace] += item.height + masonryConfig.value.gap + itemExtraHeight.value
    result.push(Object.freeze(item))
  }
  containerHeight.value = Math.max(...colsTop)
  store.debug.enable && store.debug.masonryRefreshCount++
  return result
})

const imagesRenderList = computed(() => {
  if (!masonryConfig.value.virtualListEnable)
    return imagesPlaced.value

  const renderRange = MASONRY_RENDER_RANGE
  const renderRangeTop = -containerTop.value - renderRange.up * window.innerHeight
  const renderRangeBottom = -containerTop.value + window.innerHeight + renderRange.down * window.innerHeight

  const res = imagesPlaced.value.filter((item) => {
    const itemHeight = item.height + itemExtraHeight.value
    return item.top + itemHeight > renderRangeTop && item.top < renderRangeBottom
  })
  if (store.debug.enable) {
    store.debug.masonryContainerHeight = containerHeight.value
    store.debug.masonryContainerTop = containerTop.value
    store.debug.masonryItemRenderLength = res.length
    store.debug.masonryItemRenderTop = renderRangeTop
    store.debug.masonryItemRenderBottom = renderRangeBottom
    store.debug.screenWidth = window.innerWidth
    store.debug.screenHeight = window.innerHeight
  }
  return res
})

const itemConfig = computed(() => ({
  infoAtBottom: masonryConfig.value.infoAtBottom,
  tagIncludeBookmark: filterConfig.value.tag.includeBookmark,
  tagTranslation: masonryConfig.value.showTagTranslation,
  shadow: masonryConfig.value.showShadow,
  border: masonryConfig.value.gap > 2,
}))

function getColToPlace(colsTop: number[]) {
  return colsTop.indexOf(Math.min(...colsTop))
}

function getImageHeight(size: [number, number]) {
  return size[1] * (imageWidth.value / size[0])
}
</script>
