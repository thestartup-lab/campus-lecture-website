import { Client } from '@notionhq/client'

// ========================================
// Notion API 客戶端配置 (SDK v5+)
// ========================================

// 初始化 Notion 客戶端
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// 資料庫 ID
const LECTURE_APPLICATIONS_DB_ID = process.env.NOTION_LECTURE_APPLICATIONS_DB_ID || ''
const POSTS_DB_ID = process.env.NOTION_POSTS_DB_ID || ''
const TESTIMONIALS_DB_ID = process.env.NOTION_TESTIMONIALS_DB_ID || ''
const SITE_SETTINGS_DB_ID = process.env.NOTION_SITE_SETTINGS_DB_ID || ''

// ========================================
// 類型定義
// ========================================

export interface LectureApplication {
  // 申請者資訊
  schoolName: string         // 學校名稱
  contactName: string        // 聯絡人姓名
  contactEmail: string       // 聯絡人 Email
  contactPhone?: string      // 聯絡電話
  contactTitle?: string      // 聯絡人職稱
  
  // 講座資訊
  preferredLecturer?: string // 希望邀請的講師
  lectureTopics: string[]    // 希望的講座類型
  audienceType: string       // 聽眾類型（學生/教師/家長等）
  audienceCount?: number     // 預估人數
  
  // 時間與地點
  preferredDates: string[]   // 希望的日期（可多選）
  lectureFormat: '實體' | '線上' | '皆可' // 講座形式
  
  // 其他
  lectureContent?: string    // 講座內容/備註
  howDidYouHear?: string     // 如何得知我們
}

// ========================================
// 輔助函數
// ========================================

/**
 * 從資料庫取得 dataSourceId
 */
async function getDataSourceId(databaseId: string): Promise<string | null> {
  try {
    const database = await notion.databases.retrieve({ database_id: databaseId })
    const dataSources = (database as unknown as { data_sources?: Array<{ id: string }> }).data_sources
    return dataSources?.[0]?.id || null
  } catch {
    return null
  }
}

// ========================================
// Notion 資料庫操作函式
// ========================================

/**
 * 建立講座申請單到 Notion 資料庫
 * 根據您的資料庫結構設計
 */
export async function createLectureApplication(
  data: LectureApplication
): Promise<{ success: boolean; pageId?: string; error?: string }> {
  try {
    // 檢查必要的環境變數
    if (!process.env.NOTION_API_KEY) {
      throw new Error('NOTION_API_KEY 環境變數未設定')
    }
    if (!LECTURE_APPLICATIONS_DB_ID) {
      throw new Error('NOTION_LECTURE_APPLICATIONS_DB_ID 環境變數未設定')
    }

    // 取得 dataSourceId
    const dataSourceId = await getDataSourceId(LECTURE_APPLICATIONS_DB_ID)
    if (!dataSourceId) {
      throw new Error('無法取得資料來源 ID')
    }

    // SDK v5+: 使用 pages.create 但 parent 使用 data_source_id
    const response = await notion.pages.create({
      parent: {
        type: 'data_source_id',
        data_source_id: dataSourceId,
      },
      properties: {
        // 主標題：學校名稱 (title)
        '學校名稱': {
          title: [
            {
              text: {
                content: data.schoolName,
              },
            },
          ],
        },
        // 聯絡人資訊 (rich_text)
        '聯絡人': {
          rich_text: [
            {
              text: {
                content: data.contactName,
              },
            },
          ],
        },
        // 電子郵件 (email)
        '電子郵件': {
          email: data.contactEmail,
        },
        // 聯絡電話 (phone_number)
        '聯絡電話': {
          phone_number: data.contactPhone || null,
        },
        // 職稱 (rich_text)
        '職稱': {
          rich_text: [
            {
              text: {
                content: data.contactTitle || '',
              },
            },
          ],
        },
        // 希望講師 (rich_text)
        '希望講師': {
          rich_text: [
            {
              text: {
                content: data.preferredLecturer || '無特定偏好',
              },
            },
          ],
        },
        // 講座類型 (multi_select)
        '講座類型': {
          multi_select: data.lectureTopics.map(topic => ({ name: topic })),
        },
        // 聽眾類型 (rich_text)
        '聽眾類型': {
          rich_text: [
            {
              text: {
                content: data.audienceType,
              },
            },
          ],
        },
        // 預估人數 (number)
        '預估人數': {
          number: data.audienceCount || null,
        },
        // 講座日期（期待）(rich_text)
        '講座日期（期待）': {
          rich_text: [
            {
              text: {
                content: data.preferredDates.join(', '),
              },
            },
          ],
        },
        // 講座形式 (select)
        '講座形式': {
          select: {
            name: data.lectureFormat,
          },
        },
        // 講座內容 (rich_text) - 用於備註
        '講座內容': {
          rich_text: [
            {
              text: {
                content: data.lectureContent || '',
              },
            },
          ],
        },
        // 得知管道 (multi_select)
        '得知管道': {
          multi_select: data.howDidYouHear ? [{ name: data.howDidYouHear }] : [],
        },
        // 狀態 (select)
        '狀態': {
          select: {
            name: '待處理',
          },
        },
      },
    })

    // 檢查回應是否包含 id
    if ('id' in response) {
      return {
        success: true,
        pageId: response.id,
      }
    }

    return {
      success: true,
      pageId: undefined,
    }
  } catch (error) {
    console.error('建立 Notion 講座申請單失敗:', error)
    
    // 處理特定錯誤
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }
    
    return {
      success: false,
      error: '未知錯誤',
    }
  }
}

