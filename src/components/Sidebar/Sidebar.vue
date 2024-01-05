<template>
  <Transition name="popup-l">
    <div
      v-show="showSidebar"
      class="fixed left-0 top-[60px] z-30 h-[calc(100vh-60px)] w-full overflow-y-auto overflow-x-hidden bg-white px-2 py-3 transition-all duration-500 sm:top-0 sm:h-screen sm:w-[400px] lg:block dark:bg-[#242424]"
    >
      <div class="mx-10 mb-2 flex justify-between lg:hidden">
        <button
          class="h-[60px] w-[60px]"
          @click="openGithub"
        >
          <IconGithub class="mx-auto h-6 w-6" />
        </button>
        <button
          class="h-[60px] w-[60px] "
          @click="store.toggleColorScheme"
        >
          <IconSun v-if="preferColorScheme === 'light'" class="mx-auto h-6 w-6" />
          <IconMoon v-if="preferColorScheme === 'dark'" class="mx-auto h-5 w-5" />
          <IconAuto v-if="preferColorScheme === 'auto'" class="mx-auto h-5 w-5" />
        </button>
        <button
          class="h-[60px] w-[60px]"
          @click="store.toggleFullscreen"
        >
          <IconShrink v-if="isFullscreen" class="mx-auto h-5 w-5" />
          <IconExpand v-else class="mx-auto h-5 w-5" />
        </button>
      </div>
      <SidebarHead>浏览设置</SidebarHead>
      <SidebarBlock>
        <div>
          列数:
          <select
            v-model.number="masonryConfig.col"
            class="mx-1 rounded-md border px-1 py-0.5 transition-colors hover:border-blue-500 dark:border-white/20 dark:bg-[#1a1a1a] dark:hover:border-blue-500"
          >
            <option value="-1">
              自动
            </option>
            <option v-for="i in MASONRY_MAX_COLUMNS" :key="i" :value="i">
              {{ i }}
            </option>
          </select>
          间隙:
          <select
            v-model.number="masonryConfig.gap"
            class="mx-1 rounded-md border px-1 py-0.5 transition-colors hover:border-blue-500 dark:border-white/20 dark:bg-[#1a1a1a] dark:hover:border-blue-500"
          >
            <option v-for="i in MASONRY_IMAGE_GAP_LIST" :key="i" :value="i">
              {{ `${i}px` }}
            </option>
          </select>
        </div>
        <div class="mt-1 flex items-center">
          图片铺满屏幕<Switch v-model="masonryConfig.containerFullWidth" class="ml-3" />
        </div>
        <div v-if="masonryConfig.col === -1" class="mt-1">
          图片最小宽度:
          <select
            v-model.number="masonryConfig.imageMinWidth"
            class="mx-1 rounded-md border px-1 py-0.5 transition-colors hover:border-blue-500 dark:border-white/20 dark:bg-[#1a1a1a] dark:hover:border-blue-500"
          >
            <option v-for="i in MASONRY_IMAGE_SIZE_LIST" :key="i" :value="i">
              {{ i }}px
            </option>
          </select>
        </div>
      </SidebarBlock>
      <SidebarBlock>
        <div class="flex items-center">
          合并显示多P图片<Switch v-model="masonryConfig.mergeSameIdImage" class="ml-3" />
        </div>
        <div class="flex items-center">
          图片信息外置<Switch v-model="masonryConfig.infoAtBottom" class="ml-3" />
        </div>
        <div class="flex items-center">
          标签包含收藏<Switch v-model="filterConfig.tag.includeBookmark" class="ml-3" />
        </div>
        <div class="flex items-center">
          使用标签翻译<Switch v-model="masonryConfig.showTagTranslation" class="ml-3" />
        </div>
      </SidebarBlock>
      <SidebarHead>图片筛选</SidebarHead>
      <SidebarBlock>
        已选项
        <br>
        <button
          v-if="filterConfig.year.enable"
          class="m-0.5 rounded-sm bg-yellow-300/20 px-0.5 text-sm"
          @click="handleClickYear(filterConfig.year.value)"
        >
          {{ `年份：${filterConfig.year.value}` }}
        </button>
        <button
          v-if="filterConfig.shape.enable"
          class="m-0.5 rounded-sm bg-green-300/20 px-0.5 text-sm"
          @click="handleClickShape(filterConfig.shape.value)"
        >
          {{ `方向：${filterConfig.shape.value}` }}
        </button>
        <button
          v-if="filterConfig.author.enable"
          class="m-0.5 rounded-sm bg-blue-500/20 px-0.5 text-sm"
          @click="handleClickAuthor(filterConfig.author.id)"
        >
          {{ `作者：${filterConfig.author.id}` }}
        </button>
        <button
          v-if="filterConfig.tag.enable"
          class="m-0.5 rounded-sm bg-black/20 px-0.5 text-sm"
          @click="handleClickTag(filterConfig.tag.name)"
        >
          {{ `标签：${filterConfig.tag.name}` }}
        </button>
        <button
          v-if="filterConfig.bookmark.enable"
          class="m-0.5 rounded-sm bg-orange-300/20 px-0.5 text-sm"
          @click="handleClickBookmark(filterConfig.bookmark.min)"
        >
          {{ `收藏数：${filterConfig.bookmark.min}` }}
        </button>
      </SidebarBlock>
      <SidebarBlock>
        最高不健全度:
        <select
          v-model.number="filterConfig.restrict.maxSanityLevel"
          class="mx-1 rounded-md border px-1 py-0.5 transition-colors hover:border-blue-500 dark:border-white/20 dark:bg-[#1a1a1a] dark:hover:border-blue-500"
        >
          <option v-for="i in [2, 4, 6]" :key="i" :value="i">
            {{ i }}
          </option>
        </select>
        R18:
        <select
          v-model="filterConfig.restrict.r18"
          class="mx-1 rounded-md border px-1 py-0.5 transition-colors hover:border-blue-500 dark:border-white/20 dark:bg-[#1a1a1a] dark:hover:border-blue-500"
          @change="handleChangeR18"
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
      </SidebarBlock>
      <SidebarBlock>
        年份
        <br>
        <button
          v-for="year in years" :key="year"
          class="m-0.5 rounded-sm bg-yellow-300/20 px-0.5 text-sm"
          :class="{
            '!bg-gray-400': year === filterConfig.year.value,
          }"
          @click="handleClickYear(year)"
        >
          {{ year }}
        </button>
        <button
          class="m-0.5 rounded-sm bg-yellow-300/20 px-0.5 text-sm"
          :class="{
            '!bg-gray-400': 1 === filterConfig.year.value,
          }"
          @click="handleClickYear(1)"
        >
          未知
        </button>
      </SidebarBlock>
      <SidebarBlock>
        形状
        <br>
        <button
          v-for="shape in Object.keys(FILTER_SHAPES)" :key="shape"
          class="m-0.5 rounded-sm bg-green-300/20 px-0.5 text-sm"
          :class="{
            '!bg-gray-400': shape === filterConfig.shape.value,
          }"
          @click="handleClickShape(shape)"
        >
          {{ FILTER_SHAPES[shape] }}
        </button>
      </SidebarBlock>
      <SidebarBlock>
        <div class="flex items-center">
          尺寸<Switch v-model="filterConfig.size.enable" class="ml-3" />
        </div>
        <div v-if="filterConfig.size.enable">
          <div class="my-1 flex">
            <div>
              宽度 最小：<TextBox
                v-model.number="filterConfig.size.width.min" type="number" min="0" max="10000"
                placeholder="未启用"
              />
            </div>
            <div>
              最大：<TextBox
                v-model.number="filterConfig.size.width.max" type="number" min="0" max="10000"
                placeholder="未启用"
              />
            </div>
          </div>
          <div class="my-1 flex">
            <div>
              高度 最小：<TextBox
                v-model.number="filterConfig.size.height.min" type="number" min="0" max="10000"
                placeholder="未启用"
              />
            </div>
            <div>
              最大：<TextBox
                v-model.number="filterConfig.size.height.max" type="number" min="0" max="10000"
                placeholder="未启用"
              />
            </div>
          </div>
        </div>
      </SidebarBlock>
      <SidebarBlock>
        <div>
          作者
          <TextBox v-model.trim="searchAuthor" placeholder="搜索作者" />
          <CButton v-if="authors.length > 20 && searchAuthor === ''" @click="showFullAuthor = !showFullAuthor">
            {{ showFullAuthor ? '收起' : '展开' }}
          </CButton>
          <CButton v-if="searchAuthor !== ''" @click="searchAuthor = ''">
            清除
          </CButton>
        </div>
        <div
          :class="{
            mask: !showFullAuthor && authors.length > 20 && searchAuthor === '',
          }"
        >
          <div v-if="searchAuthor !== '' && filteredAuthors.length === 0" class="text-center text-gray-400">
            未搜索到结果
          </div>
          <button
            v-for="author in filteredAuthors" :key="author.id"
            class="m-0.5 rounded-sm bg-blue-500/20 px-0.5 text-sm"
            :class="{
              '!bg-gray-400': author.id === filterConfig.author.id,
            }"
            @click="handleClickAuthor(author.id)"
          >
            {{ `${author.name} ${author.count}` }}
          </button>
        </div>
      </SidebarBlock>
      <SidebarBlock>
        <div>
          标签
          <TextBox v-model.trim="searchTag" placeholder="搜索标签" />
          <CButton v-if="tags.length > 10 && searchTag === ''" @click="showFullTags = !showFullTags">
            {{ showFullTags ? '收起' : '展开' }}
          </CButton>
          <CButton v-if="searchTag !== ''" @click="searchTag = ''">
            清除
          </CButton>
        </div>
        <div
          :class="{
            mask: !showFullTags && tags.length > 10 && searchTag === '',
          }"
        >
          <div v-if="searchAuthor !== '' && filteredAuthors.length === 0" class="text-center text-gray-400">
            未搜索到结果
          </div>
          <button
            v-for="tag in filteredTags" :key="tag.name"
            class="m-0.5 rounded-sm bg-black/20 px-0.5 text-sm"
            :class="{
              '!bg-gray-400': tag.name === filterConfig.tag.name,
            }"
            @click="handleClickTag(tag.name)"
          >
            {{ `${masonryConfig.showTagTranslation ? tag.translated_name || tag.name : tag.name} ${tag.count}` }}
          </button>
        </div>
      </SidebarBlock>
      <SidebarBlock>
        收藏数
        <br>
        <button
          v-for="bookmark in FILTER_BOOKMARKS" :key="bookmark"
          class="m-0.5 rounded-sm bg-orange-300/20 px-0.5 text-sm"
          :class="{
            '!bg-gray-400': bookmark === filterConfig.bookmark.min,
          }"
          @click="handleClickBookmark(bookmark)"
        >
          {{ bookmark }}
        </button>
        <button
          class="m-0.5 rounded-sm bg-orange-300/20 px-0.5 text-sm"
          :class="{
            '!bg-gray-400': -1 === filterConfig.bookmark.min,
          }"
          @click="handleClickBookmark(-1)"
        >
          未知
        </button>
      </SidebarBlock>
      <SidebarHead>高级选项</SidebarHead>
      <SidebarBlock>
        <div class="flex items-center">
          启用虚拟列表<Switch v-model="masonryConfig.virtualListEnable" class="ml-3" />
        </div>
        <div class="flex items-center">
          显示卡片阴影<Switch v-model="masonryConfig.showShadow" class="ml-3" />
        </div>
        <div class="mt-1">
          <CButton class="mb-1" @click="clearLocalSettings">
            还原默认设置
          </CButton>
          <CButton class="mb-1" @click="loadDataFromFile">
            从文件加载元数据
          </CButton>
          <CButton class="mb-1" @click="exportFilteredData">
            导出当前筛选结果
          </CButton>
        </div>
      </SidebarBlock>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { FILTER_BOOKMARKS, FILTER_SHAPES, LINK_GITHUB, MASONRY_IMAGE_GAP_LIST, MASONRY_IMAGE_SIZE_LIST, MASONRY_MAX_COLUMNS } from '@/config'
