import { getPost } from '@/lib/notion'
import { Calendar, User, Tag, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// ISR: 每小時重新生成一次
export const revalidate = 3600

// 生成動態 metadata（含 Open Graph）
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const result = await getPost(id)

  if (!result.success || !result.data) {
    return {
      title: '文章不存在 | 教育專欄',
    }
  }

  const post = result.data
  const title = `${post.title} | 教育專欄`
  const description = post.excerpt || post.title

  return {
    title,
    description,
    authors: post.author ? [{ name: post.author }] : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.createdAt,
      authors: post.author ? [post.author] : undefined,
      images: post.imageUrl ? [{ url: post.imageUrl, alt: post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getPost(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const post = result.data

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* 返回連結 */}
      <div className="border-b-2 border-black">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-wider text-ink-muted hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            返回專欄列表
          </Link>
        </div>
      </div>

      {/* 文章標題區 */}
      <header className="py-16 border-b-2 border-black">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* 分類標籤 */}
          {post.category && (
            <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-black text-paper mb-6">
              <Tag className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm uppercase tracking-wider">{post.category}</span>
            </div>
          )}

          {/* 標題 */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-8 leading-tight">
            {post.title}
          </h1>

          {/* 摘要 */}
          {post.excerpt && (
            <p className="text-xl text-ink-muted leading-relaxed mb-8">
              {post.excerpt}
            </p>
          )}

          {/* Meta 資訊 */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-ink-muted">
            {post.author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" strokeWidth={1.5} />
                <span>{post.author}</span>
              </div>
            )}
            {post.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" strokeWidth={1.5} />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            )}
            {post.url && (
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-black transition-colors"
              >
                <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                <span>在 Notion 中查看</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 封面圖片 */}
      {post.imageUrl && (
        <div className="border-b-2 border-black">
          <div className="max-w-5xl mx-auto">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-auto object-cover"
              style={{ filter: 'grayscale(100%) contrast(110%) brightness(95%)' }}
            />
          </div>
        </div>
      )}

      {/* 文章內容 */}
      <article className="py-16">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Notion 頁面內容 */}
          {post.htmlContent ? (
            <div 
              className="notion-content prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.htmlContent }}
            />
          ) : post.content ? (
            // 如果沒有頁面內容，顯示舊的 content 欄位
            <div className="prose prose-lg max-w-none whitespace-pre-wrap">
              {post.content}
            </div>
          ) : (
            <div className="text-center py-12 text-ink-muted">
              <p>此文章尚無內容。</p>
              <p className="text-sm mt-2">請在 Notion 中編輯文章內容。</p>
            </div>
          )}
        </div>
      </article>

      {/* 底部導航 */}
      <div className="border-t-2 border-black py-12">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <Link
            href="/blog"
            className="btn-editorial inline-flex"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>返回專欄列表</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
