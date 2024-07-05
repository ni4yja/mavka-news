import process from 'node:process'
import { Client } from '@notionhq/client'

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
                content: article.author,
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
                content: article.summary ? article.summary : '',
              },
            },
          ],
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
