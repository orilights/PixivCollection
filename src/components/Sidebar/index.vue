<template>
  <Transition name="popup-l">
    <div
      v-show="showSidebar"
      class="fixed w-full lg:block top-[60px] sm:top-0 left-0 h-[calc(100vh-60px)] sm:h-screen sm:w-[400px] bg-white overflow-x-hidden overflow-y-auto px-2 py-3 transition-all dark:bg-[#242424] duration-500 z-30"
    >
      <div class="mb-2 mx-10 lg:hidden flex justify-between">
        <button
          class="w-[60px] h-[60px]"
          @click="openGithub"
        >
          <IconGithub class="w-6 h-6 mx-auto" />
        </button>
        <button
          class="w-[60px] h-[60px] "
          @click="store.toggleDarkMode"
        >
          <IconSun v-if="!darkMode" class="w-6 h-6 mx-auto" />
          <IconMoon v-else class="w-5 h-5 mx-auto" />
        </button>
        <button
          class="w-[60px] h-[60px]"
          @click="store.toggleFullscreen"
        >
          <IconShrink v-if="isFullscreen" class="w-5 h-5 mx-auto" />
          <IconExpand v-else class="w-5 h-5 mx-auto" />
        </button>
      </div>
      <h2 class="font-bold text-2xl pt-2 pb-1">
        浏览设置
      </h2>
      <div class="my-1">
        虚拟列表:
        <select
          v-model="masonryConfig.virtualListImpl"
          class="border px-1 py-0.5 mx-1 rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]"
        >
          <option value="default">
            默认
          </option>
          <option value="virtual-scroller">
            Vue Virtual Scroller
          </option>
          <option value="none">
            关闭
          </option>
        </select>
      </div>
      <div class="my-1">
        列数:
        <select
          v-model.number="masonryConfig.col"
          class="border px-1 py-0.5 mx-1 rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]"
        >
          <option value="-1">
            自动
          </option>
          <option v-for="i in 10" :key="i" :value="i">
            {{ i }}
          </option>
        </select>
        间隙:
        <select
          v-model.number="masonryConfig.gap"
          class="border px-1 py-0.5 mx-1 rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]"
        >
          <option v-for="i in [0, 1, 2, 5, 10, 20]" :key="i" :value="i">
            {{ `${i}px` }}
          </option>
        </select>
      </div>
      <div v-if="masonryConfig.col === -1" class="my-1">
        图片最小宽度:
        <select
          v-model.number="masonryConfig.imageMinWidth"
          class="border px-1 py-0.5 mx-1 rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]"
        >
          <option v-for="i in [240, 300, 360, 420, 480]" :key="i" :value="i">
            {{ i }}px
          </option>
        </select>
      </div>
      <div class="my-1 flex items-center">
        图片铺满屏幕<Switch v-model="masonryConfig.containerFullWidth" class="ml-3" />
      </div>
      <div class="my-1 flex items-center">
        标签包含收藏<Switch v-model="filterConfig.tag.includeBookmark" class="ml-3" />
      </div>
      <div class="my-1 flex items-center">
        显示图片序号<Switch v-model="masonryConfig.showImageNo" class="ml-3" />
      </div>
      <div class="my-1 flex items-center">
        显示标签翻译<Switch v-model="masonryConfig.showTagTranslation" class="ml-3" />
      </div>
      <div class="my-1 flex items-center">
        图片信息外置<Switch v-model="masonryConfig.infoAtBottom" class="ml-3" />
      </div>
      <h2 class="font-bold text-2xl pt-2 pb-1">
        图片筛选
      </h2>
      <div class="my-1">
        最高健全度:
        <select
          v-model.number="filterConfig.restrict.maxSanityLevel"
          class="border px-1 py-0.5 mx-1 rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]"
        >
          <option v-for="i in [2, 4, 6]" :key="i" :value="i">
            {{ i }}
          </option>
        </select>
        R18:
        <select
          v-model="filterConfig.restrict.r18"
          class="border px-1 py-0.5 mx-1 rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]"
        >
          <option value="hidden">
            隐藏
          </option>
          <option value="show">
            显示
          </option>
          <option value="only">
            仅显示
          </option>
        </select>
      </div>
      <div class="my-1 border rounded-md">
        <button
          v-if="filterConfig.year.enable"
          class="bg-yellow-300/20 rounded-sm mx-1 my-0.5 px-0.5 text-sm"
          @click="handleClickYear(filterConfig.year.value)"
        >
          {{ `年份：${filterConfig.year.value}` }}
        </button>
        <button
          v-if="filterConfig.shape.enable"
          class="bg-green-300/20 rounded-sm mx-1 my-0.5 px-0.5 text-sm"
          @click="handleClickShape(filterConfig.shape.value)"
        >
          {{ `方向：${filterConfig.shape.value}` }}
        </button>
        <button
          v-if="filterConfig.author.enable"
          class="bg-blue-500/20 rounded-sm mx-1 my-0.5 px-0.5 text-sm"
          @click="handleClickAuthor(filterConfig.author.id)"
        >
          {{ `作者：${filterConfig.author.id}` }}
        </button>
        <button
          v-if="filterConfig.tag.enable"
          class="bg-black/20 rounded-sm mx-1 my-0.5 px-0.5 text-sm"
          @click="handleClickTag(filterConfig.tag.name)"
        >
          {{ `标签：${filterConfig.tag.name}` }}
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
      <div class="my-1">
        形状：<button
          class="bg-green-300/20 rounded-sm mx-1 my-0.5 px-0.5 text-sm"
          :class="{
            '!bg-gray-400': 'horizontal' === filterConfig.shape.value,
          }"
          @click="handleClickShape('horizontal')"
        >
          横向
        </button>
        <button
          class="bg-green-300/20 rounded-sm mx-1 my-0.5 px-0.5 text-sm"
          :class="{
            '!bg-gray-400': 'vertical' === filterConfig.shape.value,
          }"
          @click="handleClickShape('vertical')"
        >
          竖向
        </button>
        <button
          class="bg-green-300/20 rounded-sm mx-1 my-0.5 px-0.5 text-sm"
          :class="{
            '!bg-gray-400': 'square' === filterConfig.shape.value,
          }"
          @click="handleClickShape('square')"
        >
          方形
        </button>
      </div>
      <div class="my-1">
        <div class="flex items-center">
          启用尺寸筛选<Switch v-model="filterConfig.size.enable" class="ml-3" />
        </div>
        <div v-if="filterConfig.size.enable">
          <div class="flex my-1">
            <div>
              宽度 最小：<input
                v-model.number="filterConfig.size.width.min" type="number" min="0" max="10000"
                placeholder="未启用"
                class="border px-1 py-0.5 mx-1 rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]"
              >
            </div>
            <div>
              最大：<input
                v-model.number="filterConfig.size.width.max" type="number" min="0" max="10000"
                placeholder="未启用"
                class="border px-1 py-0.5 mx-1 rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]"
              >
            </div>
          </div>
          <div class="flex my-1">
            <div>
              高度 最小：<input
                v-model.number="filterConfig.size.height.min" type="number" min="0" max="10000"
                placeholder="未启用"
                class="border px-1 py-0.5 mx-1 rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]"
              >
            </div>
            <div>
              最大：<input
                v-model.number="filterConfig.size.height.max" type="number" min="0" max="10000"
                placeholder="未启用"
                class="border px-1 py-0.5 mx-1 rounded-md hover:border-blue-500 transition-colors dark:bg-[#1a1a1a]"
              >
            </div>
          </div>
        </div>
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
          v-for="author in authors.filter((_, i) => { return i < 30 || showAuthor })" :key="author.id"
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
          v-for="tag in tags.filter((_, i) => { return i < 30 || showTags })" :key="tag.name"
          class="bg-black/20 rounded-sm mx-1 my-0.5 px-0.5 text-sm"
          :class="{
            '!bg-gray-400': tag.name === filterConfig.tag.name,
          }"
          @click="handleClickTag(tag.name)"
        >
          {{ `${masonryConfig.showTagTranslation ? tag.translated_name || tag.name : tag.name} ${tag.count}` }}
        </button>
      </div>
      <h2 class="font-bold text-2xl pt-2 pb-1">
        自定义数据源
      </h2>
      <div class="my-1">
        <button
          class="px-2 mx-1 border rounded-md hover:border-blue-500 transition-colors"
          @click="loadDataFromFile"
        >
          从文件加载
        </button>
      </div>
      <h2 class="font-bold text-2xl pt-2 pb-1">
        高级选项
      </h2>
      <div class="my-1">
        <button
          class="px-2 mx-1 border rounded-md hover:border-blue-500 transition-colors"
          @click="clearLocalSettings"
        >
          还原默认设置
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { githubLink } from '@/config'
import { useStore } from '@/store'

