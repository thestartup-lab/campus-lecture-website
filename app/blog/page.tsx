import { Calendar, User, ArrowUpRight, Star, BookOpen } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getPosts } from '@/lib/notion'

// 類別封面圖片映射
const categoryImages: Record<string, string> = {
  '教育理念': '/images/categories/education.png',
  '班級經營': '/images/categories/classroom.png',
  '親子溝通': '/images/categories/parenting.png',
  '教學技巧': '/images/categories/teaching.png',
  '職涯發展': '/images/categories/career.png',
  '生涯規劃': '/images/categories/life-planning.png',
}

// 假資料（暫時使用，當 Notion 沒有資料時顯示）
const MOCK_ARTICLES = [
  {
    id: '1',
    title: '如何在校園中推動創新教育',
    excerpt: '探討在現代教育環境中，如何透過創新的教學方法激發學生的學習興趣，並培養批判性思維能力。透過實際案例分享，我們將了解如何讓教育更貼近學生需求...',
    author: '張教授',
    date: '2024-01-15',
    category: '教育創新',
    image_url: '/images/lightbulb.jpeg',
    featured: true,
    content: '',
  },
  {
    id: '2',
    title: '科技與人文的對話：AI時代的教育反思',
    excerpt: '在人工智慧快速發展的時代，我們應該如何重新思考教育的本質，培養學生面對未來的核心能力。本文探討科技與教育的平衡點...',
    author: '李博士',
    date: '2024-01-10',
    category: '科技教育',
    image_url: null,
    featured: false,
    content: '',
  },
  {
    id: '3',
    title: '建立校園永續發展文化的實踐經驗',
    excerpt: '分享如何在校園中建立永續發展的文化，從課程設計到校園活動，讓永續理念深入學生心中。包含多個學校的成功案例分析...',
    author: '王老師',
    date: '2024-01-05',
    category: '永續發展',
    image_url: null,
    featured: false,
    content: '',
  },
]

// 從 Notion 抓取文章的函式
async function getArticles() {
  try {
    // 從 Notion 抓取已發佈的文章
    const result = await getPosts({ status: '已發佈' })

    // 如果有錯誤或沒有資料，使用假資料
    if (!result.success || !result.data || result.data.length === 0) {
      console.log('使用假資料：', result.error || 'Notion 資料庫中沒有資料')
      return MOCK_ARTICLES
    }

    // 轉換資料格式以符合前端需求
    return result.data.map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || article.content?.substring(0, 150) + '...',
      author: article.author,
      date: article.createdAt ? new Date(article.createdAt).toISOString().split('T')[0] : '',
      category: article.category,
      image_url: article.imageUrl,
      featured: article.featured || false,
      content: article.content,
    }))
  } catch (error) {
    console.error('抓取文章時發生錯誤：', error)
    return MOCK_ARTICLES
  }
}

export default async function BlogPage() {
  const articles = await getArticles()

  // 取得所有類別（去重複）
  const categories = ['全部', ...Array.from(new Set(articles.map(a => a.category)))]

  return (
    <div className="min-h-screen bg-paper">
      {/* Hero */}
      <section className="py-24 border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <span className="text-sm uppercase tracking-wider text-ink-muted mb-4 block">
            Our Articles
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-black mb-8">
            教育專欄
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl leading-relaxed">
            深入的教育觀點、實務分享與創新思維，與您一起探索教育的無限可能
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b-2 border-black sticky top-16 z-40 bg-paper">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <div className="flex gap-3 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 text-sm font-medium uppercase tracking-wider whitespace-nowrap transition-all border-2 border-black ${
                  category === '全部'
                    ? 'bg-black text-paper'
                    : 'bg-paper text-black hover:bg-black hover:text-paper'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <Link
                key={article.id}
                href={`/blog/${article.id}`}
                className="group relative block bg-white border-[3px] border-black rounded-[2px] overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Number Badge - Right Top Corner, Overlapping */}
                <div className="absolute -right-2 -top-2 z-30 font-serif text-7xl font-black text-gray-300/80 leading-none select-none pointer-events-none">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Image Area - Full Bleed 50% */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* 優先使用文章封面圖，其次使用類別圖片，最後使用預設 */}
                  {article.image_url ? (
                    <Image
                      src={article.image_url}
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
                      {article.category}
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
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{article.date}</span>
                    </div>
                  </div>
                </div>

                {/* Read More */}
                <div className="px-6 py-4 border-t-[3px] border-black bg-white group-hover:bg-black group-hover:text-white transition-colors">
                  <span className="flex items-center justify-between text-sm uppercase tracking-widest font-bold">
                    閱讀全文
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" strokeWidth={2} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {articles.length === 0 && (
            <div className="text-center py-20 border-2 border-black">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="font-serif text-2xl font-bold text-black mb-2">目前沒有文章</h3>
              <p className="text-ink-muted">請稍後再來查看最新的教育專欄內容</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
