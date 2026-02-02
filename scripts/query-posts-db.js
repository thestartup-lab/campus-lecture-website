/**
 * 直接查詢文章資料庫
 */

const { Client } = require('@notionhq/client')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const POSTS_DB_ID = process.env.NOTION_POSTS_DB_ID

async function queryPostsDatabase() {
  console.log('🔍 查詢文章資料庫...')
  console.log('資料庫 ID:', POSTS_DB_ID)
  console.log('')
  
  try {
    // 先取得 dataSourceId
    const database = await notion.databases.retrieve({ database_id: POSTS_DB_ID })
    const dataSourceId = database.data_sources?.[0]?.id
    
    console.log('✅ 資料庫存在')
    console.log('Data Source ID:', dataSourceId)
    console.log('')
    
    // 使用 data_source_id 查詢
    if (dataSourceId) {
      const pages = await notion.databases.query({
        data_source_id: dataSourceId,
        sorts: [{
          timestamp: 'created_time',
          direction: 'descending'
        }],
        page_size: 5,
      })
      
      console.log(`📄 找到 ${pages.results.length} 篇文章`)
      console.log('')
      
      for (let i = 0; i < pages.results.length; i++) {
        const page = pages.results[i]
        const properties = page.properties
        
        // 取得標題
        let title = '(無標題)'
        if (properties['文章標題']?.title?.[0]?.plain_text) {
          title = properties['文章標題'].title[0].plain_text
        }
        
        console.log(`${i + 1}. ${title}`)
        console.log(`   ID: ${page.id}`)
        console.log(`   建立: ${page.created_time}`)
        console.log(`   連結: https://notion.so/${page.id.replace(/-/g, '')}`)
        
        // 檢查內容
        try {
          const blocks = await notion.blocks.children.list({
            block_id: page.id,
            page_size: 5,
          })
          
          console.log(`   內容區塊: ${blocks.results.length} 個`)
          
          if (blocks.results.length === 0) {
            console.log('   ⚠️ 頁面內容是空的')
            
            // 如果標題包含「高鐵」，添加測試內容
            if (title.includes('高鐵')) {
              console.log('   🔧 這是您剛才創建的文章！嘗試添加內容...')
              
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
                  block_id: page.id,
                  children: testBlocks,
                })
                console.log('   ✅ 測試內容已成功添加！')
                console.log('   👉 請重新打開 Notion 確認')
              } catch (appendError) {
                console.error('   ❌ 添加失敗:', appendError.message)
              }
            }
          } else {
            console.log('   ✅ 頁面有內容')
          }
        } catch (blockError) {
          console.log('   ❌ 無法讀取內容:', blockError.message)
        }
        
        console.log('')
      }
      
    }
    
  } catch (error) {
    console.error('❌ 錯誤:', error)
    console.error('錯誤訊息:', error.message)
    if (error.body) {
      console.error('詳細錯誤:', JSON.stringify(error.body, null, 2))
    }
  }
}

queryPostsDatabase()
