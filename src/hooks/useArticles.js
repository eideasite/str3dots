import { createArticle } from '../utils/article.js'

export function useArticles(setWorkspace, markDirty) {
  const updateWorkspace = (updater) => {
    markDirty()
    setWorkspace(updater)
  }
  const updateArticle = (id, patch) => {
    if (!id) return
    updateWorkspace((current) => ({
      ...current,
      articles: current.articles.map((article) => article.id === id
        ? { ...article, ...patch, updatedAt: new Date().toISOString() }
        : article),
    }))
  }
  const createNewArticle = (overrides) => {
    const article = createArticle(overrides)
    updateWorkspace((current) => ({ ...current, articles: [article, ...current.articles] }))
    return article
  }
  const discardArticle = (id) => updateWorkspace((current) => ({
    ...current,
    articles: current.articles.filter((article) => article.id !== id),
  }))
  return { updateWorkspace, updateArticle, createNewArticle, discardArticle }
}

