import { finished } from 'node:stream/promises'
import db from './db.js'
import { addArticleToNotionDatabase, getArticlesFromNotionDatabase } from './notion.js'

export async function syncDatabase() {
  try {
    const existingArticles = await getArticlesFromNotionDatabase()
    const existingLinks = new Set(existingArticles.map(article => article.link))

    const stream = db.createReadStream()
    let hasData = false
    const syncPromises = []

    stream.on('data', ({ key, value }) => {
      hasData = true
      const syncPromise = (async () => {
        try {
          const article = JSON.parse(value)
          if (!existingLinks.has(article.link)) {
            await addArticleToNotionDatabase(article)
            article.isSynced = true
            await db.put(key, JSON.stringify(article))
            console.warn('Article synced and updated in LevelDB:', article.title)
          }
          else {
            console.warn('Article already exists in Notion:', article.title)
          }
        }
        catch (error) {
          console.error('Error syncing article to Notion:', error)
        }
      })()
      syncPromises.push(syncPromise)
    })

    await finished(stream)
    await Promise.all(syncPromises)

    if (!hasData)
      console.warn('No data found in LevelDB to sync.')
  }
  catch (error) {
    console.error('General error in syncDatabase:', error)
  }
}
