import { useFullscreen, useUrlSearchParams } from '@vueuse/core'
import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
  state: () => ({
    darkMode: false,
    showSidebar: false,
    showNav: true,

    imageViewerShow: false,
    imageViewerInfo: <Image>{},
    imageViewerPrev: () => {},
    imageViewerNext: () => {},

    images: <Image[]>[],

    urlParams: useUrlSearchParams(),
    fullscreen: useFullscreen(document.documentElement),

    masonryConfig: {
      col: -1,
      gap: 20,
      imageMinWidth: 240,
      containerFullWidth: false,
      showTagTranslation: false,
      showImageNo: false,
      infoAtBottom: false,
      virtualListEnable: true,
      virtualListPreload: 3,
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
      restrict: {
        maxSanityLevel: 4,
        r18: 'hidden',
      },
    },
  }),
  getters: {
    isFullscreen(): boolean {
      return this.fullscreen.isFullscreen
    },
    imageFilter() {
      return (image: Image) => {
        // 过滤_健全度
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
          if (this.filterConfig.search.value.trim() !== '') {
            const searchStr = (image.id + image.title + image.author.id + image.author.name).toLowerCase()
            if (!searchStr.includes(this.filterConfig.search.value.trim().toLowerCase()))
              return false
          }
          return true
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
            const _ratioStr = this.filterConfig.shape.value.substring(6).split(':').map(str => Number(str))
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
    openImageViewer(image: Image, prev: () => void, next: () => void): void {
      this.imageViewerShow = true
      this.imageViewerInfo = image
      this.imageViewerPrev = prev
      this.imageViewerNext = next
    },
    closeImageViewer(): void {
      this.imageViewerShow = false
    },
    updateSeatchValue(value: string): void {
      this.filterConfig.search.value = value
      if (value.trim() === '')
        this.urlParams.search = undefined
      else
        this.urlParams.search = value
    },
    toggleDarkMode(): void {
      this.darkMode = !this.darkMode
    },
    toggleFullscreen(): void {
      this.fullscreen.toggle()
    },
    toggleSearch(): void {
      if (this.filterConfig.search.enable)
        this.updateSeatchValue('')
      this.filterConfig.search.enable = !this.filterConfig.search.enable
    },
  },
})
