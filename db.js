import levelup from 'levelup'
import leveldown from 'leveldown'

const db = levelup(leveldown('article-db'))

export async function openDb() {
  return db.open()
}

export async function closeDb() {
  return db.close()
}

export default db
