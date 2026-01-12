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
    const filters: Array<{
      property: string
      status?: { equals: string }
      rich_text?: { equals: string }
    }> = []

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

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: filters.length > 0 
        ? filters.length === 1 
          ? filters[0] 
          : { and: filters }
        : undefined,
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
 * 建立文章
 */
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

    const response = await notion.pages.create({
      parent: {
        type: 'data_source_id',
        data_source_id: dataSourceId,
      },
      properties: {
        '文章標題': {
          title: [{ text: { content: data.title } }],
        },
        '摘要': {
          rich_text: [{ text: { content: data.excerpt || '' } }],
        },
        '內容': {
          rich_text: [{ text: { content: data.content } }],
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
      },
    })

    return {
      success: true,
      pageId: 'id' in response ? response.id : undefined,
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
    if (data.content !== undefined) {
      properties['內容'] = { rich_text: [{ text: { content: data.content } }] }
    }
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

    await notion.pages.update({
      page_id: pageId,
      properties,
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
    const filters: Array<{
      property: string
      checkbox: { equals: boolean }
    }> = []

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

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: filters.length > 0 
        ? filters.length === 1 
          ? filters[0] 
          : { and: filters }
        : undefined,
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
      properties,
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

// 匯出 Notion 客戶端供其他用途
export { notion }
