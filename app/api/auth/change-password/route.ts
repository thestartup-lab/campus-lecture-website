import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createClient } from '@supabase/supabase-js'

// 講師自己更改密碼
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, currentPassword, newPassword } = body

    if (!userId || !email || !currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        error: '缺少必要參數',
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        error: '新密碼至少需要 6 個字元',
      }, { status: 400 })
    }

    // 用另一個 supabase 客戶端驗證當前密碼（不影響主 session）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    
    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    // 驗證當前密碼
    const { error: signInError } = await tempClient.auth.signInWithPassword({
      email,
      password: currentPassword,
    })

    if (signInError) {
      return NextResponse.json({
        success: false,
        error: '目前密碼不正確',
      }, { status: 400 })
    }

    // 使用 Admin API 更新密碼
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (updateError) {
      console.error('更新密碼錯誤:', updateError)
      return NextResponse.json({
        success: false,
        error: updateError.message,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '密碼已成功更新',
    })

  } catch (error) {
    console.error('更改密碼錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}
