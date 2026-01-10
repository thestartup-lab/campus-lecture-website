'use client'

import { Calendar, User, ArrowLeft, ArrowRight, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// 假資料（當 Supabase 沒有資料時使用）
const MOCK_ARTICLES: Record<string, {
  id: string
  title: string
  content: string
  author: string
  date: string
  category: string
  image_url: string | null
}> = {
  '1': {
    id: '1',
    title: '如何在校園中推動創新教育',
    content: `
      <h2>前言</h2>
      <p>在現代教育環境中，創新已成為推動學習進步的關鍵動力。本文將探討如何透過創新的教學方法激發學生的學習興趣，並培養批判性思維能力。</p>
      
      <h2>創新教育的核心理念</h2>
      <p>創新教育不僅僅是使用新技術，更重要的是改變我們對教學的思維方式。以下是幾個核心理念：</p>
      <ul>
        <li>以學生為中心的學習設計</li>
        <li>跨學科整合的課程規劃</li>
        <li>實作導向的學習體驗</li>
        <li>培養解決問題的能力</li>
      </ul>
      
      <blockquote>「教育的目的不是填滿一個桶，而是點燃一把火。」— 威廉·巴特勒·葉慈</blockquote>
      
      <h2>實踐策略</h2>
      <p>要在校園中成功推動創新教育，需要從多個層面著手：</p>
      <ol>
        <li><strong>教師培訓</strong>：定期舉辦工作坊，讓教師學習新的教學方法和工具。</li>
        <li><strong>課程設計</strong>：重新審視現有課程，融入更多互動和實作元素。</li>
        <li><strong>環境營造</strong>：創造支持創新的學習空間和文化氛圍。</li>
        <li><strong>評量改革</strong>：採用多元評量方式，不只看考試成績。</li>
      </ol>
      
      <hr />
      
      <h2>案例分享</h2>
      <p>某國中在推動創新教育後，學生的學習動機提升了 40%，課堂參與度也大幅增加。這證明了創新教育的有效性。</p>
      
      <h2>結語</h2>
      <p>創新教育是一條需要持續探索的道路。透過不斷嘗試和調整，我們可以為學生創造更好的學習環境，培養他們面對未來挑戰的能力。</p>
    `,
    author: '張教授',
    date: '2024-01-15',
    category: '教育創新',
    image_url: null,
  },
  '2': {
    id: '2',
    title: '科技與人文的對話：AI時代的教育反思',
    content: `
      <h2>AI時代的來臨</h2>
      <p>人工智慧正在快速改變我們的生活和工作方式，教育領域也不例外。我們應該如何重新思考教育的本質？</p>
      
      <h2>科技帶來的機遇</h2>
      <p>AI技術為教育帶來了許多新的可能性：</p>
      <ul>
        <li>個人化學習路徑</li>
        <li>即時回饋與評估</li>
        <li>擴大教育資源的可及性</li>
        <li>減輕教師行政負擔</li>
      </ul>
      
      <blockquote>「科技是工具，而非目的。真正的教育在於啟發人心。」</blockquote>
      
      <h2>不能被取代的人文價值</h2>
      <p>儘管科技進步迅速，有些教育價值是無法被取代的：</p>
      <ul>
        <li>批判性思維的培養</li>
        <li>創造力與想像力</li>
        <li>同理心與人際互動</li>
        <li>價值觀與道德判斷</li>
      </ul>
      
      <hr />
      
      <h2>找到平衡點</h2>
      <p>教育的未來在於找到科技與人文的平衡。我們應該善用科技工具，同時不忘培養學生的人文素養。</p>
    `,
    author: '李博士',
    date: '2024-01-10',
    category: '科技教育',
    image_url: null,
  },
  '3': {
    id: '3',
    title: '建立校園永續發展文化的實踐經驗',
    content: `
      <h2>永續發展的重要性</h2>
      <p>面對全球環境挑戰，培養學生的永續發展意識已成為教育的重要使命。</p>
      
      <h2>從課程開始</h2>
      <p>將永續發展理念融入各科課程，讓學生在學習中自然接觸這些概念。</p>
      
      <blockquote>「我們不是繼承祖先的土地，而是借用子孫的土地。」</blockquote>
      
      <h2>校園實踐</h2>
      <p>透過實際的校園活動，讓學生親身參與永續行動：</p>
      <ul>
        <li>校園資源回收計畫</li>
        <li>節能減碳倡議</li>
        <li>校園農園與食農教育</li>
        <li>環保社團活動</li>
      </ul>
      
      <hr />
      
      <h2>成功案例</h2>
      <p>多所學校已經成功建立了永續發展文化，學生不僅在校內實踐，更將這些理念帶回家庭和社區。</p>
    `,
    author: '王老師',
    date: '2024-01-05',
    category: '永續發展',
    image_url: null,
  },
}

// 處理文章內容，將 hr 替換為手繪風格分隔線
function processContent(content: string): string {
  return content.replace(/<hr\s*\/?>/gi, '<div class="ink-divider">* * *</div>')
}

// 墨水進度條組件
function InkProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      const scrollTop = window.scrollY
      const scrollProgress = (scrollTop / documentHeight) * 100
      setProgress(Math.min(scrollProgress, 100))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-black/10 z-[100]">
      <div 
        className="h-full bg-black transition-all duration-150 ease-out"
        style={{ 
          width: `${progress}%`,
          boxShadow: progress > 0 ? '2px 0 8px rgba(0,0,0,0.5)' : 'none'
        }}
      />
    </div>
  )
}

