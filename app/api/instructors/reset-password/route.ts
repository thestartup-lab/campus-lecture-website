import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// 管理員重設講師密碼和/或更改帳號
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newPassword, newEmail } = body

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '缺少用戶 ID',
      }, { status: 400 })
    }

    if (!newPassword && !newEmail) {
      return NextResponse.json({
        success: false,
        error: '請提供新密碼或新 Email',
      }, { status: 400 })
    }

    if (newPassword && newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        error: '密碼至少需要 6 個字元',
      }, { status: 400 })
    }

    // 準備更新資料
    const updateData: { password?: string; email?: string; email_confirm?: boolean } = {}
    
    if (newPassword) {
      updateData.password = newPassword
    }
    
    if (newEmail) {
      updateData.email = newEmail
      updateData.email_confirm = true // 自動確認新 Email
    }

    console.log('準備更新用戶:', { userId, updateData: { ...updateData, password: updateData.password ? '***' : undefined } })

    // 使用 Admin API 更新用戶
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData)

    console.log('Supabase 回應:', { data: data ? 'success' : 'null', error })

    if (error) {
      console.error('更新用戶錯誤:', error)
      return NextResponse.json({
        success: false,
        error: `更新失敗: ${error.message}`,
      }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: '更新失敗: 無回應資料',
      }, { status: 500 })
    }

    // 如果更改了 Email，也要更新 profiles 表
    if (newEmail) {
      await supabaseAdmin
        .from('profiles')
        .update({ email: newEmail })
        .eq('id', userId)
    }

    const messages = []
    if (newEmail) messages.push('帳號已更改')
    if (newPassword) messages.push('密碼已重設')

    return NextResponse.json({
      success: true,
      message: messages.join('、'),
    })

  } catch (error) {
    console.error('更新用戶錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}
