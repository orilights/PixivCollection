export const LINK_GITHUB = 'https://github.com/orilights/PixivCollection'
export const LINK_PIXIV_ARTWORK = 'https://www.pixiv.net/artworks/{id}'
export const LINK_PIXIV_USER = 'https://www.pixiv.net/users/{id}'

export const DATA_FILE = './images.json'

export const IMAGE_PATH_ORIGINAL = './image/original/'
export const IMAGE_PATH_PREVIEW = './image/preview/'
export const IMAGE_PATH_THUMBNAIL = './image/thumbnail/'
export const IMAGE_FORMAT_PREVIEW = 'webp'
export const IMAGE_FORMAT_THUMBNAIL = 'webp'

export const MASONRY_MIN_COLUMNS = 2
export const MASONRY_MAX_COLUMNS = 10
export const MASONRY_RENDER_RANGE = {
  up: 0.2,
  down: 0.5,
}
export const MASONRY_LOAD_DELAY = 300
export const MASONRY_INFO_AREA_HEIGHT = 120
export const MASONRY_IMAGE_GAP_LIST = [0, 10, 20, 30]
export const MASONRY_IMAGE_SIZE_LIST = [200, 240, 280, 320, 360, 400]

export const FILTER_SHAPES: { [shape: string]: string } = {
  'horizontal': '横向',
  'vertical': '竖向',
  'square': '方形',
  'ratio-4:3': '4:3',
  'ratio-16:9': '16:9',
  'ratio-21:9': '21:9',
  'ratio-3:4': '3:4',
  'ratio-9:16': '9:16',
  'ratio-9:21': '9:21',
}

export const FILTER_BOOKMARKS = [100000, 50000, 20000, 10000, 5000, 1000]

export const NAVBAR_HIDE_DISTANCE = 200
