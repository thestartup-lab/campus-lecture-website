import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react'
import Link from 'next/link'

// 範例文章資料
const articles = [
  {
    id: 1,
    title: '如何在校園中推動創新教育',
    excerpt: '探討在現代教育環境中，如何透過創新的教學方法激發學生的學習興趣，並培養批判性思維能力...',
    author: '張教授',
    date: '2024-01-15',
    category: '教育創新',
  },
  {
    id: 2,
    title: '科技與人文的對話：AI時代的教育反思',
    excerpt: '在人工智慧快速發展的時代，我們應該如何重新思考教育的本質，培養學生面對未來的核心能力...',
    author: '李博士',
    date: '2024-01-10',
    category: '科技教育',
  },
  {
    id: 3,
    title: '建立校園永續發展文化的實踐經驗',
    excerpt: '分享如何在校園中建立永續發展的文化，從課程設計到校園活動，讓永續理念深入學生心中...',
    author: '王老師',
    date: '2024-01-05',
    category: '永續發展',
  },
]

export default function ArticlePreview() {
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <article
              key={article.id}
              className="card-editorial group"
            >
              {/* Image Placeholder */}
              <div className="relative h-48 bg-paper border-b-2 border-black flex items-center justify-center overflow-hidden">
                <BookOpen className="w-16 h-16 text-black/10" strokeWidth={1} />
                <div className="absolute top-4 left-4">
                  <span className="tag-editorial">
                    {article.category}
                  </span>
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
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" strokeWidth={1.5} />
                    <span>{article.date}</span>
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
      </div>
    </section>
  )
}
