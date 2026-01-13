import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkRateLimit, isBot, getClientIP } from '@/lib/security'

// 取得所有常見問題諮詢
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lecturerId = searchParams.get('lecturer_id')

    let query = supabase
      .from('faq_inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    // 如果指定了講師 ID，進行過濾
    if (lecturerId && lecturerId !== 'all') {
      if (lecturerId === 'null') {
        query = query.is('target_lecturer_id', null)
      } else {
        query = query.eq('target_lecturer_id', lecturerId)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('取得常見問題諮詢錯誤:', error)
      return NextResponse.json({
        success: false,
        error: error.message || '取得失敗',
      }, { status: 500 })
    }

    // 批次取得所有需要的講師資訊
    const lecturerIds = [...new Set((data || []).map((item: any) => item.target_lecturer_id).filter(Boolean))]
    const lecturerMap = new Map<string, string>()
    
    if (lecturerIds.length > 0) {
      const { data: lecturers } = await supabase
        .from('profiles')
        .select('id, display_name, full_name')
        .in('id', lecturerIds)
      
      if (lecturers) {
        lecturers.forEach(lecturer => {
          lecturerMap.set(lecturer.id, lecturer.display_name || lecturer.full_name || '')
        })
      }
    }

    // 處理資料，加入講師姓名
    const processedData = (data || []).map((item: any) => ({
      ...item,
      lecturer_name: item.target_lecturer_id ? (lecturerMap.get(item.target_lecturer_id) || null) : null,
    }))

    return NextResponse.json({
      success: true,
      data: processedData,
    })
  } catch (error) {
    console.error('處理常見問題諮詢錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}

// 新增常見問題諮詢
export async function POST(request: Request) {
  try {
    // 速率限制檢查
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(`faq-inquiry:${clientIP}`, 5, 60000) // 每分鐘最多 5 次
    
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        error: '提交過於頻繁，請稍後再試',
      }, { status: 429 })
    }

    const body = await request.json()
    const { name, email, content, target_lecturer_id, _honeypot } = body

    // Honeypot 檢查（防機器人）
    if (isBot(_honeypot)) {
      // 靜默失敗，不讓機器人知道被偵測到
      return NextResponse.json({
        success: true,
        message: '諮詢已送出',
      })
    }

    // 驗證必填欄位
    if (!name || !email || !content) {
      return NextResponse.json({
        success: false,
        error: '請填寫所有必填欄位',
      }, { status: 400 })
    }

    // 驗證 Email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: '請輸入有效的 Email 地址',
      }, { status: 400 })
    }

    // 存入資料庫
    const insertData: Record<string, unknown> = {
      name,
      email,
      content,
      status: 'pending',
    }
    
    // 如果有 target_lecturer_id，加入資料
    if (target_lecturer_id) {
      insertData.target_lecturer_id = target_lecturer_id
    }

    const { error } = await supabase
      .from('faq_inquiries')
      .insert([insertData])

    if (error) {
      console.error('儲存常見問題諮詢錯誤:', error)
      return NextResponse.json({
        success: false,
        error: error.message || '儲存失敗',
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '諮詢已送出',
    })
  } catch (error) {
    console.error('處理常見問題諮詢錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}
