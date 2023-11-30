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
        height: `${item.height + (masonryConfig.infoAtBottom ? MASONRY_INFO_AREA_HEIGHT : 0)}px`,
        transform: `translate(${item.left}px, ${item.top}px)`,
      }"
      :config="itemConfig"
      @view-image="store.viewImage"
      @filter-author="store.filterAuthor"
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

const imagesPlaced = computed(() => {
  if (!containerWidth.value)
    return []

  const colsTop = Array.from<number>({ length: col.value }).fill(masonryConfig.value.gap)

  const result = []
  for (let i = 0; i < imagesFiltered.value.length; i++) {
    const colPlace = getColToPlace(colsTop)
    const index = i
    if (masonryConfig.value.mergeSameIdImage) {
      while (i < imagesFiltered.value.length - 1 && imagesFiltered.value[i].id === imagesFiltered.value[i + 1].id)
        i++
    }

    const item = {
      image: imagesFiltered.value[index],
      place: colPlace,
      index,
      top: colsTop[colPlace],
      left: (imageWidth.value + masonryConfig.value.gap) * colPlace + masonryConfig.value.gap,
      height: getImageHeight(imagesFiltered.value[index].size),
      count: i - index + 1,
    }
    colsTop[colPlace] += item.height + masonryConfig.value.gap + (masonryConfig.value.infoAtBottom ? MASONRY_INFO_AREA_HEIGHT : 0)
    result.push(Object.freeze(item))
  }
  // const result = imagesFiltered.value.map((image, idx) => {
  //   const colPlace = getColToPlace(colsTop)
  //   const item = {
  //     image,
  //     place: colPlace,
  //     index: idx,
  //     top: colsTop[colPlace],
  //     left: (imageWidth.value + masonryConfig.value.gap) * colPlace + masonryConfig.value.gap,
  //     height: getImageHeight(image.size),
  //   }
  //   colsTop[colPlace] += item.height + masonryConfig.value.gap + (masonryConfig.value.infoAtBottom ? MASONRY_INFO_AREA_HEIGHT : 0)
  //   return Object.freeze(item)
  // })
  containerHeight.value = Math.max(...colsTop)

  return result
})

const imagesRenderList = computed(() => {
  if (!masonryConfig.value.virtualListEnable)
    return imagesPlaced.value

  const renderRange = MASONRY_RENDER_RANGE
  const renderRangeTop = -containerTop.value - renderRange.up * window.innerHeight
  const renderRangeBottom = -containerTop.value + window.innerHeight + renderRange.down * window.innerHeight

  return imagesPlaced.value.filter((item) => {
    const itemHeight = item.height + (masonryConfig.value.infoAtBottom ? MASONRY_INFO_AREA_HEIGHT : 0)
    return (item.top + itemHeight > renderRangeTop && item.top < renderRangeBottom)
  })
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
