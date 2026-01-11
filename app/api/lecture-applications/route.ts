import { NextRequest, NextResponse } from 'next/server'
import { createLectureApplication, getLectureApplications, updateApplicationStatus, type LectureApplication } from '@/lib/notion'
import { supabase } from '@/lib/supabase'

// ========================================
// 講座申請 API 路由
// 同時儲存到 Notion 資料庫（主要）和 Supabase（備份）
// ========================================

/**
 * POST - 建立新的講座申請
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 驗證必填欄位
    const requiredFields = ['schoolName', 'contactName', 'contactEmail', 'lectureTopics', 'audienceType', 'preferredDates', 'lectureFormat']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缺少必填欄位: ${field}` },
          { status: 400 }
        )
      }
    }

    // 驗證陣列欄位
    if (!Array.isArray(body.lectureTopics) || body.lectureTopics.length === 0) {
      return NextResponse.json(
        { error: '請選擇至少一個講座主題' },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.preferredDates) || body.preferredDates.length === 0) {
      return NextResponse.json(
        { error: '請選擇至少一個希望的日期' },
        { status: 400 }
      )
    }

    // 準備講座申請資料
    const applicationData: LectureApplication = {
      schoolName: body.schoolName,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone || undefined,
      contactTitle: body.contactTitle || undefined,
      preferredLecturer: body.preferredLecturer || undefined,
      lectureTopics: body.lectureTopics,
      audienceType: body.audienceType,
      audienceCount: body.audienceCount ? Number(body.audienceCount) : undefined,
      preferredDates: body.preferredDates,
      lectureFormat: body.lectureFormat,
      lectureContent: body.lectureContent || body.additionalNotes || undefined,
      howDidYouHear: body.howDidYouHear || undefined,
    }

    // 1. 儲存到 Notion（主要儲存）
    const notionResult = await createLectureApplication(applicationData)

    // 2. 同時備份到 Supabase（選填，如果 applications 表存在的話）
    let supabaseResult = null
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          school_name: applicationData.schoolName,
          contact_name: applicationData.contactName,
          contact_email: applicationData.contactEmail,
          contact_phone: applicationData.contactPhone,
          contact_title: applicationData.contactTitle,
          preferred_lecturer: applicationData.preferredLecturer,
          lecture_topics: applicationData.lectureTopics,
          audience_type: applicationData.audienceType,
          audience_count: applicationData.audienceCount,
          preferred_dates: applicationData.preferredDates,
          lecture_format: applicationData.lectureFormat,
          lecture_content: applicationData.lectureContent,
          how_did_you_hear: applicationData.howDidYouHear,
          status: 'pending',
          notion_page_id: notionResult.pageId || null,
        })
        .select()

      if (!error && data) {
        supabaseResult = data[0]
      }
    } catch {
      // Supabase 備份失敗不影響主流程
      console.log('Supabase 備份失敗，但 Notion 已成功儲存')
    }

    // 回傳結果
    if (notionResult.success) {
      return NextResponse.json({
        success: true,
        message: '講座申請已成功送出！我們將盡快與您聯繫。',
        data: {
          notionPageId: notionResult.pageId,
          supabaseId: supabaseResult?.id || null,
        },
      })
    } else {
      // Notion 失敗但 Supabase 成功的情況
      if (supabaseResult) {
        return NextResponse.json({
          success: true,
          message: '講座申請已送出！',
          data: {
            supabaseId: supabaseResult.id,
          },
        })
      }

      throw new Error(notionResult.error || '儲存申請時發生錯誤')
    }
  } catch (error) {
    console.error('講座申請 API 錯誤:', error)
    return NextResponse.json(
      {
        error: '提交申請時發生錯誤，請稍後再試',
        details: error instanceof Error ? error.message : '未知錯誤',
      },
      { status: 500 }
    )
  }
}

/**
 * GET - 查詢講座申請列表（需要管理員權限）
 */
