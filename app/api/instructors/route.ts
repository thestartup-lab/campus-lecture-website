import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// 刪除講師（需要管理員權限）
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

    // 先檢查是否為管理員帳號，防止誤刪管理員
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', id)
      .single()

    if (profile?.role === 'admin') {
      return NextResponse.json({
        success: false,
        error: '無法刪除管理員帳號',
      }, { status: 403 })
    }

    // 刪除 profiles 資料
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id)

    if (profileError) {
      console.error('刪除講師 profile 錯誤:', profileError)
      return NextResponse.json({
        success: false,
        error: profileError.message || '刪除 profile 失敗',
      }, { status: 500 })
    }

    // 刪除 auth 用戶（使用 admin API）
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (authError) {
      console.error('刪除講師 auth 錯誤:', authError)
      // Profile 已刪除，但 auth 刪除失敗，返回部分成功
      return NextResponse.json({
        success: true,
        message: '講師資料已刪除（帳號可能需要手動清理）',
        warning: authError.message,
      })
    }

    return NextResponse.json({
      success: true,
      message: '講師帳號已完全刪除',
    })
  } catch (error) {
    console.error('處理刪除講師錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}