const store = useStore()
const {
  darkMode,
  showSidebar,
  images,
  filterConfig,
  masonryConfig,
  isFullscreen,
} = toRefs(store)

const showAuthor = ref(false)
const showTags = ref(false)

const years = ref([] as number[])
const authors = ref([] as AuthorData[])
const tags = ref([] as TagData[])

watchEffect(() => {
  const _years: number[] = []
  const _tags: { [index: string]: TagData } = {}
  const _authors: { [index: string]: AuthorData } = {}
  images.value.forEach((image) => {
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

    // 过滤 R18
    if (filterConfig.value.restrict.r18 === 'hidden') {
      if (image.detail.x_restrict >= 1)
        return false
    }
    else if (filterConfig.value.restrict.r18 === 'only') {
      if (image.detail.x_restrict < 1)
        return false
    }

    // 过滤健全度
    if (image.detail.sanity_level > filterConfig.value.restrict.maxSanityLevel)
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
      if (image.detail.sanity_level > filterConfig.value.restrict.maxSanityLevel)
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

function handleClickShape(shape: string) {
  if (filterConfig.value.shape.enable && filterConfig.value.shape.value === shape) {
    filterConfig.value.shape.enable = false
    filterConfig.value.shape.value = ''
  }
  else {
    filterConfig.value.shape.value = shape
    filterConfig.value.shape.enable = true
  }
}

function openGithub() {
  window.open(githubLink, '_blank')
}

function loadDataFromFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = JSON.parse(e.target?.result as string)
        store.images = data
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

function clearLocalSettings() {
  localStorage.clear()
  location.reload()
}
</script>

<style>
.mask {
  mask: linear-gradient(to top, transparent, rgb(0, 0, 0) 60px, rgb(0, 0, 0) 100%);
}

.popup-l-enter-active,
.popup-l-leave-active {
  transition: transform,opacity 0.3s;
}

.popup-l-enter-from,
.popup-l-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}
</style>
