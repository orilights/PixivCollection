import { IMAGE_FORMAT_PREVIEW, IMAGE_FORMAT_THUMBNAIL, IMAGE_PATH_ORIGINAL, IMAGE_PATH_PREVIEW, IMAGE_PATH_THUMBNAIL, LINK_PIXIV_ARTWORK, LINK_PIXIV_USER } from '@/config'
import { ImageType } from '@/types'

export function formatBytes(bytes: number) {
  if (bytes === 0)
    return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
}

export function formatTime(time: string) {
  if (time === '0000-00-00T00:00:00+09:00')
    return '未知'

  const date = new Date(time)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  const second = date.getSeconds().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

export function getImageUrl(image: Image, imageType: ImageType) {
  switch (imageType) {
    case ImageType.Original:
      return `${IMAGE_PATH_ORIGINAL}${image.id}_p${image.part}.${image.ext}`
    case ImageType.Preview:
      return `${IMAGE_PATH_PREVIEW}${image.id}_p${image.part}.${IMAGE_FORMAT_PREVIEW}`
    case ImageType.Thumbnail:
      return `${IMAGE_PATH_THUMBNAIL}${image.id}_p${image.part}.${IMAGE_FORMAT_THUMBNAIL}`
  }
  return ''
}

export function openPixivIllust(pid: number) {
  window.open(LINK_PIXIV_ARTWORK.replace('{id}', pid.toString()), '_blank')
}

export function openPixivUser(uid: number) {
  window.open(LINK_PIXIV_USER.replace('{id}', uid.toString()), '_blank')
}

export function exportFile(data: string, filename = 'export-{ts}.json') {
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.replace('{ts}', Date.now().toString())
  a.click()
  URL.revokeObjectURL(url)
}