/**
 * 查詢講座申請單列表
 */
export async function getLectureApplications(options?: {
  status?: string
  limit?: number
}): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
  try {
    if (!LECTURE_APPLICATIONS_DB_ID) {
      throw new Error('NOTION_LECTURE_APPLICATIONS_DB_ID 環境變數未設定')
    }

    // 取得 dataSourceId
    const dataSourceId = await getDataSourceId(LECTURE_APPLICATIONS_DB_ID)
    if (!dataSourceId) {
      throw new Error('無法取得資料來源 ID')
    }

    const filter = options?.status
      ? {
          property: '狀態',
          select: {
            equals: options.status,
          },
        }
      : undefined

    // SDK v5+: 使用 dataSources.query
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter,
      page_size: options?.limit || 100,
      sorts: [
        {
          property: '申請時間',
          direction: 'descending' as const,
        },
      ],
    })

    return {
      success: true,
      data: response.results,
    }
  } catch (error) {
    console.error('查詢 Notion 講座申請單失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

/**
 * 更新講座申請單狀態
 */
export async function updateApplicationStatus(
  pageId: string,
  status: '待處理' | '處理中' | '已確認' | '已完成' | '已取消'
): Promise<{ success: boolean; error?: string }> {
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        '狀態': {
          select: {
            name: status,
          },
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error('更新 Notion 申請單狀態失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

/**
 * 刪除講座申請單（移到垃圾桶）
 */
export async function deleteLectureApplication(
  pageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await notion.pages.update({
      page_id: pageId,
      archived: true,
    })
    return { success: true }
  } catch (error) {
    console.error('刪除 Notion 申請單失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

/**
 * 測試 Notion 連線
 */
export async function testNotionConnection(): Promise<{
  success: boolean
  message: string
}> {
  try {
    if (!process.env.NOTION_API_KEY) {
      return {
        success: false,
        message: 'NOTION_API_KEY 環境變數未設定',
      }
    }

    // 嘗試取得用戶資訊以驗證 API Key
    const response = await notion.users.me({})
    
    return {
      success: true,
      message: `連線成功！Bot 名稱: ${response.name || 'Integration'}`,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '連線失敗',
    }
  }
}

// ========================================
// 文章（Posts）相關函式
// ========================================

export interface NotionPost {
  id?: string
  title: string
  excerpt?: string
  content: string
  author: string
  authorId?: string
  category: string
  imageUrl?: string
  status: '草稿' | '已發佈' | '已封存'
  featured?: boolean  // 精選文章
}

export interface NotionPostResult {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  authorId: string
  category: string
  imageUrl: string
  status: string
  featured: boolean  // 精選文章
  createdAt: string
  url: string
}

/**
 * 取得所有文章
 */
export async function getPosts(options?: {
  status?: '草稿' | '已發佈' | '已封存'
  authorId?: string
  limit?: number
}): Promise<{ success: boolean; data?: NotionPostResult[]; error?: string }> {
  try {
    if (!POSTS_DB_ID) {
      throw new Error('NOTION_POSTS_DB_ID 環境變數未設定')
    }

    const dataSourceId = await getDataSourceId(POSTS_DB_ID)
    if (!dataSourceId) {
      throw new Error('無法取得文章資料來源 ID')
    }

    // 建立篩選條件
    const filters: unknown[] = []

    if (options?.status) {
      filters.push({
        property: '文章狀態',
        status: { equals: options.status },
      })
    }

    if (options?.authorId) {
      filters.push({
        property: '作者ID',
        rich_text: { equals: options.authorId },
      })
    }

    // 構建 filter 參數
    let filterParam: unknown = undefined
    if (filters.length === 1) {
      filterParam = filters[0]
    } else if (filters.length > 1) {
      filterParam = { and: filters }
    }

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: filterParam as Parameters<typeof notion.dataSources.query>[0]['filter'],
      page_size: options?.limit || 100,
      sorts: [
        {
          property: '建立時間',
          direction: 'descending' as const,
        },
      ],
    })

    // 解析結果
    const posts: NotionPostResult[] = (response.results as Record<string, unknown>[]).map((page) => {
      const props = page.properties as Record<string, unknown>
      return {
        id: page.id as string,
        title: getTitle(props['文章標題']),
        excerpt: getRichText(props['摘要']),
        content: getRichText(props['內容']),
        author: getRichText(props['作者']),
        authorId: getRichText(props['作者ID']),
        category: getSelect(props['分類']),
        imageUrl: getUrl(props['封面照片']),
        status: getStatus(props['文章狀態']),
        featured: getCheckbox(props['精選']),
        createdAt: getCreatedTime(props['建立時間']),
        url: (page.url as string) || '',
      }
    })

    return { success: true, data: posts }
  } catch (error) {
    console.error('取得文章失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

/**
 * 取得首頁精選文章（優先精選，不夠則用最新文章補足）
 */
export async function getFeaturedPosts(limit: number = 3): Promise<{ success: boolean; data?: NotionPostResult[]; error?: string }> {
  try {
    // 先獲取所有已發佈的文章
    const result = await getPosts({ status: '已發佈' })
    
    if (!result.success || !result.data) {
      return result
    }
    
    const allPosts = result.data
    
    // 分離精選和非精選文章
    const featuredPosts = allPosts.filter(post => post.featured)
    const nonFeaturedPosts = allPosts.filter(post => !post.featured)
    
    // 優先使用精選文章，不夠則用最新文章補足
    let finalPosts: NotionPostResult[] = []
    
    if (featuredPosts.length >= limit) {
      // 精選文章足夠，取前 N 篇
      finalPosts = featuredPosts.slice(0, limit)
    } else {
      // 精選文章不夠，用非精選文章補足
      finalPosts = [
        ...featuredPosts,
        ...nonFeaturedPosts.slice(0, limit - featuredPosts.length)
      ]
    }
    
    return { success: true, data: finalPosts }
  } catch (error) {
    console.error('取得精選文章失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

/**
 * 建立文章
 */
/**
 * 將 HTML 轉換為 Notion blocks（簡化版）
 */
function htmlToNotionBlocks(html: string): Array<{
  object: 'block'
  type: string
  [key: string]: unknown
}> {
  if (!html || html.trim() === '') {
    return []
  }

  const blocks: Array<{
    object: 'block'
    type: string
    [key: string]: unknown
  }> = []

  // 移除 HTML 標籤，分段處理
  const tempDiv = typeof document !== 'undefined' ? document.createElement('div') : null
  if (tempDiv) {
    tempDiv.innerHTML = html
  }

  // 簡單的 HTML 解析（將每個段落轉換為 paragraph block）
  const lines = html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n')
    .replace(/<[^>]+>/g, '') // 移除其他 HTML 標籤
    .split('\n')
    .filter(line => line.trim())

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue

    // 處理標題
    if (trimmedLine.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: trimmedLine.substring(2) } }],
        },
      })
    } else if (trimmedLine.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: trimmedLine.substring(3) } }],
        },
      })
    } else if (trimmedLine.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: trimmedLine.substring(4) } }],
        },
      })
    } else if (trimmedLine.startsWith('• ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: trimmedLine.substring(2) } }],
        },
      })
    } else {
      // 一般段落
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: trimmedLine } }],
        },
      })
    }
  }

  return blocks
}

