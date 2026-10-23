const POSTS_KEY = 'jeyamohan-local-posts-v1'

function createId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()
  return `post-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function loadPosts() {
  try {
    const value = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]')
    if (!Array.isArray(value)) return []
    return value.filter((post) => post && typeof post === 'object').map((post) => ({
      id: typeof post.id === 'string' ? post.id : createId(),
      text: typeof post.text === 'string' ? post.text : '',
      image: post.image && typeof post.image.src === 'string'
        ? { src: post.image.src, name: typeof post.image.name === 'string' ? post.image.name : '' }
        : null,
      createdAt: typeof post.createdAt === 'string' && Number.isFinite(Date.parse(post.createdAt))
        ? post.createdAt
        : new Date().toISOString(),
    }))
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
    id: createId(),
    text: String(text).trim(),
    image: image && typeof image.src === 'string' ? { src: image.src, name: String(image.name || '') } : null,
    createdAt: new Date().toISOString(),
  }
}