export async function GET(request: NextRequest) {
  try {
    // 從 URL 取得查詢參數
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const limit = searchParams.get('limit')

    const result = await getLectureApplications({
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
    })

    if (result.success && result.data) {
      // 解析 Notion 頁面資料為更易用的格式
      const applications = result.data.map((page: Record<string, unknown>) => {
        const properties = page.properties as Record<string, unknown>
        
        // 輔助函數：安全取得屬性值
        const getTitle = (prop: unknown): string => {
          if (!prop || typeof prop !== 'object') return ''
          const p = prop as { title?: Array<{ plain_text?: string }> }
          return p.title?.[0]?.plain_text || ''
        }
        
        const getRichText = (prop: unknown): string => {
          if (!prop || typeof prop !== 'object') return ''
          const p = prop as { rich_text?: Array<{ plain_text?: string }> }
          return p.rich_text?.[0]?.plain_text || ''
        }
        
        const getEmail = (prop: unknown): string => {
          if (!prop || typeof prop !== 'object') return ''
          const p = prop as { email?: string }
          return p.email || ''
        }
        
        const getPhone = (prop: unknown): string => {
          if (!prop || typeof prop !== 'object') return ''
          const p = prop as { phone_number?: string }
          return p.phone_number || ''
        }
        
        const getNumber = (prop: unknown): number | null => {
          if (!prop || typeof prop !== 'object') return null
          const p = prop as { number?: number }
          return p.number || null
        }
        
        const getSelect = (prop: unknown): string => {
          if (!prop || typeof prop !== 'object') return ''
          const p = prop as { select?: { name?: string } }
          return p.select?.name || ''
        }
        
        const getMultiSelect = (prop: unknown): string[] => {
          if (!prop || typeof prop !== 'object') return []
          const p = prop as { multi_select?: Array<{ name?: string }> }
          return p.multi_select?.map(s => s.name || '') || []
        }
        
        const getCreatedTime = (prop: unknown): string => {
          if (!prop || typeof prop !== 'object') return ''
          const p = prop as { created_time?: string }
          return p.created_time || ''
        }

        return {
          id: page.id,
          schoolName: getTitle(properties['學校名稱']),
          contactName: getRichText(properties['聯絡人']),
          contactEmail: getEmail(properties['電子郵件']),
          contactPhone: getPhone(properties['聯絡電話']),
          contactTitle: getRichText(properties['職稱']),
          preferredLecturer: getRichText(properties['希望講師']),
          lectureTopics: getMultiSelect(properties['講座類型']),
          audienceType: getRichText(properties['聽眾類型']),
          audienceCount: getNumber(properties['預估人數']),
          preferredDates: getRichText(properties['講座日期（期待）']),
          lectureFormat: getSelect(properties['講座形式']),
          lectureContent: getRichText(properties['講座內容']),
          howDidYouHear: getMultiSelect(properties['得知管道']),
          status: getSelect(properties['狀態']) || '待處理',
          createdAt: getCreatedTime(properties['申請時間']),
          url: (page as { url?: string }).url || '',
        }
      })

      return NextResponse.json({
        success: true,
        data: applications,
        count: applications.length,
      })
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('查詢講座申請 API 錯誤:', error)
    return NextResponse.json(
      {
        error: '查詢申請列表時發生錯誤',
        details: error instanceof Error ? error.message : '未知錯誤',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH - 更新講座申請狀態
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { pageId, status } = body

    if (!pageId || !status) {
      return NextResponse.json(
        { error: '缺少 pageId 或 status' },
        { status: 400 }
      )
    }

    const validStatuses = ['待處理', '處理中', '已確認', '已完成', '已取消']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `無效的狀態，有效值：${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const result = await updateApplicationStatus(pageId, status)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '狀態更新成功',
      })
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('更新講座申請狀態 API 錯誤:', error)
    return NextResponse.json(
      {
        error: '更新狀態時發生錯誤',
        details: error instanceof Error ? error.message : '未知錯誤',
      },
      { status: 500 }
    )
  }
}
