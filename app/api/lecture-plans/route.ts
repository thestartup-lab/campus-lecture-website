import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

// 取得所有講座規劃申請
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('lecture_plans')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('取得講座規劃申請錯誤:', error)
      return NextResponse.json({
        success: false,
        error: error.message || '取得失敗',
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error('處理講座規劃申請錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { audience, painPoints, budget, contactEmail } = body

    // 驗證必填欄位
    if (!audience || !painPoints || !budget || !contactEmail) {
      return NextResponse.json({
        success: false,
        error: '請填寫所有必填欄位',
      }, { status: 400 })
    }

    // 驗證 Email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json({
        success: false,
        error: '請輸入有效的 Email 地址',
      }, { status: 400 })
    }

    // 存入資料庫
    const { error } = await supabase
      .from('lecture_plans')
      .insert([
        {
          audience,
          pain_points: painPoints,
          budget,
          contact_email: contactEmail,
          status: 'pending',
        },
      ])

    if (error) {
      console.error('儲存講座規劃需求錯誤:', error)
      return NextResponse.json({
        success: false,
        error: error.message || '儲存失敗',
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '需求已送出',
    })
  } catch (error) {
    console.error('處理講座規劃需求錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}

// 更新講座規劃申請狀態
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({
        success: false,
        error: '缺少 id 或 status',
      }, { status: 400 })
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: '無效的狀態值',
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('lecture_plans')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('更新講座規劃申請狀態錯誤:', error)
      return NextResponse.json({
        success: false,
        error: error.message || '更新失敗',
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '狀態已更新',
    })
  } catch (error) {
    console.error('處理講座規劃申請狀態更新錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}

// 刪除講座規劃申請
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少 id 參數',
      }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('lecture_plans')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('刪除講座規劃申請錯誤:', error)
      return NextResponse.json({
        success: false,
        error: error.message || '刪除失敗',
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '講座規劃申請已刪除',
    })
  } catch (error) {
    console.error('處理刪除講座規劃申請錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}
