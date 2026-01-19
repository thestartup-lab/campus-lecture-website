import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// 設定講師角色（管理員/講師）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json({
        success: false,
        error: '缺少必要參數（userId, role）',
      }, { status: 400 })
    }

    if (role !== 'admin' && role !== 'instructor') {
      return NextResponse.json({
        success: false,
        error: '角色只能是 admin 或 instructor',
      }, { status: 400 })
    }

    // 更新 profiles 表的 role
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', userId)

    if (error) {
      console.error('更新角色錯誤:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: role === 'admin' ? '已設為管理員' : '已設為講師',
    })

  } catch (error) {
    console.error('設定角色錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}