import { useStore } from '@/store'
import { exportFile } from '@/utils'

const store = useStore()
const {
  preferColorScheme,
  showSidebar,
  images,
  filterConfig,
  masonryConfig,
  isFullscreen,
} = toRefs(store)

const years = ref<number[]>([])
const authors = ref<AuthorData[]>([])
const tags = ref<TagData[]>([])
const showFullAuthor = ref(false)
const showFullTags = ref(false)
const searchAuthor = ref('')
const searchTag = ref('')

const filteredAuthors = computed(() => {
  if (searchAuthor.value !== '') {
    const searchStr = searchAuthor.value.toLowerCase()
    return authors.value.filter((author) => {
      return `${author.name}_${author.account}_${author.id}`.toLowerCase().includes(searchStr)
    })
  }
  else {
    if (showFullAuthor.value)
      return authors.value
    else
      return authors.value.slice(0, 20)
  }
})
const filteredTags = computed(() => {
  if (searchTag.value !== '') {
    const searchStr = searchTag.value.toLowerCase()
    return tags.value.filter((tag) => {
      return `${tag.name}_${tag.translated_name}`.toLowerCase().includes(searchStr)
    })
  }
  else {
    if (showFullTags.value)
      return tags.value
    else
      return tags.value.slice(0, 10)
  }
})

