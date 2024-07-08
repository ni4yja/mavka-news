import { scrapeNews } from './scrape-news.js'
import { syncDatabase } from './sync-database.js'
import { closeDb, openDb } from './db.js'

(async () => {
  await openDb()
  try {
    await scrapeNews()
    await syncDatabase()
  }
  finally {
    await closeDb()
  }
})()
