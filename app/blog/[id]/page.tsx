import { getPost, getPosts } from '@/lib/notion'
import { Calendar, User, Tag, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// 生成靜態路徑
export async function generateStaticParams() {
  const result = await getPosts({ status: '已發佈', limit: 50 })
  
  if (!result.success || !result.data) {
    return []
  }

  return result.data.map((post) => ({
    id: post.id,
  }))
}

// 生成 metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getPost(id)

  if (!result.success || !result.data) {
    return {
      title: '文章不存在',
    }
  }

  return {
    title: `${result.data.title} | 教育專欄`,
    description: result.data.excerpt || result.data.title,
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

      {/* Notion 內容樣式 */}
      <style jsx global>{`
        .notion-content h1 {
          font-family: var(--font-serif);
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          color: #000;
          border-bottom: 2px solid #000;
          padding-bottom: 0.5rem;
        }

        .notion-content h2 {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          color: #000;
        }

        .notion-content h3 {
          font-family: var(--font-serif);
          font-size: 1.375rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: #000;
        }

        .notion-content p {
          margin-bottom: 1.25rem;
          line-height: 1.8;
          color: #333;
        }

        .notion-content ul,
        .notion-content ol {
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }

        .notion-content li {
          margin-bottom: 0.5rem;
          line-height: 1.7;
        }

        .notion-content blockquote {
          border-left: 4px solid #000;
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #555;
        }

        .notion-content pre {
          background: #1a1a1a;
          color: #f5f5f5;
          padding: 1.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 2px solid #000;
        }

        .notion-content code {
          font-family: ui-monospace, monospace;
          font-size: 0.9em;
        }

        .notion-content p code {
          background: #f0f0f0;
          padding: 0.2rem 0.4rem;
          border: 1px solid #ddd;
        }

        .notion-content a {
          color: #000;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .notion-content a:hover {
          background: #000;
          color: #fff;
        }

        .notion-content figure {
          margin: 2rem 0;
        }

        .notion-content img {
          max-width: 100%;
          height: auto;
          border: 2px solid #000;
        }

        .notion-content figcaption {
          text-align: center;
          font-size: 0.875rem;
          color: #666;
          margin-top: 0.5rem;
        }

        .notion-content hr {
          border: none;
          border-top: 2px solid #000;
          margin: 2rem 0;
        }

        .notion-content .callout {
          display: flex;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: #f9f9f9;
          border: 2px solid #000;
          margin: 1.5rem 0;
        }

        .notion-content .callout-icon {
          font-size: 1.5rem;
        }

        .notion-content .video-embed {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          margin: 2rem 0;
        }

        .notion-content .video-embed iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 2px solid #000;
        }

        .notion-content .bookmark {
          display: block;
          padding: 1rem;
          border: 2px solid #000;
          margin: 1rem 0;
          text-decoration: none;
          color: #000;
        }

        .notion-content .bookmark:hover {
          background: #000;
          color: #fff;
        }
      `}</style>
    </div>
  )
}
