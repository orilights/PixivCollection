import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
  state: () => ({
    darkMode: false,
    col: -1,
    gap: 10,
    showSidebar: false,
    filterConfig: {
      tag: {
        enable: false,
        name: '',
        includeBookmark: false,
        includeRatherThan: 5,
        filterAuthor: false,
      },
      author: {
        enable: false,
        id: -1,
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
})