watchEffect(() => {
  const _years: number[] = []
  const _tags: { [index: string]: TagData } = {}
  const _authors: { [index: string]: AuthorData } = {}
  images.value.forEach((image) => {
    // 统计年份
    const year = Number(image.created_at.split('-')[0])
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
      if (image.x_restrict >= 1)
        return false
    }
    else if (filterConfig.value.restrict.r18 === 'only') {
      if (image.x_restrict < 1)
        return false
    }

    // 过滤不健全度
    if (image.sanity_level > filterConfig.value.restrict.maxSanityLevel)
      return

    // 计算作者数据
    const { author } = image
    if (Object.hasOwn(_authors, author.id))
      _authors[author.id].count++
    else
      _authors[author.id] = { ...author, count: 1 }

    // 计算标签数据
    image.tags.forEach((tag) => {
      if (filterConfig.value.author.enable) {
        if (image.author.id !== filterConfig.value.author.id)
          return
      }
      if (image.sanity_level > filterConfig.value.restrict.maxSanityLevel)
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

function handleClickBookmark(bookmark: number) {
  if (filterConfig.value.bookmark.enable && filterConfig.value.bookmark.min === bookmark) {
    filterConfig.value.bookmark.enable = false
    filterConfig.value.bookmark.min = 0
  }
  else {
    filterConfig.value.bookmark.min = bookmark
    filterConfig.value.bookmark.enable = true
  }
}

function handleChangeR18(event: Event) {
  const target = event.target as HTMLSelectElement
  if (target.value === 'show' || target.value === 'only')
    filterConfig.value.restrict.maxSanityLevel = 6
}

function openGithub() {
  window.open(LINK_GITHUB, '_blank')
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
  store.settings.clear()
  location.reload()
}

function exportFilteredData() {
  exportFile(JSON.stringify(store.imagesFiltered))
}
</script>

<style>
.mask {
  mask: linear-gradient(to top, transparent, rgb(0, 0, 0) 30px, rgb(0, 0, 0) 100%);
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
