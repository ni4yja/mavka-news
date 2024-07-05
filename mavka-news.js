import fs from 'node:fs'
import puppeteer from 'puppeteer'
import { addArticleToNotionDatabase } from './add-article-to-notion.js'

async function scrapeNews() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  try {
    await page.goto('https://lb.ua/culture/analytics')

    const articles = await page.evaluate(() => {
      const articleNodes = document.querySelectorAll('.item-article')
      const articleList = []

      articleNodes.forEach((article) => {
        const titleElement = article.querySelector('.title a')
        const summaryElement = article.querySelector('.summary')

        const title = titleElement ? titleElement.textContent : null
        const author = article.querySelector('.author') ? article.querySelector('.author').textContent : null
        const link = titleElement ? titleElement.href : null
        const summary = summaryElement ? summaryElement.textContent : null

        if (title && link)
          articleList.push({ title, author, link, summary })
      })

      return articleList
    })

    // console.log(articles)
    fs.appendFileSync('/Users/k2/Development/mavka/logfile.log', `${JSON.stringify(articles)}\n`)

    for (const article of articles) await addArticleToNotionDatabase(article)

    await browser.close()
  }
  catch (error) {
    console.error(error)
    fs.appendFileSync('/Users/k2/Development/mavka/logfile.log', `${error.toString()}\n`)
  }
  finally {
    await browser.close()
  }
}

scrapeNews()