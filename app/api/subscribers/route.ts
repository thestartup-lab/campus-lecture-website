import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// 取得訂閱者列表
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, subscribers: data, count: data.length })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}

// 新增訂閱者（單筆或批次）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { emails } = body as { emails: string[] }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ success: false, error: '請提供至少一個 Email' }, { status: 400 })
    }

    // 過濾格式錯誤的 email
    const validEmails = emails
      .map((e) => e.trim().toLowerCase())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))

    if (validEmails.length === 0) {
      return NextResponse.json({ success: false, error: '沒有有效的 Email 格式' }, { status: 400 })
    }

    // 查詢已存在的 email
    const { data: existing } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email')
      .in('email', validEmails)

    const existingEmails = new Set((existing || []).map((r: { email: string }) => r.email))
    const newEmails = validEmails.filter((e) => !existingEmails.has(e))
    const skipped = validEmails.length - newEmails.length

    if (newEmails.length > 0) {
      const { error } = await supabaseAdmin
        .from('newsletter_subscribers')
        .insert(newEmails.map((email) => ({ email })))

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, inserted: newEmails.length, skipped })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}

// 刪除訂閱者
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
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('刪除訂閱者錯誤:', error)
      return NextResponse.json({
        success: false,
        error: error.message || '刪除失敗',
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '訂閱者已刪除',
    })
  } catch (error) {
    console.error('處理刪除訂閱者錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}
