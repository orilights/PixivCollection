import { LINK_PIXIV_ARTWORK, LINK_PIXIV_USER } from '@/config'

export function formatBytes(bytes: number) {
  if (bytes === 0)
    return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
}

export function openPixiv(pid: number) {
  window.open(LINK_PIXIV_ARTWORK.replace('{id}', pid.toString()), '_blank')
}

export function openPixivUser(uid: number) {
  window.open(LINK_PIXIV_USER.replace('{id}', uid.toString()), '_blank')
}
