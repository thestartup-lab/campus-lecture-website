import { Client } from '@notionhq/client'

// ========================================
// Notion API 客戶端配置 (SDK v5+)
// ========================================

// 初始化 Notion 客戶端
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// 講座申請資料庫 ID
const LECTURE_APPLICATIONS_DB_ID = process.env.NOTION_LECTURE_APPLICATIONS_DB_ID || ''

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

// 匯出 Notion 客戶端供其他用途
export { notion }
