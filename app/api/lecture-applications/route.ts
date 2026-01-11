import { NextRequest, NextResponse } from 'next/server'
import { createLectureApplication, getLectureApplications, type LectureApplication } from '@/lib/notion'
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

    // TODO: 加入管理員身份驗證
    // 可以透過 Supabase Auth 來驗證是否為管理員

    const result = await getLectureApplications({
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        count: result.data?.length || 0,
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
