import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// 管理員重設講師密碼
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newPassword } = body

    if (!userId || !newPassword) {
      return NextResponse.json({
        success: false,
        error: '缺少必要參數（userId, newPassword）',
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        error: '密碼至少需要 6 個字元',
      }, { status: 400 })
    }

    // 使用 Admin API 重設密碼
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) {
      console.error('重設密碼錯誤:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '密碼已成功重設',
    })

  } catch (error) {
    console.error('重設密碼錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}
