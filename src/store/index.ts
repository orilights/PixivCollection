import { useFullscreen } from '@vueuse/core'
import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
  state: () => ({
    darkMode: false,
    col: -1,
    gap: 10,
    showSidebar: false,
    showNav: true,
    showTagTranslation: false,
    showImageNo: false,
    imageViewerShow: false,
    imageViewerInfo: <Image>{},
    imageViewerPrev: () => {},
    imageViewerNext: () => {},
    fullscreen: useFullscreen(document.documentElement),
    filterConfig: {
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
        sanity: { max: 4 },
        r18: false,
      },
    },
  }),
  getters: {
    isFullscreen(): boolean {
      return this.fullscreen.isFullscreen
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
    toggleDarkMode(): void {
      this.darkMode = !this.darkMode
    },
    toggleFullscreen(): void {
      this.fullscreen.toggle()
    },
  },
})
