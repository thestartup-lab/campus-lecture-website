import { Calendar, User, ArrowLeft, Tag } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

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
      
      <h2>實踐策略</h2>
      <p>要在校園中成功推動創新教育，需要從多個層面著手：</p>
      <ol>
        <li><strong>教師培訓</strong>：定期舉辦工作坊，讓教師學習新的教學方法和工具。</li>
        <li><strong>課程設計</strong>：重新審視現有課程，融入更多互動和實作元素。</li>
        <li><strong>環境營造</strong>：創造支持創新的學習空間和文化氛圍。</li>
        <li><strong>評量改革</strong>：採用多元評量方式，不只看考試成績。</li>
      </ol>
      
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
      
      <h2>不能被取代的人文價值</h2>
      <p>儘管科技進步迅速，有些教育價值是無法被取代的：</p>
      <ul>
        <li>批判性思維的培養</li>
        <li>創造力與想像力</li>
        <li>同理心與人際互動</li>
        <li>價值觀與道德判斷</li>
      </ul>
      
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
      
      <h2>校園實踐</h2>
      <p>透過實際的校園活動，讓學生親身參與永續行動：</p>
      <ul>
        <li>校園資源回收計畫</li>
        <li>節能減碳倡議</li>
        <li>校園農園與食農教育</li>
        <li>環保社團活動</li>
      </ul>
      
      <h2>成功案例</h2>
      <p>多所學校已經成功建立了永續發展文化，學生不僅在校內實踐，更將這些理念帶回家庭和社區。</p>
    `,
    author: '王老師',
    date: '2024-01-05',
    category: '永續發展',
    image_url: null,
  },
}

// 從 Supabase 抓取單篇文章
async function getArticle(id: string) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      // 嘗試從假資料中找
      if (MOCK_ARTICLES[id]) {
        return MOCK_ARTICLES[id]
      }
      return null
    }

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      author: data.author,
      date: new Date(data.created_at).toISOString().split('T')[0],
      category: data.category,
      image_url: data.image_url,
    }
  } catch (error) {
    console.error('抓取文章時發生錯誤：', error)
    // 嘗試從假資料中找
    if (MOCK_ARTICLES[id]) {
      return MOCK_ARTICLES[id]
    }
    return null
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const article = await getArticle(id)

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Back Button */}
      <div className="border-b-2 border-black">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-wider font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            返回專欄列表
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <header className="py-16 border-b-2 border-black">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Category */}
          <div className="mb-6">
            <span className="tag-editorial">
              <Tag className="w-3 h-3" />
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-8 leading-tight">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm uppercase tracking-wider text-ink-muted">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" strokeWidth={1.5} />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" strokeWidth={1.5} />
              <span>{article.date}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Article Image */}
      {article.image_url && (
        <div className="border-b-2 border-black">
          <div className="max-w-4xl mx-auto">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-auto"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="py-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <div 
            className="prose prose-lg max-w-none
              prose-headings:font-serif prose-headings:font-bold prose-headings:text-black
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b-2 prose-h2:border-black prose-h2:pb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-ink-light prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-black prose-a:underline prose-a:underline-offset-4 prose-a:decoration-2
              prose-strong:text-black prose-strong:font-bold
              prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
              prose-li:text-ink-light prose-li:mb-2
              prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-ink-muted
            "
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>

      {/* Footer CTA */}
      <section className="border-t-2 border-black py-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h3 className="font-serif text-2xl font-bold text-black mb-4">
            喜歡這篇文章嗎？
          </h3>
          <p className="text-ink-muted mb-8">
            訂閱我們的電子報，獲取更多精彩內容
          </p>
          <Link href="/#newsletter" className="btn-editorial">
            訂閱電子報
          </Link>
        </div>
      </section>
    </div>
  )
}
