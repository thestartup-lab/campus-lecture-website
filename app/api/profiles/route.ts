import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// 更新個人資料
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少用戶 ID',
      }, { status: 400 })
    }

    console.log('更新個人資料:', { id, updateData })

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('更新個人資料錯誤:', error)
      return NextResponse.json({
        success: false,
        error: error.message || '更新失敗',
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '個人資料已更新',
      data,
    })
  } catch (error) {
    console.error('處理更新個人資料錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}
