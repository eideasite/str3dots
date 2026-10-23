import { createId } from '../utils/createId.js'

const POSTS_KEY = 'jeyamohan-local-posts-v1'

export function loadPosts() {
  try {
    const value = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]')
    if (!Array.isArray(value)) return []
    const seenIds = new Set()
    return value.filter((post) => post && typeof post === 'object').map((post) => {
      let id = typeof post.id === 'string' && post.id.trim() ? post.id : createId('post')
      if (seenIds.has(id)) id = createId('post')
      seenIds.add(id)
      return {
        id,
        text: typeof post.text === 'string' ? post.text : '',
        image: post.image && typeof post.image.src === 'string'
          ? { src: post.image.src, name: typeof post.image.name === 'string' ? post.image.name : '' }
          : null,
        createdAt: typeof post.createdAt === 'string' && Number.isFinite(Date.parse(post.createdAt))
          ? post.createdAt
          : new Date().toISOString(),
      }
    })
  } catch {
    return []
  }
}

export function savePosts(posts) {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
    return true
  } catch {
    return false
  }
}

export function createLocalPost({ text = '', image = null } = {}) {
  return {
    id: createId('post'),
    text: typeof text === 'string' ? text.trim() : '',
    image: image && typeof image.src === 'string'
      ? { src: image.src, name: typeof image.name === 'string' ? image.name : '' }
      : null,
    createdAt: new Date().toISOString(),
  }
}