export async function createPost(
  data: NotionPost
): Promise<{ success: boolean; pageId?: string; error?: string }> {
  try {
    if (!POSTS_DB_ID) {
      throw new Error('NOTION_POSTS_DB_ID 環境變數未設定')
    }

    const dataSourceId = await getDataSourceId(POSTS_DB_ID)
    if (!dataSourceId) {
      throw new Error('無法取得文章資料來源 ID')
    }

    // 建立基本屬性
    const properties: Record<string, unknown> = {
      '文章標題': {
        title: [{ text: { content: data.title } }],
      },
      '摘要': {
        rich_text: [{ text: { content: data.excerpt || '' } }],
      },
      '作者': {
        rich_text: [{ text: { content: data.author } }],
      },
      '作者ID': {
        rich_text: [{ text: { content: data.authorId || '' } }],
      },
      '分類': {
        select: { name: data.category },
      },
      '封面照片': {
        url: data.imageUrl || null,
      },
      '文章狀態': {
        status: { name: data.status },
      },
      '精選': {
        checkbox: data.featured || false,
      },
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await notion.pages.create({
      parent: {
        type: 'data_source_id',
        data_source_id: dataSourceId,
      },
      properties: properties as any,
    })

    const pageId = 'id' in response ? response.id : undefined

    // Debug: 檢查內容狀態
    console.log('===== DEBUG: 頁面建立後檢查 =====')
    console.log('pageId:', pageId)
    console.log('data.content 存在嗎?', !!data.content)
    console.log('data.content 長度:', data.content?.length || 0)
    console.log('data.content 前100字:', data.content?.substring(0, 100) || '(空)')
    console.log('================================')

    // 🆕 如果有內容，寫入頁面 body
    if (pageId && data.content && data.content.trim()) {
      console.log('✅ 條件通過，開始寫入文章內容到 Notion 頁面...')
      try {
        console.log('呼叫 htmlToNotionBlocks...')
        const contentBlocks = htmlToNotionBlocks(data.content)
        console.log('✅ htmlToNotionBlocks 完成')
        console.log('轉換後的 blocks 數量:', contentBlocks.length)
        console.log('第一個 block:', JSON.stringify(contentBlocks[0] || {}).substring(0, 200))
        
        if (contentBlocks.length > 0) {
          console.log(`準備寫入 ${contentBlocks.length} 個 blocks...`)
          // 將 blocks 分批寫入（Notion API 限制每次最多 100 個 blocks）
          const batchSize = 100
          for (let i = 0; i < contentBlocks.length; i += batchSize) {
            const batch = contentBlocks.slice(i, i + batchSize)
            console.log(`寫入第 ${i}~${i + batch.length} 個 blocks...`)
            try {
              const appendResult = await notion.blocks.children.append({
                block_id: pageId,
                children: batch as any,
              })
              console.log(`✅ 批次 ${i} 寫入成功，結果:`, appendResult.results?.length, '個 blocks')
            } catch (appendError) {
              console.error(`❌ 批次 ${i} 寫入失敗:`, appendError)
              throw appendError
            }
          }
          console.log(`🎉 成功寫入 ${contentBlocks.length} 個內容區塊`)
        } else {
          console.log('⚠️ contentBlocks 是空的，沒有內容可寫入')
        }
      } catch (contentError) {
        console.error('❌❌❌ 寫入文章內容失敗 ❌❌❌')
        console.error('錯誤:', contentError)
        if (contentError instanceof Error) {
          console.error('錯誤訊息:', contentError.message)
        }
        if ((contentError as any).body) {
          console.error('Notion API 錯誤:', JSON.stringify((contentError as any).body, null, 2))
        }
        // 不影響頁面建立，只記錄錯誤
      }
    } else {
      console.log('❌ 未寫入內容！條件檢查失敗:')
      console.log('  - pageId 存在?', !!pageId)
      console.log('  - data.content 存在?', !!data.content)
      console.log('  - data.content.trim() 非空?', data.content ? !!data.content.trim() : false)
    }

    return {
      success: true,
      pageId,
    }
  } catch (error) {
    console.error('建立文章失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

/**
 * 更新文章
 */
export async function updatePost(
  pageId: string,
  data: Partial<NotionPost>
): Promise<{ success: boolean; error?: string }> {
  try {
    const properties: Record<string, unknown> = {}

    if (data.title !== undefined) {
      properties['文章標題'] = { title: [{ text: { content: data.title } }] }
    }
    if (data.excerpt !== undefined) {
      properties['摘要'] = { rich_text: [{ text: { content: data.excerpt } }] }
    }
    // 注意：內容應該寫在 Notion 頁面的 body 中，而不是屬性欄位
    // 如果資料庫有「內容」欄位，可以取消下方註解
    // if (data.content !== undefined) {
    //   properties['內容'] = { rich_text: [{ text: { content: data.content } }] }
    // }
    if (data.author !== undefined) {
      properties['作者'] = { rich_text: [{ text: { content: data.author } }] }
    }
    if (data.authorId !== undefined) {
      properties['作者ID'] = { rich_text: [{ text: { content: data.authorId } }] }
    }
    if (data.category !== undefined) {
      properties['分類'] = { select: { name: data.category } }
    }
    if (data.imageUrl !== undefined) {
      properties['封面照片'] = { url: data.imageUrl || null }
    }
    if (data.status !== undefined) {
      properties['文章狀態'] = { status: { name: data.status } }
    }
    if (data.featured !== undefined) {
      properties['精選'] = { checkbox: data.featured }
    }

    await notion.pages.update({
      page_id: pageId,
      properties: properties as Parameters<typeof notion.pages.update>[0]['properties'],
    })

    return { success: true }
  } catch (error) {
    console.error('更新文章失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

/**
 * 刪除文章（移到垃圾桶）
 */
export async function deletePost(
  pageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await notion.pages.update({
      page_id: pageId,
      archived: true,
    })
    return { success: true }
  } catch (error) {
    console.error('刪除文章失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

// ========================================
// 回饋（Testimonials）相關函式
// ========================================

export interface NotionTestimonial {
  id?: string
  name: string
  schoolTitle?: string
  content: string
  isApproved?: boolean
  isFeatured?: boolean
}

export interface NotionTestimonialResult {
  id: string
  name: string
  schoolTitle: string
  content: string
  isApproved: boolean
  isFeatured: boolean
  createdAt: string
  url: string
}

/**
 * 取得所有回饋
 */
export async function getTestimonials(options?: {
  approvedOnly?: boolean
  featuredOnly?: boolean
  limit?: number
}): Promise<{ success: boolean; data?: NotionTestimonialResult[]; error?: string }> {
  try {
    if (!TESTIMONIALS_DB_ID) {
      throw new Error('NOTION_TESTIMONIALS_DB_ID 環境變數未設定')
    }

    const dataSourceId = await getDataSourceId(TESTIMONIALS_DB_ID)
    if (!dataSourceId) {
      throw new Error('無法取得回饋資料來源 ID')
    }

// 建立篩選條件
    const filters: unknown[] = []

    if (options?.approvedOnly) {
      filters.push({
        property: '已審核',
        checkbox: { equals: true },
      })
    }

    if (options?.featuredOnly) {
      filters.push({
        property: '精選',
        checkbox: { equals: true },
      })
    }

    // 構建 filter 參數
    let filterParam: unknown = undefined
    if (filters.length === 1) {
      filterParam = filters[0]
    } else if (filters.length > 1) {
      filterParam = { and: filters }
    }

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: filterParam as Parameters<typeof notion.dataSources.query>[0]['filter'],
      page_size: options?.limit || 100,
      sorts: [
        {
          property: '建立時間',
          direction: 'descending' as const,
        },
      ],
    })

    // 解析結果
    const testimonials: NotionTestimonialResult[] = (response.results as Record<string, unknown>[]).map((page) => {
      const props = page.properties as Record<string, unknown>
      return {
        id: page.id as string,
        name: getTitle(props['姓名']),
        schoolTitle: getRichText(props['學校職稱']),
        content: getRichText(props['回饋內容']),
        isApproved: getCheckbox(props['已審核']),
        isFeatured: getCheckbox(props['精選']),
        createdAt: getCreatedTime(props['建立時間']),
        url: (page.url as string) || '',
      }
    })

    return { success: true, data: testimonials }
  } catch (error) {
    console.error('取得回饋失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

/**
 * 建立回饋
 */
export async function createTestimonial(
  data: NotionTestimonial
): Promise<{ success: boolean; pageId?: string; error?: string }> {
  try {
    if (!TESTIMONIALS_DB_ID) {
      throw new Error('NOTION_TESTIMONIALS_DB_ID 環境變數未設定')
    }

    const dataSourceId = await getDataSourceId(TESTIMONIALS_DB_ID)
    if (!dataSourceId) {
      throw new Error('無法取得回饋資料來源 ID')
    }

    const response = await notion.pages.create({
      parent: {
        type: 'data_source_id',
        data_source_id: dataSourceId,
      },
      properties: {
        '姓名': {
          title: [{ text: { content: data.name } }],
        },
        '學校職稱': {
          rich_text: [{ text: { content: data.schoolTitle || '' } }],
        },
        '回饋內容': {
          rich_text: [{ text: { content: data.content } }],
        },
        '已審核': {
          checkbox: data.isApproved ?? false,
        },
        '精選': {
          checkbox: data.isFeatured ?? false,
        },
      },
    })

    return {
      success: true,
      pageId: 'id' in response ? response.id : undefined,
    }
  } catch (error) {
    console.error('建立回饋失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

/**
 * 更新回饋
 */
export async function updateTestimonial(
  pageId: string,
  data: Partial<NotionTestimonial>
): Promise<{ success: boolean; error?: string }> {
  try {
    const properties: Record<string, unknown> = {}

    if (data.name !== undefined) {
      properties['姓名'] = { title: [{ text: { content: data.name } }] }
    }
    if (data.schoolTitle !== undefined) {
      properties['學校職稱'] = { rich_text: [{ text: { content: data.schoolTitle } }] }
    }
    if (data.content !== undefined) {
      properties['回饋內容'] = { rich_text: [{ text: { content: data.content } }] }
    }
    if (data.isApproved !== undefined) {
      properties['已審核'] = { checkbox: data.isApproved }
    }
    if (data.isFeatured !== undefined) {
      properties['精選'] = { checkbox: data.isFeatured }
    }

    await notion.pages.update({
      page_id: pageId,
      properties: properties as Parameters<typeof notion.pages.update>[0]['properties'],
    })

    return { success: true }
  } catch (error) {
    console.error('更新回饋失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

/**
 * 刪除回饋（移到垃圾桶）
 */
export async function deleteTestimonial(
  pageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await notion.pages.update({
      page_id: pageId,
      archived: true,
    })
    return { success: true }
  } catch (error) {
    console.error('刪除回饋失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

// ========================================
// 頁面內容（Blocks）相關函式
// ========================================

interface NotionBlock {
  type: string
  [key: string]: unknown
}

/**
 * 讀取 Notion 頁面的 blocks（內容）
 */
export async function getPageContent(pageId: string): Promise<{ success: boolean; content?: string; blocks?: unknown[]; error?: string }> {
  try {
    const blocks: unknown[] = []
    let cursor: string | undefined = undefined
    let iterations = 0
    const maxIterations = 10 // 最多獲取 10 頁（1000 個 blocks）

    // 遞迴獲取所有 blocks（限制迭代次數避免超時）
    do {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
        page_size: 100,
      })

      blocks.push(...response.results)
      cursor = response.has_more ? response.next_cursor ?? undefined : undefined
      iterations++
    } while (cursor && iterations < maxIterations)

    // 將 blocks 轉換為 HTML
    const html = blocksToHtml(blocks as NotionBlock[])

    return {
      success: true,
      content: html,
      blocks,
    }
  } catch (error) {
    console.error('讀取頁面內容失敗:', error)
    // 返回空內容而不是失敗，讓頁面能正常顯示
    return {
      success: true,
      content: '',
      blocks: [],
    }
  }
}

/**
 * 將 Notion blocks 轉換為 HTML
 */
function blocksToHtml(blocks: NotionBlock[]): string {
  return blocks.map(block => blockToHtml(block)).join('\n')
}

function blockToHtml(block: NotionBlock): string {
  const type = block.type

  switch (type) {
    case 'paragraph': {
      const text = richTextToHtml((block.paragraph as { rich_text: RichTextItem[] })?.rich_text || [])
      return text ? `<p>${text}</p>` : '<p></p>'
    }

    case 'heading_1': {
      const text = richTextToHtml((block.heading_1 as { rich_text: RichTextItem[] })?.rich_text || [])
      return `<h1>${text}</h1>`
    }

    case 'heading_2': {
      const text = richTextToHtml((block.heading_2 as { rich_text: RichTextItem[] })?.rich_text || [])
      return `<h2>${text}</h2>`
    }

    case 'heading_3': {
      const text = richTextToHtml((block.heading_3 as { rich_text: RichTextItem[] })?.rich_text || [])
      return `<h3>${text}</h3>`
    }

    case 'bulleted_list_item': {
      const text = richTextToHtml((block.bulleted_list_item as { rich_text: RichTextItem[] })?.rich_text || [])
      return `<li>${text}</li>`
    }

    case 'numbered_list_item': {
      const text = richTextToHtml((block.numbered_list_item as { rich_text: RichTextItem[] })?.rich_text || [])
      return `<li>${text}</li>`
    }

    case 'quote': {
      const text = richTextToHtml((block.quote as { rich_text: RichTextItem[] })?.rich_text || [])
      return `<blockquote>${text}</blockquote>`
    }

    case 'callout': {
      const callout = block.callout as { rich_text: RichTextItem[]; icon?: { emoji?: string } }
      const text = richTextToHtml(callout?.rich_text || [])
      const icon = callout?.icon?.emoji || '💡'
      return `<div class="callout"><span class="callout-icon">${icon}</span><p>${text}</p></div>`
    }

    case 'code': {
      const code = block.code as { rich_text: RichTextItem[]; language?: string }
      const text = richTextToPlainText(code?.rich_text || [])
      const language = code?.language || ''
      return `<pre><code class="language-${language}">${escapeHtml(text)}</code></pre>`
    }

    case 'divider':
      return '<hr />'

    case 'image': {
      const image = block.image as { type: string; file?: { url: string }; external?: { url: string }; caption?: RichTextItem[] }
      const url = image?.type === 'file' ? image.file?.url : image.external?.url
      const caption = richTextToPlainText(image?.caption || [])
      if (url) {
        return `<figure><img src="${url}" alt="${caption}" />${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`
      }
      return ''
    }

    case 'video': {
      const video = block.video as { type: string; file?: { url: string }; external?: { url: string } }
      const url = video?.type === 'file' ? video.file?.url : video.external?.url
      if (url) {
        // 檢查是否為 YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          const videoId = extractYouTubeId(url)
          if (videoId) {
            return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`
          }
        }
        return `<video src="${url}" controls></video>`
      }
      return ''
    }

    case 'embed': {
      const embed = block.embed as { url: string }
      const url = embed?.url
      if (url) {
        return `<div class="embed"><iframe src="${url}" frameborder="0"></iframe></div>`
      }
      return ''
    }

    case 'bookmark': {
      const bookmark = block.bookmark as { url: string; caption?: RichTextItem[] }
      const url = bookmark?.url
      const caption = richTextToPlainText(bookmark?.caption || [])
      if (url) {
        return `<a href="${url}" class="bookmark" target="_blank" rel="noopener noreferrer">${caption || url}</a>`
      }
      return ''
    }

    case 'toggle': {
      const toggle = block.toggle as { rich_text: RichTextItem[] }
      const text = richTextToHtml(toggle?.rich_text || [])
      return `<details><summary>${text}</summary></details>`
    }

    default:
      return ''
  }
}

interface RichTextItem {
  plain_text: string
  href?: string | null
  annotations?: {
    bold?: boolean
    italic?: boolean
    strikethrough?: boolean
    underline?: boolean
    code?: boolean
    color?: string
  }
}

function richTextToHtml(richText: RichTextItem[]): string {
  return richText.map(item => {
    let text = escapeHtml(item.plain_text)
    const annotations = item.annotations

    if (annotations?.code) {
      text = `<code>${text}</code>`
    }
    if (annotations?.bold) {
      text = `<strong>${text}</strong>`
    }
    if (annotations?.italic) {
      text = `<em>${text}</em>`
    }
    if (annotations?.strikethrough) {
      text = `<del>${text}</del>`
    }
    if (annotations?.underline) {
      text = `<u>${text}</u>`
    }
    if (item.href) {
      text = `<a href="${item.href}" target="_blank" rel="noopener noreferrer">${text}</a>`
    }

    return text
  }).join('')
}

function richTextToPlainText(richText: RichTextItem[]): string {
  return richText.map(item => item.plain_text).join('')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

/**
 * 取得單一文章（包含頁面內容）
 */
export async function getPost(pageId: string): Promise<{ success: boolean; data?: NotionPostResult & { htmlContent: string }; error?: string }> {
  try {
    // 獲取頁面屬性
    const page = await notion.pages.retrieve({ page_id: pageId })
    const props = (page as unknown as { properties: Record<string, unknown> }).properties

    // 獲取頁面內容
    const contentResult = await getPageContent(pageId)
    
    const post: NotionPostResult & { htmlContent: string } = {
      id: pageId,
      title: getTitle(props['文章標題']),
      excerpt: getRichText(props['摘要']),
      content: getRichText(props['內容']), // 保留舊欄位作為備用
      author: getRichText(props['作者']),
      authorId: getRichText(props['作者ID']),
      category: getSelect(props['分類']),
      imageUrl: getUrl(props['封面照片']),
      status: getStatus(props['文章狀態']),
      featured: getCheckbox(props['精選']),
      createdAt: getCreatedTime(props['建立時間']),
      url: (page as unknown as { url: string }).url || '',
      htmlContent: contentResult.content || '', // 頁面內容轉換的 HTML
    }

    return { success: true, data: post }
  } catch (error) {
    console.error('取得文章失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

// ========================================
// 屬性解析輔助函式
// ========================================

function getTitle(prop: unknown): string {
  const titleProp = prop as { title?: Array<{ plain_text: string }> }
  return titleProp?.title?.[0]?.plain_text || ''
}

function getRichText(prop: unknown): string {
  const richTextProp = prop as { rich_text?: Array<{ plain_text: string }> }
  return richTextProp?.rich_text?.[0]?.plain_text || ''
}

function getSelect(prop: unknown): string {
  const selectProp = prop as { select?: { name: string } }
  return selectProp?.select?.name || ''
}

function getStatus(prop: unknown): string {
  const statusProp = prop as { status?: { name: string } }
  return statusProp?.status?.name || ''
}

function getUrl(prop: unknown): string {
  const urlProp = prop as { url?: string }
  return urlProp?.url || ''
}

function getCheckbox(prop: unknown): boolean {
  const checkboxProp = prop as { checkbox?: boolean }
  return checkboxProp?.checkbox ?? false
}

function getCreatedTime(prop: unknown): string {
  const createdTimeProp = prop as { created_time?: string }
  return createdTimeProp?.created_time || ''
}

// ========================================
// Site Settings (網站設定)
// ========================================

export interface SiteSettings {
  [key: string]: string | number
}

/**
 * 取得所有網站設定
 */
export async function getSiteSettings(): Promise<{ success: boolean; data?: SiteSettings; error?: string }> {
  try {
    if (!SITE_SETTINGS_DB_ID) {
      return {
        success: false,
        error: 'NOTION_SITE_SETTINGS_DB_ID 環境變數未設定',
      }
    }

    const dataSourceId = await getDataSourceId(SITE_SETTINGS_DB_ID)
    if (!dataSourceId) {
      return {
        success: false,
        error: '無法取得資料來源 ID',
      }
    }

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
    })

    const settings: SiteSettings = {}
    
    for (const page of response.results) {
      const props = (page as unknown as { properties: Record<string, unknown> }).properties
      const key = getTitle(props['Key'] || props['設定鍵'] || props['key'])
      const value = getRichText(props['Value'] || props['設定值'] || props['value'])
      
      if (key) {
        // 嘗試轉換為數字（如果是統計數字）
        const numValue = Number(value)
        settings[key] = !isNaN(numValue) && value.trim() !== '' ? numValue : value
      }
    }

    return { success: true, data: settings }
  } catch (error) {
    console.error('取得網站設定失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

/**
 * 更新網站設定
 */
export async function updateSiteSetting(
  key: string,
  value: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!SITE_SETTINGS_DB_ID) {
      return {
        success: false,
        error: 'NOTION_SITE_SETTINGS_DB_ID 環境變數未設定',
      }
    }

    const dataSourceId = await getDataSourceId(SITE_SETTINGS_DB_ID)
    if (!dataSourceId) {
      return {
        success: false,
        error: '無法取得資料來源 ID',
      }
    }

    // 先查詢所有記錄，然後在記憶體中過濾
    const allResponse = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
    })
    
    // 在記憶體中查找匹配的記錄
    const response = {
      results: allResponse.results.filter((page: unknown) => {
        const props = (page as { properties: Record<string, unknown> }).properties
        const pageKey = getTitle(props['Key'] || props['設定鍵'] || props['key'])
        return pageKey === key
      }),
    }

    const valueStr = String(value)

    if (response.results.length > 0) {
      // 更新現有記錄（嘗試中文，失敗則用英文）
      const pageId = response.results[0].id
      try {
        await notion.pages.update({
          page_id: pageId,
          properties: {
            '設定值': {
              rich_text: [
                {
                  text: {
                    content: valueStr,
                  },
                },
              ],
            },
          },
        })
      } catch (e) {
        // 如果中文屬性不存在，使用英文
        const error = e as Error
        console.log('嘗試使用英文屬性名稱更新:', error.message)
        await notion.pages.update({
          page_id: pageId,
          properties: {
            'Value': {
              rich_text: [
                {
                  text: {
                    content: valueStr,
                  },
                },
              ],
            },
          },
        })
      }
    } else {
      // 建立新記錄（嘗試中文，失敗則用英文）
      try {
        await notion.pages.create({
          parent: {
            type: 'data_source_id',
            data_source_id: dataSourceId,
          },
          properties: {
            '設定鍵': {
              title: [
                {
                  text: {
                    content: key,
                  },
                },
              ],
            },
            '設定值': {
              rich_text: [
                {
                  text: {
                    content: valueStr,
                  },
                },
              ],
            },
          },
        })
      } catch (e) {
        // 如果中文屬性不存在，使用英文
        const error = e as Error
        console.log('嘗試使用英文屬性名稱建立:', error.message)
        await notion.pages.create({
          parent: {
            type: 'data_source_id',
            data_source_id: dataSourceId,
          },
          properties: {
            'Key': {
              title: [
                {
                  text: {
                    content: key,
                  },
                },
              ],
            },
            'Value': {
              rich_text: [
                {
                  text: {
                    content: valueStr,
                  },
                },
              ],
            },
          },
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('更新網站設定失敗:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }
  }
}

// 匯出 Notion 客戶端供其他用途
export { notion }
