export { }
declare global {
  interface Image {
    id: number
    part: number
    title: string
    original: string
    preview: string
    size: [number, number]
    detail: {
      author: {
        id: number
        name: string
        account: string
      }
      tags: Tag[]
      created_at: string
      sanity_level: number
      x_restrict: number
    }
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
}
