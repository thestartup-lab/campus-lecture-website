import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, 
  ArrowRight,
  Briefcase,
  BookOpen,
  Quote
} from 'lucide-react'
import LecturerInquiryForm from '@/components/LecturerInquiryForm'
import type { Metadata } from 'next'

// ISR: 每小時重新生成一次
export const revalidate = 3600

// 生成動態 metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const { data } = await supabase
    .from('profiles')
    .select('full_name, display_name, title, bio, avatar_url')
    .eq('id', id)
    .eq('is_approved', true)
    .single()

  if (!data) {
    return { title: '講師不存在 | 校園講座計劃' }
  }

  const name = data.display_name || data.full_name
  const title = `${name} | 認識講師`
  const description = data.bio || `${name} - ${data.title || '專業講師'}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: data.avatar_url ? [{ url: data.avatar_url, alt: name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: data.avatar_url ? [data.avatar_url] : undefined,
    },
  }
}

interface Experience {
  title: string
  organization: string
  date: string
  description?: string
}

interface Lecturer {
  id: string
  full_name: string
  display_name: string | null
  title: string | null
  bio: string | null
  bio_long: string | null
  avatar_url: string | null
  expertise: string[]
  experiences: Experience[]
  social_links: Record<string, string>
  is_public: boolean
}

interface Article {
  id: string
  title: string
  excerpt: string
  category: string
  created_at: string
  image_url: string | null
}

async function getLecturer(id: string): Promise<Lecturer | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('is_approved', true)
    .single()

  if (error || !data) {
    return null
  }

  return data as Lecturer
}

async function getLecturerArticles(authorId: string): Promise<Article[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, excerpt, category, created_at, image_url')
    .eq('author_id', authorId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    return []
  }

  return data as Article[]
}

// Mock 資料
const mockLecturer: Lecturer = {
  id: 'mock',
  full_name: '王小明',
  display_name: '王小明老師',
  title: '資深教育顧問 / 創新教學專家',
  bio: '致力於推動創新教育，擁有超過15年的教學經驗。',
  bio_long: `我是一位熱愛教育的實踐者，相信每個孩子都有無限的潛能等待被激發。

在過去的15年裡，我走訪了超過200所學校，與數萬名學生面對面交流。這些經歷讓我深刻體會到，教育不只是知識的傳遞，更是點燃學習熱情的過程。

