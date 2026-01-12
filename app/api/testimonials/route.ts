import { NextRequest, NextResponse } from 'next/server'
import { 
  getTestimonials, 
  createTestimonial, 
  type NotionTestimonial 
} from '@/lib/notion'

// GET /api/testimonials - 取得回饋列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const approvedOnly = searchParams.get('approved') === 'true'
    const featuredOnly = searchParams.get('featured') === 'true'
    const limit = searchParams.get('limit')

    const result = await getTestimonials({
      approvedOnly,
      featuredOnly,
      limit: limit ? parseInt(limit) : undefined,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0,
    })
  } catch (error) {
    console.error('GET /api/testimonials 錯誤:', error)
    return NextResponse.json(
      { success: false, error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

// POST /api/testimonials - 建立新回饋
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 驗證必要欄位
    if (!body.name || !body.content) {
      return NextResponse.json(
        { success: false, error: '缺少必要欄位：name, content' },
        { status: 400 }
      )
    }

    const testimonialData: NotionTestimonial = {
      name: body.name,
      schoolTitle: body.schoolTitle || body.school_title || '',
      content: body.content,
      isApproved: body.isApproved ?? false,
      isFeatured: body.isFeatured ?? false,
    }

    const result = await createTestimonial(testimonialData)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      pageId: result.pageId,
      message: '回饋建立成功',
    })
  } catch (error) {
    console.error('POST /api/testimonials 錯誤:', error)
    return NextResponse.json(
      { success: false, error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
