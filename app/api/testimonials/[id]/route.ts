import { NextRequest, NextResponse } from 'next/server'
import { updateTestimonial, deleteTestimonial } from '@/lib/notion'

// PATCH /api/testimonials/[id] - 更新回饋
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const result = await updateTestimonial(id, {
      name: body.name,
      schoolTitle: body.schoolTitle || body.school_title,
      content: body.content,
      isApproved: body.isApproved ?? body.is_approved,
      isFeatured: body.isFeatured ?? body.is_featured,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '回饋更新成功',
    })
  } catch (error) {
    console.error('PATCH /api/testimonials/[id] 錯誤:', error)
    return NextResponse.json(
      { success: false, error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

// DELETE /api/testimonials/[id] - 刪除回饋
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await deleteTestimonial(id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '回饋刪除成功',
    })
  } catch (error) {
    console.error('DELETE /api/testimonials/[id] 錯誤:', error)
    return NextResponse.json(
      { success: false, error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
