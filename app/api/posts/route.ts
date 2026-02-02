import { NextRequest, NextResponse } from 'next/server'
import { 
  getPosts,
  getFeaturedPosts,
  createPost, 
  type NotionPost 
} from '@/lib/notion'

// 動態渲染，每次請求都獲取最新資料
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/posts - 取得文章列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as '草稿' | '已發佈' | '已封存' | null
    const authorId = searchParams.get('authorId')
    const limit = searchParams.get('limit')
    const featured = searchParams.get('featured')

    console.log('API /api/posts 請求:', { status, authorId, limit, featured })
    console.log('環境變數檢查:', { 
      hasNotionKey: !!process.env.NOTION_API_KEY,
      hasPostsDbId: !!process.env.NOTION_POSTS_DB_ID 
    })

    // 如果請求精選文章
    if (featured === 'true') {
      const result = await getFeaturedPosts(limit ? parseInt(limit) : 3)
      console.log('getFeaturedPosts 結果:', { success: result.success, dataLength: result.data?.length, error: result.error })
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
    }

    const result = await getPosts({
      status: status || undefined,
      authorId: authorId || undefined,
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
    console.error('GET /api/posts 錯誤:', error)
    return NextResponse.json(
      { success: false, error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

// POST /api/posts - 建立新文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 驗證必要欄位（content 為選填，可以在 Notion 中編輯）
    if (!body.title || !body.author || !body.category) {
      return NextResponse.json(
        { success: false, error: '缺少必要欄位：title, author, category' },
        { status: 400 }
      )
    }

    // Debug: 檢查收到的資料
    console.log('收到的文章資料:', {
      title: body.title,
      hasContent: !!body.content,
      contentLength: body.content?.length || 0,
    })

    const postData: NotionPost = {
      title: body.title,
      excerpt: body.excerpt || '',
      content: body.content || '', // content 為選填
      author: body.author,
      authorId: body.authorId || '',
      category: body.category,
      imageUrl: body.imageUrl || body.image_url || '',
      status: body.status || '草稿',
      featured: body.featured || false,
    }

    const result = await createPost(postData)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      pageId: result.pageId,
      message: '文章建立成功',
    })
  } catch (error) {
    console.error('POST /api/posts 錯誤:', error)
    return NextResponse.json(
      { success: false, error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