// 文章標題區組件
function ArticleHeader({ 
  title, 
  category, 
  author, 
  date 
}: { 
  title: string
  category: string
  author: string
  date: string
}) {
  return (
    <header 
      className="relative py-20 sm:py-28 border-b-8 border-black"
      style={{
        background: `
          linear-gradient(90deg, transparent 0%, transparent 50%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.02) 100%),
          linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px),
          #FAFAFA
        `,
        backgroundSize: '4px 4px, 100% 2px, 100% 100%'
      }}
    >
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Category Tag */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest">
            <Tag className="w-3 h-3" strokeWidth={2} />
            {category}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-black tracking-tight leading-[1.1] mb-10">
          {title}
        </h1>

        {/* Author & Date */}
        <div className="flex items-center gap-3 text-base text-black/70 font-medium">
          <span className="flex items-center gap-2">
            <User className="w-4 h-4" strokeWidth={1.5} />
            {author}
          </span>
          <span className="text-black/40">—</span>
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" strokeWidth={1.5} />
            {date}
          </span>
        </div>
      </div>
    </header>
  )
}

// 文章封面圖組件
function ArticleImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
      <div 
        className="relative overflow-hidden"
        style={{
          borderRadius: '2px 8px 4px 6px',
          border: '3px solid black',
          boxShadow: '6px 6px 0 rgba(0,0,0,0.9), -2px -2px 0 rgba(0,0,0,0.1)'
        }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-auto grayscale contrast-125"
        />
      </div>
    </div>
  )
}

