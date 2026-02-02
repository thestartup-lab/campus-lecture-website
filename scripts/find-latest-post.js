/**
 * 查找最新創建的文章並嘗試添加內容
 */

const { Client } = require('@notionhq/client')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const POSTS_DB_ID = process.env.NOTION_POSTS_DB_ID

async function findAndFixLatestPost() {
  console.log('🔍 查找最新文章...')
  console.log('')
  
  try {
    // 搜索最近創建的頁面
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'page'
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time'
      },
      page_size: 10,
    })
    
    // 過濾出屬於文章資料庫的頁面
    const postsPages = response.results.filter(page => {
      return page.parent && 
             page.parent.type === 'database_id' && 
             page.parent.database_id === POSTS_DB_ID.replace(/-/g, '')
    })
    
    if (postsPages.length === 0) {
      console.log('❌ 沒有找到任何文章')
      return
    }
    
    console.log(`✅ 找到 ${postsPages.length} 篇文章`)
    console.log('')
    
    // 顯示最新的 3 篇
    for (let i = 0; i < Math.min(3, postsPages.length); i++) {
      const page = postsPages[i]
      const title = page.properties['文章標題']?.title?.[0]?.plain_text || '(無標題)'
      const pageId = page.id
      
      console.log(`${i + 1}. ${title}`)
      console.log(`   ID: ${pageId}`)
      console.log(`   建立: ${page.created_time}`)
      console.log(`   連結: https://notion.so/${pageId.replace(/-/g, '')}`)
      
      // 檢查頁面內容
      try {
        const blocks = await notion.blocks.children.list({
          block_id: pageId,
          page_size: 5,
        })
        
        console.log(`   內容區塊數量: ${blocks.results.length}`)
        
        if (blocks.results.length === 0) {
          console.log('   ⚠️ 頁面是空的！')
          
          // 如果是最新的文章且標題包含「搭高鐵」，嘗試添加測試內容
          if (i === 0 && title.includes('高鐵')) {
            console.log('')
            console.log('   🔧 嘗試添加測試內容...')
            
            const testBlocks = [
              {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                  rich_text: [{ type: 'text', text: { content: '內容就是一句話' } }],
                },
              },
              {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                  rich_text: [{ type: 'text', text: { content: '測試看看' } }],
                },
              },
              {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                  rich_text: [{ type: 'text', text: { content: '有沒有' } }],
                },
              },
            ]
            
            try {
              await notion.blocks.children.append({
                block_id: pageId,
                children: testBlocks,
              })
              console.log('   ✅ 測試內容已添加！')
              console.log('   👉 請重新打開 Notion 頁面確認')
            } catch (appendError) {
              console.error('   ❌ 添加失敗:', appendError.message)
            }
          }
        } else {
          console.log('   ✅ 頁面有內容')
        }
      } catch (error) {
        console.log(`   ❌ 無法讀取內容:`, error.message)
      }
      
      console.log('')
    }
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message)
  }
}

findAndFixLatestPost()
