import { NextRequest, NextResponse } from 'next/server'
import { updatePost, deletePost } from '@/lib/notion'

// PATCH /api/posts/[id] - 更新文章
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const result = await updatePost(id, {
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      author: body.author,
      authorId: body.authorId,
      category: body.category,
      imageUrl: body.imageUrl || body.image_url,
      status: body.status,
    })

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
