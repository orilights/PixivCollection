<template>
  <div
    class="fixed top-0 left-0 h-screen w-[400px] bg-white z-10 overflow-x-hidden overflow-y-auto px-2 transition-[left]"
    :class="{
      'left-[-380px]': !showSidebar,
    }"
    @mouseenter="showSidebar = true"
    @mouseleave="showSidebar = false"
  >
    <div class="my-1">
      列数:
      <select v-model.number="col" class="border">
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
      <select v-model.number="gap" class="border">
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
      <select v-model.number="filterConfig.restrict.sanity.max" class="border">
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
    <div>
      <button class="px-2 mx-1" @click="filterConfig.author.enable = false; filterConfig.author.id = -1">
        清除
      </button>
      <button
        v-for="author in authors" :key="author.id" class="bg-blue-500/20 rounded-sm mx-1 my-0.5 px-0.5 text-sm"
        :class="{
          'bg-gray-400': author.id === filterConfig.author.id,
        }" @click="filterConfig.author.enable = true; filterConfig.author.id = author.id"
      >
        {{ author.name }}
      </button>
    </div>
    <div>标签过滤作者：<input v-model="filterConfig.tag.filterAuthor" type="checkbox"></div>
    <div>标签包含收藏：<input v-model="filterConfig.tag.includeBookmark" type="checkbox"></div>
    <div>
      <button class="px-2 mx-1" @click="filterConfig.tag.enable = false; filterConfig.tag.name = ''">
        清除
      </button>
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
</script>
