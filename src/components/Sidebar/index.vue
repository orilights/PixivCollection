<template>
  <Transition name="popup-l">
    <div
      v-show="showSidebar"
      class="fixed w-full lg:block top-[60px] sm:top-0 left-0 h-[calc(100vh-60px)] sm:h-screen sm:w-[400px] bg-white overflow-x-hidden overflow-y-auto px-2 pt-2 transition-all dark:bg-[#242424] duration-500 z-30"
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
      <!-- <button class="absolute right-2 top-2" @click="showSidebar = false">
      <IconClose class="w-6 h-6" />
    </button> -->
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
  </Transition>
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
