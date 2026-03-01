/**
 * 直接測試 API 創建文章功能
 * 確認內容是否能正確儲存到 Notion
 */

const testContent = `<h1>測試標題</h1>
<p>這是第一段測試內容。</p>
<p>這是第二段測試內容。</p>
<ul>
<li>測試項目 1</li>
<li>測試項目 2</li>
<li>測試項目 3</li>
</ul>
<p>這是最後一段測試內容。</p>`

async function testCreatePost() {
  console.log('🧪 測試創建文章 API')
  console.log('='.repeat(50))
  console.log('')
  
  const testData = {
    title: '🔬 API 測試文章 - ' + new Date().toLocaleString('zh-TW'),
    excerpt: '這是測試摘要',
    content: testContent,
    author: 'API 測試',
    authorId: 'test-001',
    category: '技術',
    imageUrl: '',
    status: '草稿',
    featured: false,
  }
  
  console.log('📤 準備發送的資料:')
  console.log('  標題:', testData.title)
  console.log('  摘要:', testData.excerpt)
  console.log('  內容長度:', testData.content.length, '字符')
  console.log('  內容預覽:', testData.content.substring(0, 100) + '...')
  console.log('')
  
  try {
    // 使用線上 API（請替換為您的實際網址）
    const response = await fetch('https://pm.cjlead.com.tw/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })
    
    const result = await response.json()
    
    console.log('📥 API 回應:')
    console.log(JSON.stringify(result, null, 2))
    console.log('')
    
    if (result.success && result.pageId) {
      console.log('✅ 文章創建成功！')
      console.log('')
      console.log('📄 Notion 頁面 ID:', result.pageId)
      console.log('🔗 Notion 連結:', `https://notion.so/${result.pageId.replace(/-/g, '')}`)
      console.log('')
      console.log('👉 請前往 Notion 確認:')
      console.log('   1. 屬性（標題、摘要）是否有資料')
      console.log('   2. 點進頁面後，內容是否顯示')
      console.log('')
    } else {
      console.log('❌ 創建失敗:', result.error)
    }
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message)
  }
}

testCreatePost()
