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
