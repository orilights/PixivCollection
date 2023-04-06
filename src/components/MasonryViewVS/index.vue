<template>
  <div v-show="!imagesFiltered.length" class="w-fit mx-auto px-3 py-1 text-lg bg-black/20 rounded-xl">
    {{ loading ? '数据加载中...' : '无数据' }}
  </div>
  <div
    ref="container" class="mx-auto flex"
    :class="{
      'lg:w-[960px]': !containerFullWidth,
    }"
    :style="{
      padding: `0 ${config.gap}px`,
      gap: `${config.gap}px`,
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
        :show-no="config.showNo"
        :tag-include-bookmark="filterConfig.tag.includeBookmark"
        :tag-translation="showTagTranslation"
        :info-at-bottom="infoAtBottom"
        :shadow="config.gap > 2"
        :style="{
          width: `100%`,
          height: `${getImageHeight(item.image.size) + (infoAtBottom ? 120 : 0)}px`,
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

interface ComponentOptions {
  col: number
  gap: number
  showNo: boolean
  preload: number
}

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
const { filterConfig, showTagTranslation, infoAtBottom, containerFullWidth } = toRefs(store)
const container = ref()
const { width: containerWidthO } = useElementSize(container)
const containerWidth = useDebounce(containerWidthO, 200, { maxWait: 400 })
const col = computed(() => {
  if (props.config.col > 0)
    return props.config.col
  const cWidth = containerWidth.value + props.config.gap * 2
  if (cWidth >= 480)
    return Number((cWidth / 240).toFixed(0))
  return 2
})
const colsTop = ref(Array.from({ length: col.value }, () => 0))
const imageWidth = computed(() => (containerWidth.value - (col.value - 1) * props.config.gap) / col.value)
const imagesFiltered = computed(() => props.images.filter(props.filter))
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
      height: getImageHeight(image.size) + (infoAtBottom.value ? 120 : 0) + props.config.gap,
    })
    colsTop.value[colPlace] += getImageHeight(image.size) + props.config.gap + (infoAtBottom.value ? 120 : 0)
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