// 頁尾導航組件
function ArticleNavigation({ currentId }: { currentId: string }) {
  const articleIds = Object.keys(MOCK_ARTICLES)
  const currentIndex = articleIds.indexOf(currentId)
  const prevId = currentIndex > 0 ? articleIds[currentIndex - 1] : null
  const nextId = currentIndex < articleIds.length - 1 ? articleIds[currentIndex + 1] : null
  
  const prevArticle = prevId ? MOCK_ARTICLES[prevId] : null
  const nextArticle = nextId ? MOCK_ARTICLES[nextId] : null

  return (
    <nav className="border-t-4 border-black">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2">
          {/* Previous Article */}
          <div className={`border-r-2 border-black ${prevArticle ? '' : 'opacity-30'}`}>
            {prevArticle ? (
              <Link 
                href={`/blog/${prevId}`}
                className="block p-8 hover:bg-black hover:text-white transition-colors group"
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-black/50 group-hover:text-white/70 mb-3">
                  <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                  上一篇
                </div>
                <h4 className="font-serif text-lg font-bold line-clamp-2">
                  {prevArticle.title}
                </h4>
              </Link>
            ) : (
              <div className="p-8">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-black/30 mb-3">
                  <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                  上一篇
                </div>
                <p className="text-black/30 text-sm">沒有更多文章</p>
              </div>
            )}
          </div>

          {/* Next Article */}
          <div className={nextArticle ? '' : 'opacity-30'}>
            {nextArticle ? (
              <Link 
                href={`/blog/${nextId}`}
                className="block p-8 hover:bg-black hover:text-white transition-colors group text-right"
              >
                <div className="flex items-center justify-end gap-2 text-xs uppercase tracking-widest text-black/50 group-hover:text-white/70 mb-3">
                  下一篇
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h4 className="font-serif text-lg font-bold line-clamp-2">
                  {nextArticle.title}
                </h4>
              </Link>
            ) : (
              <div className="p-8 text-right">
                <div className="flex items-center justify-end gap-2 text-xs uppercase tracking-widest text-black/30 mb-3">
                  下一篇
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <p className="text-black/30 text-sm">沒有更多文章</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [article, setArticle] = useState<typeof MOCK_ARTICLES[string] | null>(null)
  const [articleId, setArticleId] = useState<string>('')

  useEffect(() => {
    params.then(({ id }) => {
      setArticleId(id)
      // 先嘗試從假資料獲取
      if (MOCK_ARTICLES[id]) {
        setArticle(MOCK_ARTICLES[id])
      }
      // TODO: 從 Supabase 獲取真實資料
    })
  }, [params])

  if (!article) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-6xl mb-4">📰</div>
          <p className="text-ink-muted uppercase tracking-wider text-sm">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Ink Progress Bar */}
      <InkProgressBar />

      {/* Back Button */}
      <div className="border-b-2 border-black bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-bold hover:bg-black hover:text-white px-4 py-2 -ml-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            返回專欄
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <ArticleHeader 
        title={article.title}
        category={article.category}
        author={article.author}
        date={article.date}
      />

      {/* Article Image */}
      {article.image_url && (
        <ArticleImage src={article.image_url} alt={article.title} />
      )}

      {/* Article Content */}
      <article className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: processContent(article.content) }}
          />
        </div>
      </article>

      {/* Article Footer */}
      <section className="border-t-4 border-black py-16 bg-black/5">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <div className="inline-block border-4 border-black px-8 py-6 bg-white">
            <h3 className="font-serif text-2xl font-black text-black mb-3">
              喜歡這篇文章嗎？
            </h3>
            <p className="text-black/60 mb-6 text-sm">
              訂閱電子報，獲取更多精彩內容
            </p>
            <Link 
              href="/#newsletter" 
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black border-2 border-black transition-colors"
            >
              立即訂閱
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* Article Navigation */}
      <ArticleNavigation currentId={articleId} />

      {/* Custom Styles */}
      <style jsx global>{`
        .article-content {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 1.125rem;
          line-height: 1.9;
          color: #1a1a1a;
        }

        .article-content h2 {
          font-family: var(--font-serif), Georgia, serif;
          font-size: 1.75rem;
          font-weight: 900;
          color: #000;
          margin-top: 3.5rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 3px solid #000;
          letter-spacing: -0.02em;
        }

        .article-content h3 {
          font-family: var(--font-serif), Georgia, serif;
          font-size: 1.35rem;
          font-weight: 800;
          color: #000;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }

        .article-content p {
          margin-bottom: 1.75rem;
          color: #333;
        }

        .article-content strong {
          font-weight: 700;
          color: #000;
        }

        .article-content a {
          color: #000;
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-thickness: 2px;
        }

        .article-content a:hover {
          background: #000;
          color: #fff;
          text-decoration: none;
          padding: 0 4px;
          margin: 0 -4px;
        }

        .article-content ul,
        .article-content ol {
          margin: 1.75rem 0;
          padding-left: 1.5rem;
        }

        .article-content li {
          margin-bottom: 0.75rem;
          color: #333;
        }

        .article-content ul li {
          list-style-type: square;
        }

        .article-content ol li {
          list-style-type: decimal;
        }

        .article-content blockquote {
          position: relative;
          margin: 2.5rem 0;
          padding: 2rem 2rem 2rem 2.5rem;
          background: #f5f5f5;
          border-left: 6px solid #000;
          font-family: var(--font-serif), Georgia, serif;
          font-style: italic;
          font-size: 1.25rem;
          line-height: 1.7;
          color: #333;
        }

        .article-content blockquote::before {
          content: '"';
          position: absolute;
          top: 0.5rem;
          left: 0.75rem;
          font-size: 3rem;
          font-family: Georgia, serif;
          color: #000;
          line-height: 1;
          opacity: 0.3;
        }

        .ink-divider {
          text-align: center;
          margin: 3rem 0;
          font-size: 1.5rem;
          letter-spacing: 1rem;
          color: #000;
          font-weight: 300;
        }
      `}</style>
    </div>
  )
}
