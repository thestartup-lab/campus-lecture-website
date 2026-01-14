import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// DELETE /api/supabase-posts/[id] - 刪除 Supabase 中的文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('刪除 Supabase 文章錯誤:', error)
      return NextResponse.json({
        success: false,
        error: error.message || '刪除失敗',
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '文章已刪除',
    })
  } catch (error) {
    console.error('處理刪除 Supabase 文章錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}

// PATCH /api/supabase-posts/[id] - 更新 Supabase 中的文章狀態
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { error } = await supabaseAdmin
      .from('posts')
      .update(body)
      .eq('id', id)

    if (error) {
      console.error('更新 Supabase 文章錯誤:', error)
      return NextResponse.json({
        success: false,
        error: error.message || '更新失敗',
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '文章已更新',
    })
  } catch (error) {
    console.error('處理更新 Supabase 文章錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}
