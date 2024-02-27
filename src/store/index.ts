import { Settings } from '@orilight/vue-settings'
import { useFullscreen, usePreferredColorScheme } from '@vueuse/core'
import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
  state: () => ({
    showSidebar: false,
    showNav: true,

    images: <Image[]>[],
    imagesLoaded: new Set(),

    fullscreen: useFullscreen(document.documentElement),

    preferColorScheme: 'auto' as 'auto' | 'light' | 'dark',
    browserColorScheme: usePreferredColorScheme(),

    settings: new Settings('PXCT'),

    imageViewer: {
      show: false,
      showInfo: true,
      info: null as Image | null,
      prev: () => {},
      next: () => {},
      index: -1,
    },
    masonryConfig: {
      col: -1,
      gap: 20,
      imageMinWidth: 240,
      containerFullWidth: true,
      mergeSameIdImage: true,
      infoAtBottom: false,
      showTagTranslation: true,
      imageSortBy: 'id_desc' as 'id_desc' | 'id_asc' | 'bookmark_desc',
      virtualListEnable: true,
      showShadow: false,
    },
    filterConfig: {
      search: {
        enable: false,
        value: '',
      },
      year: {
        enable: false,
        value: 0,
      },
      tag: {
        enable: false,
        name: '',
        includeBookmark: false,
        includeRatherThan: 5,
      },
      author: {
        enable: false,
        id: -1,
      },
      shape: {
        enable: false,
        value: '',
      },
      size: {
        enable: false,
        width: { max: null, min: null },
        height: { max: null, min: null },
      },
      bookmark: {
        enable: false,
        min: 0,
      },
      restrict: {
        maxSanityLevel: 2,
        r18: 'hidden' as 'hidden' | 'show' | 'only',
      },
    },
    debug: {
      enable: false,
      masonryContainerHeight: 0,
      masonryContainerTop: 0,
      masonryItemRenderLength: 0,
      masonryItemRenderTop: 0,
      masonryItemRenderBottom: 0,
      masonryRefreshCount: 0,
      screenWidth: 0,
      screenHeight: 0,
    },
  }),
  getters: {
    isFullscreen(): boolean {
      return this.fullscreen.isFullscreen
    },
    colorScheme(): 'light' | 'dark' {
      if (this.preferColorScheme === 'auto') {
        if (this.browserColorScheme === 'no-preference')
          return 'light'
        return this.browserColorScheme
      }
      return this.preferColorScheme
    },
    imageFilter() {
      return (image: Image) => {
        // 过滤_不健全度
        if (this.filterConfig.restrict.r18 === 'hidden') {
          if (image.x_restrict >= 1)
            return false
        }
        else if (this.filterConfig.restrict.r18 === 'only') {
          if (image.x_restrict < 1)
            return false
        }
        if (this.filterConfig.restrict.maxSanityLevel) {
          if (image.sanity_level > this.filterConfig.restrict.maxSanityLevel)
            return false
        }
        // 搜索
        if (this.filterConfig.search.enable) {
          if (this.filterConfig.search.value.trim() !== '' && image.searchStr !== undefined) {
            if (!image.searchStr.includes(this.filterConfig.search.value.trim().toLowerCase()))
              return false
          }
          return true
        }
        if (this.filterConfig.bookmark.enable) {
          if (this.filterConfig.bookmark.min === -1) {
            if (image.bookmark !== -1)
              return false
          }
          if (image.bookmark < this.filterConfig.bookmark.min)
            return false
        }
        // 过滤_年份
        if (this.filterConfig.year.enable) {
          const year = Number(image.created_at.split('-')[0])
          if (this.filterConfig.year.value === 1) {
            if (year > 2000)
              return false
          }
          else if (year !== this.filterConfig.year.value) {
            return false
          }
        }
        // 过滤_作者
        if (this.filterConfig.author.enable) {
          if (image.author.id !== this.filterConfig.author.id)
            return false
        }
        // 过滤_标签
        if (this.filterConfig.tag.enable) {
          if ((image.tags.find((tag) => {
            if (tag.name === this.filterConfig.tag.name)
              return tag
            return undefined
          })) === undefined)
            return false
        }
        // 过滤_形状
        if (this.filterConfig.shape.enable) {
          if (this.filterConfig.shape.value.startsWith('ratio-')) {
            const _ratioStr = this.filterConfig.shape.value.substring(6)
              .split(':')
              .map(str => Number(str))
            const ratio = _ratioStr[0] / _ratioStr[1]
            if (image.size[0] / image.size[1] >= ratio / 0.9 || image.size[0] / image.size[1] <= ratio * 0.9)
              return false
          }
          else if (image.size[0] / image.size[1] < 0.9 || image.size[0] / image.size[1] > 1.1) {
            if (this.filterConfig.shape.value === 'square')
              return false
            if (image.size[0] > image.size[1]) {
              if (this.filterConfig.shape.value === 'vertical')
                return false
            }
            else {
              if (this.filterConfig.shape.value === 'horizontal')
                return false
            }
          }
          else {
            if (this.filterConfig.shape.value === 'vertical' || this.filterConfig.shape.value === 'horizontal')
              return false
          }
        }
        // 过滤_尺寸
        if (this.filterConfig.size.enable) {
          const { max: wMax, min: wMin } = this.filterConfig.size.width
          if (wMax) {
            if (image.size[0] > wMax)
              return false
          }
          if (wMin) {
            if (image.size[0] < wMin)
              return false
          }
          const { max: hMax, min: hMin } = this.filterConfig.size.height
          if (hMax) {
            if (image.size[1] > hMax)
              return false
          }
          if (hMin) {
            if (image.size[1] < hMin)
              return false
          }
        }
        return true
      }
    },
    imagesFiltered(): Image[] {
      return this.images.filter(this.imageFilter)
    },
  },
  actions: {
    openImageViewer(image: Image, prev: () => void, next: () => void, index: number): void {
      this.imageViewer.show = true
      this.imageViewer.info = image
      this.imageViewer.prev = prev
      this.imageViewer.next = next
      this.imageViewer.index = index
    },
    closeImageViewer(): void {
      this.imageViewer.show = false
    },
    updateSeatchValue(value: string): void {
      this.filterConfig.search.value = value
    },
    toggleColorScheme(): void {
      switch (this.preferColorScheme) {
        case 'auto':
          this.preferColorScheme = 'light'
          break
        case 'light':
          this.preferColorScheme = 'dark'
          break
        case 'dark':
          this.preferColorScheme = 'auto'
          break
        default:
          this.preferColorScheme = 'auto'
          break
      }
    },
    toggleFullscreen(): void {
      this.fullscreen.toggle()
    },
    toggleSearch(): void {
      if (this.filterConfig.search.enable) {
        this.updateSeatchValue('')
      }
      else {
        this.images.forEach((image) => {
          if (image.searchStr === undefined) {
            image.searchStr = (
              image.id
              + image.title
              + image.author.id
              + image.author.name
              + image.tags
                .map(
                  tag => tag.translated_name
                    ? tag.name + tag.translated_name
                    : tag.name,
                ).join()
            ).toLowerCase()
          }
        })
      }
      this.filterConfig.search.enable = !this.filterConfig.search.enable
    },
    filterAuthor(authorId: number): void {
      if (this.filterConfig.author.enable && this.filterConfig.author.id === authorId) {
        this.filterConfig.author.enable = false
        this.filterConfig.author.id = -1
        return
      }
      this.filterConfig.author.id = authorId
      this.filterConfig.author.enable = true

      if (this.filterConfig.search.enable)
        this.toggleSearch()
    },
    viewImage(idx: number): void {
      if (idx < 0 || idx >= this.imagesFiltered.length)
        return
      this.openImageViewer(
        this.imagesFiltered[idx],
        () => {
          this.viewImage(idx - 1)
        },
        () => {
          this.viewImage(idx + 1)
        },
        idx,
      )
    },
    sortImages(): void {
      this.images.sort((a, b) => {
        if (a.id === b.id)
          return a.part - b.part
        if (this.masonryConfig.imageSortBy === 'bookmark_desc')
          return b.bookmark - a.bookmark
        if (this.masonryConfig.imageSortBy === 'id_desc')
          return b.id - a.id
        return (a.id - b.id)
      })
    },

  },
})
