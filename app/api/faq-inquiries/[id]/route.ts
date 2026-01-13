import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 更新常見問題諮詢狀態
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({
        success: false,
        error: '缺少 status',
      }, { status: 400 })
    }

    const validStatuses = ['pending', 'replied']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: '無效的狀態值',
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('faq_inquiries')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('更新常見問題諮詢狀態錯誤:', error)
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
    console.error('處理常見問題諮詢狀態更新錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}

// 刪除常見問題諮詢
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('faq_inquiries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('刪除常見問題諮詢錯誤:', error)
      return NextResponse.json({
        success: false,
        error: error.message || '刪除失敗',
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '已刪除',
    })
  } catch (error) {
    console.error('處理常見問題諮詢刪除錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}
