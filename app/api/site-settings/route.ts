import { NextResponse } from 'next/server'
import { getSiteSettings, updateSiteSetting } from '@/lib/notion'

// 取得所有網站設定
export async function GET() {
  try {
    const result = await getSiteSettings()
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('取得網站設定錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}

// 更新網站設定
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { key, value } = body
    
    if (!key || value === undefined) {
      return NextResponse.json({
        success: false,
        error: '缺少 key 或 value',
      }, { status: 400 })
    }
    
    const result = await updateSiteSetting(key, value)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('更新網站設定錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
    }, { status: 500 })
  }
}
