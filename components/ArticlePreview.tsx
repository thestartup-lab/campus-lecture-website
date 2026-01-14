'use client'

import { Calendar, User, ArrowRight, BookOpen, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Article {
  id: string
  title: string
  excerpt: string
  author: string
  createdAt: string
  category: string
  featured: boolean
  imageUrl?: string
}

// 類別封面圖片映射
const categoryImages: Record<string, string> = {
  '教育理念': '/images/categories/education.png',
  '班級經營': '/images/categories/classroom.png',
  '親子溝通': '/images/categories/parenting.png',
  '教學技巧': '/images/categories/teaching.png',
  '職涯發展': '/images/categories/career.png',
  '生涯規劃': '/images/categories/life-planning.png',
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
        // 加入時間戳避免快取
        const response = await fetch(`/api/posts?featured=true&limit=3&_t=${Date.now()}`, {
          cache: 'no-store'
        })
        const result = await response.json()
        
        console.log('首頁文章 API 回應:', result)
        
        if (result.success && result.data && result.data.length > 0) {
          setArticles(result.data.map((article: {
            id: string
            title: string
            excerpt: string
            author: string
            createdAt: string
            category: string
            featured: boolean
            imageUrl?: string
          }) => ({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt || '閱讀更多精彩內容...',
            author: article.author,
            createdAt: article.createdAt,
            category: article.category,
            featured: article.featured,
            imageUrl: article.imageUrl,
          })))
        } else {
          console.error('獲取精選文章失敗或無資料:', result.error || '無資料')
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
              <div key={i} className="bg-white border-[3px] border-black rounded-[2px] overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="border-b-[3px] border-black" />
                <div className="p-6 pt-8 space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="px-6 py-4 border-t-[3px] border-black">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <article
                key={article.id}
                className="group relative bg-white border-[3px] border-black rounded-[2px] overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Number Badge - Right Top Corner, Overlapping */}
                <div className="absolute -right-2 -top-2 z-30 font-serif text-7xl font-black text-gray-300/80 leading-none select-none pointer-events-none">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Image Area - Full Bleed 50% */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* 優先使用文章封面圖，其次使用類別圖片，最後使用預設 */}
                  {article.imageUrl ? (
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : categoryImages[article.category] ? (
                    <Image
                      src={categoryImages[article.category]}
                      alt={article.category}
                      fill
                      className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 transition-transform duration-500 group-hover:scale-105">
                      <BookOpen className="w-20 h-20 text-black/10" strokeWidth={1} />
                    </div>
                  )}
                  
                  {/* Grainy Paper Texture Overlay */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')`,
                      opacity: 0.15
                    }}
                  />
                  
                  {/* Category Badge - Bottom Left, Overlapping Border */}
                  <div className="absolute -bottom-3 left-4 z-20 flex items-center gap-2">
                    <span className="inline-block px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                      {article.category || '文章'}
                    </span>
                    {article.featured && (
                      <span className="inline-flex items-center gap-1 px-3 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                        <Star className="w-3 h-3" strokeWidth={1.5} fill="currentColor" />
                        精選
                      </span>
                    )}
                  </div>
                </div>

                {/* Separator Line */}
                <div className="border-b-[3px] border-black" />

                {/* Content */}
                <div className="relative p-6 pt-8 bg-white">
                  {/* Title */}
                  <h3 className="font-serif text-xl font-bold text-black mb-3 leading-tight line-clamp-2 group-hover:underline underline-offset-4 decoration-2">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-black/60 text-sm mb-5 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider text-black/40 font-medium pt-4 border-t border-black/10">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{article.author || '匿名'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{article.createdAt ? new Date(article.createdAt).toLocaleDateString('zh-TW') : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Read More */}
                <Link
                  href={`/blog/${article.id}`}
                  className="block px-6 py-4 border-t-[3px] border-black bg-white group-hover:bg-black group-hover:text-white transition-colors"
                >
                  <span className="flex items-center justify-between text-sm uppercase tracking-widest font-bold">
                    閱讀全文
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
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