我的教學理念是「讓學習成為一場探索之旅」。透過創新的教學方法和互動式的講座設計，我希望能幫助學生發現學習的樂趣。`,
  avatar_url: null,
  expertise: ['創新教育', '設計思考', '領導力培養', '職涯探索', '簡報技巧'],
  experiences: [
    {
      title: '全國創新教育論壇主講人',
      organization: '教育部',
      date: '2024',
      description: '分享創新教學實踐經驗'
    },
    {
      title: '校園巡迴講座',
      organization: '全台 50+ 所高中',
      date: '2020-2024',
      description: '累計演講超過 200 場'
    },
    {
      title: '教育創新獎',
      organization: '天下雜誌教育基金會',
      date: '2022',
    }
  ],
  social_links: {},
  is_public: true
}

const mockArticles: Article[] = [
  {
    id: '1',
    title: '如何在校園中推動創新教育',
    excerpt: '探討在現代教育環境中，如何透過創新的教學方法激發學生的學習興趣...',
    category: '教育創新',
    created_at: '2024-01-15T10:00:00Z',
    image_url: null
  },
  {
    id: '2',
    title: '設計思考在教育中的應用',
    excerpt: '設計思考不只是設計師的專利，它更是一種解決問題的思維方式...',
    category: '設計思考',
    created_at: '2024-01-10T10:00:00Z',
    image_url: null
  },
]

export default async function LecturerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  let lecturer = await getLecturer(id)
  let articles = await getLecturerArticles(id)

  const useMock = !lecturer
  if (useMock) {
    lecturer = mockLecturer
    articles = mockArticles
  }

  if (!lecturer) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Hero Section */}
      <section className="py-24 border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Photo */}
            <div className="lg:col-span-1">
              <div className="photo-editorial aspect-square max-w-sm mx-auto lg:mx-0">
                {lecturer.avatar_url ? (
                  <img 
                    src={lecturer.avatar_url} 
                    alt={lecturer.full_name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-paper-dark">
                    <span className="text-9xl">👨‍🏫</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-2">
              <span className="text-sm uppercase tracking-wider text-ink-muted mb-4 block">
                Lecturer Profile
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4">
                {lecturer.display_name || lecturer.full_name}
              </h1>
              {lecturer.title && (
                <p className="text-lg text-ink-muted mb-8">
                  {lecturer.title}
                </p>
              )}
              {lecturer.bio && (
                <p className="text-lg leading-relaxed mb-8 max-w-2xl">
                  {lecturer.bio}
                </p>
              )}

              {/* Expertise Tags */}
              {lecturer.expertise && lecturer.expertise.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {lecturer.expertise.map((skill, index) => (
                    <span key={index} className="tag-editorial">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <Link href="/lecture-request" className="btn-editorial">
                <span>邀約講座</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      {lecturer.bio_long && (
        <section className="py-24 border-b-2 border-black">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-8">
                <Quote className="w-6 h-6" strokeWidth={1.5} />
                <h2 className="font-serif text-3xl font-bold">關於我</h2>
              </div>
              <div className="space-y-6 text-lg leading-relaxed text-ink-light">
                {lecturer.bio_long.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Experiences */}
      {lecturer.experiences && lecturer.experiences.length > 0 && (
        <section className="py-24 border-b-2 border-black">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="flex items-center gap-3 mb-12">
              <Briefcase className="w-6 h-6" strokeWidth={1.5} />
              <h2 className="font-serif text-3xl font-bold">講座經歷</h2>
            </div>
            <div className="grid gap-6">
              {lecturer.experiences.map((exp, index) => (
                <div
                  key={index}
                  className="card-editorial p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-serif text-xl font-bold mb-1">
                      {exp.title}
                    </h3>
                    <p className="text-ink-muted">{exp.organization}</p>
                    {exp.description && (
                      <p className="text-sm text-ink-muted mt-2">{exp.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm uppercase tracking-wider text-ink-muted border-2 border-black px-4 py-2">
                    <Calendar className="w-4 h-4" strokeWidth={1.5} />
                    {exp.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles */}
      {articles.length > 0 && (
        <section className="py-24 border-b-2 border-black">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6" strokeWidth={1.5} />
                <h2 className="font-serif text-3xl font-bold">專欄文章</h2>
              </div>
              <Link href="/blog" className="btn-editorial-outline text-sm">
                <span>查看全部</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.id}`}
                  className="card-editorial group"
                >
                  <div className="p-6">
                    <span className="tag-editorial mb-4 inline-block">
                      {article.category}
                    </span>
                    <h3 className="font-serif text-xl font-bold mb-3 group-hover:underline underline-offset-4 decoration-2">
                      {article.title}
                    </h3>
                    <p className="text-ink-muted text-sm line-clamp-2 mb-4">
                      {article.excerpt}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-ink-muted">
                      {formatDate(article.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 給導師的一封信 */}
      <section className="py-24 border-b-2 border-black">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <LecturerInquiryForm 
            lecturerId={lecturer.id}
            lecturerName={lecturer.display_name || lecturer.full_name}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-black text-paper">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-6">
            邀請講座
          </h2>
          <p className="text-paper/70 mb-10 max-w-2xl mx-auto">
            歡迎填寫講座邀約申請表，我們會盡快與您聯繫，討論講座內容與細節。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/lecture-request" className="btn-editorial bg-paper text-black border-paper hover:bg-transparent hover:text-paper">
              <span>立即邀約</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
            <Link href="/apply" className="btn-editorial bg-transparent text-paper border-paper hover:bg-paper hover:text-black">
              <span>申請成為講師</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* Mock Notice */}
      {useMock && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-paper border-2 border-black p-4 shadow-hard text-sm">
          <strong>提示：</strong>目前顯示範例資料。請在後台完善講師資料。
        </div>
      )}
    </div>
  )
}
