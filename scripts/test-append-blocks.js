/**
 * 測試直接寫入 Notion blocks
 */

const { Client } = require('@notionhq/client')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// 使用剛才創建的測試文章 pageId
const TEST_PAGE_ID = '2fb2fa43-b9bd-816b-9bc5-c8585326d205'

async function testAppendBlocks() {
  console.log('🧪 測試寫入 Notion Blocks')
  console.log('='.repeat(50))
  console.log('')
  console.log('📄 目標頁面 ID:', TEST_PAGE_ID)
  console.log('')
  
  // 準備測試 blocks
  const testBlocks = [
    {
      object: 'block',
      type: 'heading_1',
      heading_1: {
        rich_text: [{ type: 'text', text: { content: '測試標題 H1' } }],
      },
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: '這是第一段測試內容。' } }],
      },
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: '這是第二段測試內容。' } }],
      },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ type: 'text', text: { content: '測試項目 1' } }],
      },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ type: 'text', text: { content: '測試項目 2' } }],
      },
    },
  ]
  
  console.log('📝 準備寫入 blocks 數量:', testBlocks.length)
  console.log('')
  
  try {
    console.log('⏳ 開始寫入...')
    
    const response = await notion.blocks.children.append({
      block_id: TEST_PAGE_ID,
      children: testBlocks,
    })
    
    console.log('✅ 寫入成功！')
    console.log('')
    console.log('📊 回應:', JSON.stringify(response, null, 2).substring(0, 500) + '...')
    console.log('')
    console.log('🔗 請前往 Notion 確認內容:')
    console.log(`   https://notion.so/${TEST_PAGE_ID.replace(/-/g, '')}`)
    console.log('')
    
  } catch (error) {
    console.error('❌ 寫入失敗！')
    console.error('')
    console.error('錯誤訊息:', error.message)
    console.error('')
    
    if (error.body) {
      console.error('錯誤詳情:', JSON.stringify(error.body, null, 2))
    }
    
    console.error('')
    console.error('💡 可能的原因:')
    console.error('   1. Notion API Token 權限不足')
    console.error('   2. Page ID 不正確')
    console.error('   3. Blocks 格式不正確')
    console.error('   4. Integration 沒有連接到此頁面')
    console.error('')
  }
}

testAppendBlocks()
