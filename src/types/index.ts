export * from './enum'

declare global {
  interface Image {
    id: number
    part: number
    title: string
    size: [number, number]
    ext: string
    author: {
      id: number
      name: string
      account: string
    }
    tags: Tag[]
    created_at: string
    sanity_level: number
    x_restrict: number
    dominant_color: string
    bookmark: number
    view: number
    searchStr?: string
  }
  interface Tag {
    name: string
    translated_name: string | null
  }
  interface TagData {
    name: string
    translated_name: string | null
    count: number
  }
  interface AuthorData {
    id: number
    name: string
    account: string
    count: number
  }
  interface MasonryItemConfig {
    infoAtBottom: boolean
    tagIncludeBookmark: boolean
    tagTranslation: boolean
    shadow: boolean
    border: boolean
  }
}

export {}
