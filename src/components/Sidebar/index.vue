<template>
  <div
    class="fixed w-full lg:block top-0 left-0 h-screen sm:w-[400px] bg-white overflow-x-hidden overflow-y-auto px-2 transition-all border-r-2 dark:bg-[#242424] dark:border-[#1a1a1a]  duration-500 z-30"
    :class="{
      '-translate-x-full': !showSidebar,
    }"
  >
    <button class="absolute right-2 top-2" @click="showSidebar = false">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <div class="my-1">
      列数:
      <select v-model.number="col" class="border rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]">
        <option value="-1">
          自动
        </option>
        <option value="2">
          2
        </option>
        <option value="3">
          3
        </option>
        <option value="4">
          4
        </option>
      </select>
      间隙:
      <select v-model.number="gap" class="border rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]">
        <option value="2">
          2px
        </option>
        <option value="5">
          5px
        </option>
        <option value="10">
          10px
        </option>
      </select>
      健全度:
      <select v-model.number="filterConfig.restrict.sanity.max" class="border rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]">
        <option value="2">
          2
        </option>
        <option value="4">
          4
        </option>
        <option value="6">
          6
        </option>
      </select>
      <span>R18：<input v-model="filterConfig.restrict.r18" type="checkbox"></span>
    </div>
    <div>标签过滤作者：<input v-model="filterConfig.tag.filterAuthor" type="checkbox"></div>
    <div>标签包含收藏：<input v-model="filterConfig.tag.includeBookmark" type="checkbox"></div>
    <div>
      当前选中作者：{{ filterConfig.author.enable ? authors.find((a) => a.id === filterConfig.author.id)?.name : '未选中' }}
      <button class="px-2 mx-1 border rounded-md hover:border-blue-500 transition-colors" @click="filterConfig.author.enable = false; filterConfig.author.id = -1">
        清除
      </button>
    </div>
    <div>
      当前选中标签：{{ filterConfig.tag.enable ? filterConfig.tag.name : '未选中' }}
      <button class="px-2 mx-1 border rounded-md hover:border-blue-500 transition-colors" @click="filterConfig.tag.enable = false; filterConfig.tag.name = ''">
        清除
      </button>
    </div>
    <div>
      <button class="px-2 mx-1 my-2 border rounded-md hover:border-blue-500 transition-colors" @click="showAuthor = !showAuthor">
        {{ showAuthor ? '收起' : '展开' }}作者列表
      </button>
    </div>
    <div
      class="overflow-hidden" :class="{
        'h-[100px] mask': !showAuthor,
      }"
    >
      <button
        v-for="author in authors" :key="author.id" class="bg-blue-500/20 rounded-sm mx-1 my-0.5 px-0.5 text-sm"
        :class="{
          'bg-gray-400': author.id === filterConfig.author.id,
        }" @click="filterConfig.author.enable = true; filterConfig.author.id = author.id"
      >
        {{ author.name }}
      </button>
    </div>
    <div>
      <button class="px-2 mx-1 my-2 border rounded-md hover:border-blue-500 transition-colors" @click="showTags = !showTags">
        {{ showTags ? '收起' : '展开' }}标签列表
      </button>
    </div>
    <div
      class="overflow-hidden" :class="{
        'h-[100px] mask': !showTags,
      }"
    >
      <button
        v-for="tag in tags" :key="tag.name" class="bg-black/20 rounded-sm mx-1 my-0.5 px-0.5 text-sm" :class="{
          'bg-gray-400': tag.name === filterConfig.tag.name,
        }" @click="filterConfig.tag.enable = true; filterConfig.tag.name = tag.name"
      >
        {{ `${tag.translated_name || tag.name} ${tag.count}` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@/store'

const props = defineProps<{
  images: Image[]
}
>()

const store = useStore()
const { col, gap, filterConfig, showSidebar } = toRefs(store)

const configLoaded = ref(false)
const showAuthor = ref(false)
const showTags = ref(false)

const tags = computed(() => {
  const _tags: {
    [index: string]: TagData
  } = {}
  props.images.forEach((image) => {
    image.detail.tags.forEach((tag) => {
      if (filterConfig.value.author.enable && filterConfig.value.tag.filterAuthor) {
        if (image.detail.author.id !== filterConfig.value.author.id)
          return
      }
      if (!filterConfig.value.restrict.r18) {
        if (image.detail.x_restrict >= 1)
          return
      }
      if (image.detail.sanity_level > filterConfig.value.restrict.sanity.max)
        return
      if (Object.hasOwn(_tags, tag.name))
        _tags[tag.name].count++
      else
        _tags[tag.name] = { ...tag, count: 1 }
    })
  })
  return Object.keys(_tags)
    .map(tagName => _tags[tagName])
    .filter(tag => !tag.name.includes('users入り') || filterConfig.value.tag.includeBookmark)
    .filter(tag => tag.count >= filterConfig.value.tag.includeRatherThan)
    .sort((a, b) => b.count - a.count)
})

const authors = computed(() => {
  const _authors: { [index: string]: AuthorData } = {}
  props.images.forEach((image) => {
    if (!filterConfig.value.restrict.r18) {
      if (image.detail.x_restrict >= 1)
        return
    }
    if (image.detail.sanity_level > filterConfig.value.restrict.sanity.max)
      return
    const { author } = image.detail
    if (Object.hasOwn(_authors, author.id))
      _authors[author.id].count++
    else
      _authors[author.id] = { ...author, count: 1 }
  })
  return Object.keys(_authors)
    .map(authorId => _authors[authorId])
    .sort((a, b) => b.count - a.count)
})

watchEffect(() => {
  if (!configLoaded.value)
    return
  localStorage.setItem('col', col.value.toString())
  localStorage.setItem('gap', gap.value.toString())
  localStorage.setItem('r18', filterConfig.value.restrict.r18.toString())
  localStorage.setItem('sanity', filterConfig.value.restrict.sanity.max.toString())
})

onMounted(() => {
  col.value = Number(localStorage.getItem('col')) || -1
  gap.value = Number(localStorage.getItem('gap')) || 10
  filterConfig.value.restrict.r18 = localStorage.getItem('r18') === 'true'
  filterConfig.value.restrict.sanity.max = Number(localStorage.getItem('sanity')) || 2
  configLoaded.value = true
})
</script>

<style>
.mask {
  mask: linear-gradient(to top, transparent, rgb(0, 0, 0) 60px, rgb(0, 0, 0) 100%);
}
</style>
