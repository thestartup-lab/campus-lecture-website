import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// 使用 Admin API 創建講師帳號（不需要 email 驗證）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, full_name, phone, title, bio, expertise, approved_by } = body

    // 驗證必填欄位
    if (!email || !password || !full_name) {
      return NextResponse.json({
        success: false,
        error: '缺少必填欄位（email, password, full_name）',
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: '密碼至少需要 6 個字元',
      }, { status: 400 })
    }

    // 1. 使用 Admin API 創建用戶（email 自動驗證）
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 自動確認 email
      user_metadata: {
        full_name,
      },
    })

    if (authError) {
      console.error('創建用戶錯誤:', authError)
      if (authError.message.includes('already been registered')) {
        return NextResponse.json({
          success: false,
          error: '此電子郵件已被註冊',
        }, { status: 400 })
      }
      return NextResponse.json({
        success: false,
        error: authError.message,
      }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({
        success: false,
        error: '建立帳號失敗',
      }, { status: 500 })
    }

    // 2. 更新 profile 資料（直接設為已審核）
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name,
        display_name: full_name,
        phone: phone || null,
        title: title || null,
        bio: bio || null,
        expertise: expertise?.length > 0 ? expertise : null,
        role: 'instructor',
        is_approved: true,
        is_public: true,
        approved_at: new Date().toISOString(),
        approved_by: approved_by || null,
      })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('更新 profile 錯誤:', profileError)
      // 帳號已創建，但 profile 更新失敗
      return NextResponse.json({
        success: true,
        warning: '帳號已建立，但資料更新失敗，請手動編輯',
        user_id: authData.user.id,
      })
    }

    return NextResponse.json({
      success: true,
      message: '講師帳號已成功建立',
      user_id: authData.user.id,
    })

  } catch (error) {
    console.error('創建講師錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}
