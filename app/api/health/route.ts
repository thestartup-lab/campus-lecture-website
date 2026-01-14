import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 健康檢查 API - 用於防止 Supabase 休眠
export async function GET() {
  try {
    // 簡單查詢 Supabase，保持連線活躍
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({
        status: 'warning',
        message: 'Supabase 連線有問題',
        error: error.message,
        timestamp: new Date().toISOString(),
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'ok',
      message: '系統正常運作',
      profiles_count: count,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: '健康檢查失敗',
      error: error instanceof Error ? error.message : '未知錯誤',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
