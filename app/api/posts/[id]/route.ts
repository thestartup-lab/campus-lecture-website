import { NextRequest, NextResponse } from 'next/server'
import { getPost, updatePost, deletePost } from '@/lib/notion'

// GET /api/posts/[id] - 取得單一文章（含頁面內容）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await getPost(id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('GET /api/posts/[id] 錯誤:', error)
    return NextResponse.json(
      { success: false, error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

// PATCH /api/posts/[id] - 更新文章
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // 只傳遞有定義的欄位，undefined 的欄位不會被更新
    const updateData: Record<string, unknown> = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt
    if (body.content !== undefined) updateData.content = body.content
    if (body.author !== undefined) updateData.author = body.author
    if (body.authorId !== undefined) updateData.authorId = body.authorId
    if (body.category !== undefined) updateData.category = body.category
    if (body.imageUrl !== undefined || body.image_url !== undefined) {
      updateData.imageUrl = body.imageUrl || body.image_url
    }
    if (body.status !== undefined) updateData.status = body.status
    if (body.featured !== undefined) updateData.featured = body.featured

    const result = await updatePost(id, updateData)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '文章更新成功',
    })
  } catch (error) {
    console.error('PATCH /api/posts/[id] 錯誤:', error)
    return NextResponse.json(
      { success: false, error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - 刪除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await deletePost(id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '文章刪除成功',
    })
  } catch (error) {
    console.error('DELETE /api/posts/[id] 錯誤:', error)
    return NextResponse.json(
      { success: false, error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
