import { NextResponse } from 'next/server'
import { getPosts, updatePost } from '@/lib/notion'

// 批次更新所有文章的作者名稱
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { authorId, newAuthorName } = body

    if (!authorId || !newAuthorName) {
      return NextResponse.json({
        success: false,
        error: '缺少 authorId 或 newAuthorName',
      })
    }

    // 取得該作者的所有文章（使用 authorId 參數在 Notion 層面過濾，而不是取得所有文章）
    const allPostsResult = await getPosts({ authorId })
    if (!allPostsResult.success || !allPostsResult.data) {
      return NextResponse.json({
        success: false,
        error: allPostsResult.error || '取得文章失敗',
      })
    }
    const authorPosts = allPostsResult.data

    // 如果沒有找到文章，直接返回成功（不顯示訊息）
    if (authorPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: `已更新 0 篇文章的作者名稱`,
        updated: 0,
        total: 0,
      })
    }

    // 批次更新
    let updated = 0
    const errors: string[] = []

    for (const post of authorPosts) {
      try {
        await updatePost(post.id, { author: newAuthorName })
        updated++
      } catch (e) {
        errors.push(`文章 ${post.id}: ${(e as Error).message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `已更新 ${updated} 篇文章的作者名稱`,
      updated,
      total: authorPosts.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('批次更新作者錯誤:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    })
  }
}
