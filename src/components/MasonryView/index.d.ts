interface ComponentOptions {
  col: number
  gap: number
  showNo: boolean
}
interface FilterConfig {
  tag: {
    enable: boolean,
    name: string,
    includeBookmark: boolean,
    includeRatherThan: number,
    filterAuthor: boolean,
  },
  author: {
    enable: boolean,
    id: number,
  },
  size: {
    enable: boolean,
    width: { max: number | null, min: number | null },
    height: { max: number | null, min: number | null },
  },
}