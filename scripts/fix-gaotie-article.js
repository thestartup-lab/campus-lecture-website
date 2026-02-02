/**
 * 查找「高鐵」文章並添加內容
 */

const { Client } = require('@notionhq/client')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const POSTS_DB_ID = process.env.NOTION_POSTS_DB_ID

async function fixGaotieArticle() {
  console.log('🔍 查找「高鐵」文章...')
  console.log('')
  
  try {
    // 使用 search API（這個確實可用）
    const searchResult = await notion.search({
      query: '高鐵',
      filter: {
        property: 'object',
        value: 'page'
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time'
      },
    })
    
    console.log(`找到 ${searchResult.results.length} 個結果`)
    
    for (const page of searchResult.results) {
      console.log('檢查頁面:', page.id)
      console.log('Parent:', JSON.stringify(page.parent))
      console.log('POSTS_DB_ID:', POSTS_DB_ID)
      console.log('Match?', page.parent?.database_id === POSTS_DB_ID.replace(/-/g, ''))
      console.log('')
      
      // 檢查是否屬於文章資料庫（使用兩種格式比較）
      const dbIdMatch = page.parent?.database_id === POSTS_DB_ID.replace(/-/g, '') || 
                        page.parent?.database_id === POSTS_DB_ID ||
                        page.parent?.data_source_id
      
      if (dbIdMatch || page.parent?.type === 'database_id') {
        const title = page.properties['文章標題']?.title?.[0]?.plain_text || 
                      page.properties['Name']?.title?.[0]?.plain_text ||
                      '(無標題)'
        
        console.log('')
        console.log('✅ 找到文章:', title)
        console.log('   ID:', page.id)
        console.log('   連結: https://notion.so/' + page.id.replace(/-/g, ''))
        console.log('')
        
        // 檢查現有內容
        const blocks = await notion.blocks.children.list({
          block_id: page.id,
        })
        
        console.log(`   目前有 ${blocks.results.length} 個內容區塊`)
        
        if (blocks.results.length === 0) {
          console.log('   ⚠️ 頁面是空的，準備添加內容...')
          console.log('')
          
          // 添加測試內容
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
          
          console.log('   🔧 開始寫入內容...')
          
          try {
            const result = await notion.blocks.children.append({
              block_id: page.id,
              children: testBlocks,
            })
            
            console.log('   ✅ 成功！寫入了', result.results.length, '個區塊')
            console.log('')
            console.log('🎉 完成！請重新打開 Notion 頁面確認內容')
            console.log('   連結: https://notion.so/' + page.id.replace(/-/g, ''))
            
          } catch (appendError) {
            console.error('   ❌ 寫入失敗:')
            console.error('   錯誤:', appendError.message)
            if (appendError.body) {
              console.error('   詳情:', JSON.stringify(appendError.body, null, 2))
            }
          }
        } else {
          console.log('   ✅ 頁面已有內容')
        }
        
        break // 只處理第一個找到的
      }
    }
    
    if (searchResult.results.length === 0) {
      console.log('❌ 沒有找到「高鐵」相關的文章')
      console.log('   請確認文章是否已創建')
    }
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
  }
}

fixGaotieArticle()
