<template>
  <div
    class="fixed w-full lg:block top-0 left-0 h-screen sm:w-[400px] bg-white overflow-x-hidden overflow-y-auto px-2 pt-2 transition-all dark:bg-[#242424] duration-500 z-30"
    :class="{
      '-translate-x-full': !showSidebar,
    }"
  >
    <div class="mb-2 mx-10 lg:hidden flex justify-between">
      <button
        class="w-[60px] h-[60px]"
        @click="openGithub"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 1024 1024" stroke="currentColor"
          class="w-6 h-6 mx-auto"
        >
          <path
            d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c0.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"
          />
        </svg>
      </button>
      <button
        class="w-[60px] h-[60px] "
        @click="store.toggleDarkMode"
      >
        <svg v-if="!darkMode" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 mx-auto">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 mx-auto">
          <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd" />
        </svg>
      </button>
      <button
        class="w-[60px] h-[60px] hover:bg-gray-400/20"
        @click="store.toggleFullscreen"
      >
        <svg v-if="isFullscreen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mx-auto">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mx-auto">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
      </button>
    </div>
    <button class="absolute right-2 top-2" @click="showSidebar = false">
      <svg
        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
        class="w-6 h-6"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <div class="my-1">
      列数:
      <select
        v-model.number="col"
        class="border px-1 py-0.5 mx-1 rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]"
      >
        <option value="-1">
          自动
        </option>
        <option v-for="i in 5" :key="i" :value="i">
          {{ i }}
        </option>
      </select>
      间隙:
      <select
        v-model.number="gap"
        class="border px-1 py-0.5 mx-1 rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]"
      >
        <option v-for="i in [2, 5, 10, 20]" :key="i" :value="i">
          {{ `${i}px` }}
        </option>
      </select>
    </div>
    <div>
      健全度:
      <select
        v-model.number="filterConfig.restrict.sanity.max"
        class="border px-1 py-0.5 mx-1 rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]"
      >
        <option v-for="i in [2, 4, 6]" :key="i" :value="i">
          {{ i }}
        </option>
      </select>
      <button class="px-2 py-0.5 mx-1 border rounded-md hover:border-blue-500 transition-colors" @click="confirmR18">
        {{ filterConfig.restrict.r18 ? '隐藏R18内容' : '🔞显示R18内容' }}
      </button>
    </div>
    <div class="my-1">
      标签包含收藏：<input v-model="filterConfig.tag.includeBookmark" type="checkbox">
    </div>
    <div class="my-1">
      开启 Tag 翻译：<input v-model="showTagTranslation" type="checkbox">
    </div>
    <div class="my-1">
      显示图片序号：<input v-model="showImageNo" type="checkbox">
    </div>
    <div class="my-1">
      当前选中作者：{{ filterConfig.author.enable ? authors.find((a) => a.id === filterConfig.author.id)?.name : '未选中' }}
      <button
        v-show="filterConfig.author.enable"
        class="px-2 mx-1 border rounded-md hover:border-blue-500 transition-colors"
        @click="filterConfig.author.enable = false; filterConfig.author.id = -1"
      >
        清除
      </button>
    </div>
    <div class="my-1">
      当前选中标签：{{ filterConfig.tag.enable ? filterConfig.tag.name : '未选中' }}
      <button
        v-show="filterConfig.tag.enable"
        class="px-2 mx-1 border rounded-md hover:border-blue-500 transition-colors"
        @click="filterConfig.tag.enable = false; filterConfig.tag.name = ''"
      >
        清除
      </button>
    </div>
    <div class="my-1">
      年份：<button
        v-for="year in years" :key="year"
        class="bg-yellow-300/20 rounded-sm mx-1 my-0.5 px-0.5 text-sm"
        :class="{
          '!bg-gray-400': year === filterConfig.year.value,
        }"
        @click="handleClickYear(year)"
      >
        {{ year }}
      </button>
      <button
        class="bg-yellow-300/20 rounded-sm mx-1 my-0.5 px-0.5 text-sm"
        :class="{
          '!bg-gray-400': 1 === filterConfig.year.value,
        }"
        @click="handleClickYear(1)"
      >
        未知
      </button>
    </div>
    <div>
      <button
        class="px-2 mx-1 my-2 border rounded-md hover:border-blue-500 transition-colors"
        @click="showAuthor = !showAuthor"
      >
        {{ showAuthor ? '收起' : '展开' }}作者列表
      </button>
    </div>
    <div
      class="overflow-hidden" :class="{
        'h-[200px] mask': !showAuthor,
      }"
    >
      <button
        v-for="author in authors" :key="author.id"
        class="bg-blue-500/20 rounded-sm mx-1 my-0.5 px-0.5 text-sm"
        :class="{
          '!bg-gray-400': author.id === filterConfig.author.id,
        }"
        @click="handleClickAuthor(author.id)"
      >
        {{ `${author.name} ${author.count}` }}
      </button>
    </div>
    <div>
      <button
        class="px-2 mx-1 my-2 border rounded-md hover:border-blue-500 transition-colors"
        @click="showTags = !showTags"
      >
        {{ showTags ? '收起' : '展开' }}标签列表
      </button>
    </div>
    <div
      class="overflow-hidden" :class="{
        'h-[200px] mask': !showTags,
      }"
    >
      <button
        v-for="tag in tags" :key="tag.name" class="bg-black/20 rounded-sm mx-1 my-0.5 px-0.5 text-sm" :class="{
          '!bg-gray-400': tag.name === filterConfig.tag.name,
        }" @click="handleClickTag(tag.name)"
      >
        {{ `${showTagTranslation ? tag.translated_name || tag.name : tag.name} ${tag.count}` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { githubLink } from '@/config'
import { useStore } from '@/store'

const props = defineProps<{
  images: Image[]
}
>()

const store = useStore()
const { col, gap, filterConfig, showSidebar, showTagTranslation, showImageNo, darkMode, isFullscreen } = toRefs(store)

const configLoaded = ref(false)
const showAuthor = ref(false)
const showTags = ref(false)

const years = ref([] as number[])
const authors = ref([] as AuthorData[])
const tags = ref([] as TagData[])

watchEffect(() => {
  const _years: number[] = []
  const _tags: { [index: string]: TagData } = {}
  const _authors: { [index: string]: AuthorData } = {}
  props.images.forEach((image) => {
    // 统计年份
    const year = Number(image.detail.created_at.split('-')[0])
    if (!_years.includes(year) && year > 2000)
      _years.push(year)

    // 过滤年份
    if (filterConfig.value.year.enable) {
      if (filterConfig.value.year.value === 1) {
        if (year > 2000)
          return false
      }
      else if (year !== filterConfig.value.year.value) {
        return false
      }
    }

    // 过滤 R18 图片
    if (!filterConfig.value.restrict.r18) {
      if (image.detail.x_restrict >= 1)
        return
    }

    // 过滤健全度
    if (image.detail.sanity_level > filterConfig.value.restrict.sanity.max)
      return

    // 计算作者数据
    const { author } = image.detail
    if (Object.hasOwn(_authors, author.id))
      _authors[author.id].count++
    else
      _authors[author.id] = { ...author, count: 1 }

    // 计算标签数据
    image.detail.tags.forEach((tag) => {
      if (filterConfig.value.author.enable) {
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
  years.value = _years
  tags.value = Object.keys(_tags)
    .map(tagName => _tags[tagName])
    .filter(tag => !tag.name.includes('users入り') || filterConfig.value.tag.includeBookmark)
    .filter(tag => tag.count >= filterConfig.value.tag.includeRatherThan)
    .sort((a, b) => b.count - a.count)
  authors.value = Object.keys(_authors)
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
  localStorage.setItem('tagTranslation', showTagTranslation.value.toString())
  localStorage.setItem('showImageNo', showImageNo.value.toString())
})

onMounted(() => {
  col.value = Number(localStorage.getItem('col')) || -1
  gap.value = Number(localStorage.getItem('gap')) || 10
  filterConfig.value.restrict.r18 = localStorage.getItem('r18') === 'true'
  filterConfig.value.restrict.sanity.max = Number(localStorage.getItem('sanity')) || 2
  showTagTranslation.value = localStorage.getItem('tagTranslation') === 'true'
  showImageNo.value = localStorage.getItem('showImageNo') === 'true'
  configLoaded.value = true
})

function confirmR18() {
  if (filterConfig.value.restrict.r18) {
    filterConfig.value.restrict.r18 = false
  }
  // eslint-disable-next-line no-alert
  else if (confirm('确认显示R18内容？')) {
    filterConfig.value.restrict.r18 = true
    filterConfig.value.restrict.sanity.max = 6
  }
}

function handleClickYear(year: number) {
  if (filterConfig.value.year.enable && filterConfig.value.year.value === year) {
    filterConfig.value.year.enable = false
    filterConfig.value.year.value = 0
  }
  else {
    filterConfig.value.year.value = year
    filterConfig.value.year.enable = true
  }
}

function handleClickAuthor(authorId: number) {
  if (filterConfig.value.author.enable && filterConfig.value.author.id === authorId) {
    filterConfig.value.author.enable = false
    filterConfig.value.author.id = -1
  }
  else {
    filterConfig.value.author.id = authorId
    filterConfig.value.author.enable = true
  }
}

function handleClickTag(tagName: string) {
  if (filterConfig.value.tag.enable && filterConfig.value.tag.name === tagName) {
    filterConfig.value.tag.enable = false
    filterConfig.value.tag.name = ''
  }
  else {
    filterConfig.value.tag.name = tagName
    filterConfig.value.tag.enable = true
  }
}

function openGithub() {
  window.open(githubLink, '_blank')
}
</script>

<style>
.mask {
  mask: linear-gradient(to top, transparent, rgb(0, 0, 0) 60px, rgb(0, 0, 0) 100%);
}
</style>
