import { finished } from 'node:stream/promises'
import db from './db.js'
import { addArticleToNotionDatabase } from './add-article-to-notion.js'

export async function syncDatabase() {
  try {
    const stream = db.createReadStream()
    let hasData = false

    stream.on('data', async ({ value }) => {
      hasData = true
      try {
        const article = JSON.parse(value)
        await addArticleToNotionDatabase(article)
      }
      catch (error) {
        console.error('Error syncing article to Notion:', error)
      }
    })

    await finished(stream)

    if (!hasData)
      console.warn('No data found in LevelDB to sync.')
  }
  catch (error) {
    console.error('General error in syncDatabase:', error)
  }
}
