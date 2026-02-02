/**
 * 查找最新文章並添加內容
 */

const { Client } = require('@notionhq/client')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

async function findLatest() {
  console.log('🔍 查找最新文章...')
  
  try {
    // 搜索最近創建的頁面
    const response = await notion.search({
      query: '最終測試',
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time'
      },
    })
    
    console.log(`找到 ${response.results.length} 個結果`)
    
    if (response.results.length > 0) {
      const page = response.results[0]
      const title = page.properties['文章標題']?.title?.[0]?.plain_text || '(無標題)'
      
      console.log('')
      console.log('✅ 最新文章:', title)
      console.log('   ID:', page.id)
      console.log('   連結: https://notion.so/' + page.id.replace(/-/g, ''))
      
      // 檢查並添加內容
      const blocks = await notion.blocks.children.list({ block_id: page.id })
      
      console.log(`   內容區塊: ${blocks.results.length} 個`)
      
      if (blocks.results.length === 0) {
        console.log('   ⚠️ 頁面是空的，添加內容...')
        
        await notion.blocks.children.append({
          block_id: page.id,
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ type: 'text', text: { content: '這是第一段。' } }],
              },
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ type: 'text', text: { content: '這是第二段。' } }],
              },
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ type: 'text', text: { content: '有沒有儲存到 Notion？' } }],
              },
            },
          ],
        })
        
        console.log('   ✅ 內容已添加！')
        console.log('   🔗 https://notion.so/' + page.id.replace(/-/g, ''))
      }
    }
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message)
  }
}

findLatest()
