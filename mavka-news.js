import fs from 'node:fs'
import process from 'node:process'
import dotenv from 'dotenv'
import puppeteer from 'puppeteer'
import { addArticleToNotionDatabase } from './add-article-to-notion.js'

dotenv.config()

const { PATH_TO_WEBSITE, PATH_TO_LOGFILE } = process.env

async function scrapeNews() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  try {
    await page.goto(PATH_TO_WEBSITE)

    const articles = await page.evaluate(() => {
      const articleNodes = document.querySelectorAll('.item-article')
      const articleList = []

      articleNodes.forEach((article) => {
        const titleElement = article.querySelector('.title a')
        const summaryElement = article.querySelector('.summary')
        const authorElement = article.querySelector('.author')
        const dateElement = article.querySelector('time[datetime]')

        const title = titleElement ? titleElement.textContent : null
        const author = authorElement ? authorElement.textContent : null
        const link = titleElement ? titleElement.href : null
        const summary = summaryElement ? summaryElement.textContent : null
        const date = dateElement ? dateElement.getAttribute('datetime') : null

        if (title && link && date)
          articleList.push({ title, author, link, summary, date })
      })

      return articleList
    })

    fs.appendFileSync(PATH_TO_LOGFILE, `${JSON.stringify(articles)}\n`)

    for (const article of articles) await addArticleToNotionDatabase(article)

    await browser.close()
  }
  catch (error) {
    console.error(error)
    fs.appendFileSync(PATH_TO_LOGFILE, `${error.toString()}\n`)
  }
  finally {
    await browser.close()
  }
}

scrapeNews()
