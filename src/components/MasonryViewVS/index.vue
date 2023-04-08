<template>
  <div
    ref="container" class="mx-auto flex"
    :class="{
      'lg:w-[960px]': !masonryConfig.containerFullWidth,
    }"
    :style="{
      padding: `0 ${masonryConfig.gap}px`,
      gap: `${masonryConfig.gap}px`,
    }"
  >
    <RecycleScroller
      v-for="index in col"
      :key="index"
      v-slot="{ item }"
      class="scroller h-full flex-1"
      key-field="idx"
      size-field="height"
      :items="imagesPlaced.filter(i => i.place === index - 1)"
      page-mode
      :buffer="1000"
    >
      <MasonryViewVSItem
        :index="item.idx"
        :image="item.image"
        :show-no="masonryConfig.showImageNo"
        :tag-include-bookmark="filterConfig.tag.includeBookmark"
        :tag-translation="masonryConfig.showTagTranslation"
        :info-at-bottom="masonryConfig.infoAtBottom"
        :shadow="masonryConfig.gap > 2"
        :style="{
          width: `100%`,
          height: `${getImageHeight(item.image.size) + (masonryConfig.infoAtBottom ? 120 : 0)}px`,
          // transform: `translate(${item.left}px, ${item.top}px)`,
        }"
        @open-image="openImageViewer" @open-pixiv="openPixiv" @open-pixiv-user="openPixivUser"
        @filter-author="filterAuthor"
      />
    </RecycleScroller>
  </div>
</template>

<script setup lang="ts">
import { useDebounce, useElementSize } from '@vueuse/core'
import { useStore } from '@/store'
import { pixivArtworkLink, pixivUserLink } from '@/config'

const store = useStore()
const { filterConfig, imagesFiltered, masonryConfig } = toRefs(store)
const container = ref()
const { width: containerWidthO } = useElementSize(container)
const containerWidth = useDebounce(containerWidthO, 200, { maxWait: 400 })
const col = computed(() => {
  if (masonryConfig.value.col > 0)
    return masonryConfig.value.col
  const cWidth = containerWidth.value + masonryConfig.value.gap * 2
  if (cWidth >= 480)
    return Number((cWidth / 240).toFixed(0))
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
    height: number
  }> = []
  colsTop.value = Array.from({ length: col.value }, () => 0)
  imagesFiltered.value.forEach((image, idx) => {
    const colPlace = getColPlace()
    _list.push({
      image,
      place: colPlace,
      idx,
      height: getImageHeight(image.size) + (masonryConfig.value.infoAtBottom ? 120 : 0) + masonryConfig.value.gap,
    })
    colsTop.value[colPlace] += getImageHeight(image.size) + masonryConfig.value.gap + (masonryConfig.value.infoAtBottom ? 120 : 0)
  })
  return _list
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
  window.open(pixivUserLink + imagesFiltered.value[idx].detail.author.id, '_blank')
}

function filterAuthor(idx: number) {
  const authorId = imagesFiltered.value[idx].detail.author.id
  if (store.filterConfig.author.enable && store.filterConfig.author.id === authorId) {
    store.filterConfig.author.enable = false
    store.filterConfig.author.id = -1
    return
  }
  store.filterConfig.author.id = authorId
  store.filterConfig.author.enable = true
}
</script>
