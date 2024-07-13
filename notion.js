import process from 'node:process'
import dotenv from 'dotenv'
import { Client } from '@notionhq/client'

dotenv.config()

const { DATABASE_ID, NOTION_TOKEN } = process.env

const notion = new Client({ auth: NOTION_TOKEN })
const databaseId = DATABASE_ID

export async function addArticleToNotionDatabase(article) {
  try {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: article.title,
              },
            },
          ],
        },
        Link: {
          url: article.link,
        },
        Author: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: article.author || '',
              },
              annotations: {
                italic: true,
              },
            },
          ],
        },
        Summary: {
          rich_text: [
            {
              text: {
                content: article.summary || '',
              },
            },
          ],
        },
        Published: {
          date: {
            start: article.date,
          },
        },
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: article.summary ? `${article.summary} ` : '',
                },
              },
              {
                type: 'text',
                text: {
                  content: `Read more`,
                  link: {
                    url: article.link,
                  },
                },
              },
            ],
          },
        },
      ],
    })
  }
  catch (error) {
    console.error('Error adding article to Notion:', error)
  }
}

export async function getArticlesFromNotionDatabase() {
  try {
    const response = await notion.databases.query({ database_id: databaseId })
    return response.results.map(page => ({
      title: page.properties.Name.title[0]?.text.content || '',
      link: page.properties.Link.url || '',
      author: page.properties.Author.rich_text[0]?.text.content || '',
      summary: page.properties.Summary.rich_text[0]?.text.content || '',
      date: page.properties.Published.date.start || '',
    }))
  }
  catch (error) {
    console.error('Error fetching articles from Notion:', error)
    return []
  }
}
