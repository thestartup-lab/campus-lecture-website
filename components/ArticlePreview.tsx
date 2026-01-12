'use client'

import { Calendar, User, ArrowRight, BookOpen, Star } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Article {
  id: string
  title: string
  excerpt: string
  author: string
  createdAt: string
  category: string
  featured: boolean
}

// 備用文章資料（當 API 無法獲取時顯示）
const fallbackArticles: Article[] = [
  {
    id: '1',
    title: '如何在校園中推動創新教育',
    excerpt: '探討在現代教育環境中，如何透過創新的教學方法激發學生的學習興趣，並培養批判性思維能力...',
    author: '張教授',
    createdAt: '2024-01-15',
    category: '教育創新',
    featured: true,
  },
  {
    id: '2',
    title: '科技與人文的對話：AI時代的教育反思',
    excerpt: '在人工智慧快速發展的時代，我們應該如何重新思考教育的本質，培養學生面對未來的核心能力...',
    author: '李博士',
    createdAt: '2024-01-10',
    category: '科技教育',
    featured: false,
  },
  {
    id: '3',
    title: '建立校園永續發展文化的實踐經驗',
    excerpt: '分享如何在校園中建立永續發展的文化，從課程設計到校園活動，讓永續理念深入學生心中...',
    author: '王老師',
    createdAt: '2024-01-05',
    category: '永續發展',
    featured: false,
  },
]

export default function ArticlePreview() {
  const [articles, setArticles] = useState<Article[]>(fallbackArticles)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/posts?featured=true&limit=3')
        const result = await response.json()
        
        if (result.success && result.data && result.data.length > 0) {
          setArticles(result.data.map((article: {
            id: string
            title: string
            excerpt: string
            author: string
            createdAt: string
            category: string
            featured: boolean
          }) => ({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt || '閱讀更多精彩內容...',
            author: article.author,
            createdAt: article.createdAt,
            category: article.category,
            featured: article.featured,
          })))
        }
      } catch (error) {
        console.error('獲取精選文章失敗:', error)
        // 失敗時使用備用資料
      }
      setLoading(false)
    }

    fetchArticles()
  }, [])
  return (
    <section className="py-24 bg-paper-dark">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
          <div>
            <span className="text-sm uppercase tracking-wider text-ink-muted mb-4 block">
              Featured Articles
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-black">
              精選專欄
            </h2>
          </div>
          <Link
            href="/blog"
            className="btn-editorial-outline group text-sm"
          >
            <span>查看全部</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </Link>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-editorial animate-pulse">
                <div className="h-48 bg-paper-dark border-b-2 border-black"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-paper-dark rounded"></div>
                  <div className="h-16 bg-paper-dark rounded"></div>
                  <div className="h-4 bg-paper-dark rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <article
                key={article.id}
                className="card-editorial group"
              >
                {/* Image Placeholder */}
                <div className="relative h-48 bg-paper border-b-2 border-black flex items-center justify-center overflow-hidden">
                  <BookOpen className="w-16 h-16 text-black/10" strokeWidth={1} />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="tag-editorial">
                      {article.category || '文章'}
                    </span>
                    {article.featured && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-black text-paper text-xs uppercase tracking-wider">
                        <Star className="w-3 h-3" strokeWidth={1.5} fill="currentColor" />
                        精選
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 font-serif text-6xl font-bold text-black/5">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="font-serif text-xl font-bold text-black mb-3 leading-tight group-hover:underline underline-offset-4 decoration-2">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-ink-muted text-sm mb-6 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider text-ink-muted pt-4 border-t border-black/10">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" strokeWidth={1.5} />
                      <span>{article.author || '匿名'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" strokeWidth={1.5} />
                      <span>{article.createdAt ? new Date(article.createdAt).toLocaleDateString('zh-TW') : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Read More */}
                <Link
                  href={`/blog/${article.id}`}
                  className="block px-6 py-4 border-t-2 border-black bg-paper hover:bg-black hover:text-paper transition-colors"
                >
                  <span className="flex items-center justify-between text-sm uppercase tracking-wider font-medium">
                    閱讀全文
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
