import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'

// ISR: 每小時重新生成一次
export const revalidate = 3600

// SEO Metadata
export const metadata: Metadata = {
  title: '認識講師 | 校園講座計劃',
  description: '我們的講師來自各個專業領域，擁有豐富的教學經驗與實務背景，致力於為學生帶來啟發性的學習體驗。',
  openGraph: {
    title: '認識講師 | 校園講座計劃',
    description: '我們的講師來自各個專業領域，擁有豐富的教學經驗與實務背景。',
    type: 'website',
  },
}

interface Lecturer {
  id: string
  full_name: string
  display_name: string | null
  title: string | null
  bio: string | null
  avatar_url: string | null
  expertise: string[]
  is_approved: boolean
  is_public: boolean
}

async function getLecturers(): Promise<Lecturer[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, display_name, title, bio, avatar_url, expertise, is_approved, is_public, role')
    .eq('is_approved', true)
    .eq('is_public', true)
    .in('role', ['instructor', 'admin'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('獲取講師列表錯誤:', error)
    return [
      {
        id: 'mock-1',
        full_name: '王小明',
        display_name: '王小明老師',
        title: '資深教育顧問',
        bio: '致力於推動創新教育，擁有超過15年的教學經驗。',
        avatar_url: null,
        expertise: ['創新教育', '設計思考', '領導力'],
        is_approved: true,
        is_public: true
      },
      {
        id: 'mock-2',
        full_name: '李小華',
        display_name: '李小華博士',
        title: 'AI 教育專家',
        bio: '專注於人工智慧與教育的結合。',
        avatar_url: null,
        expertise: ['人工智慧', '科技教育', '數位轉型'],
        is_approved: true,
        is_public: true
      },
      {
        id: 'mock-3',
        full_name: '陳大偉',
        display_name: '陳大偉教授',
        title: '永續發展專家',
        bio: '長期投入環境教育與永續發展議題。',
        avatar_url: null,
        expertise: ['永續發展', '環境教育', 'ESG'],
        is_approved: true,
        is_public: true
      }
    ]
  }

  return data as Lecturer[]
}

export default async function LecturersPage() {
  const lecturers = await getLecturers()

  return (
    <div className="min-h-screen bg-paper">
      {/* Hero */}
      <section className="py-24 border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <span className="text-sm uppercase tracking-wider text-ink-muted mb-4 block">
            Our Lecturers
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-black mb-8">
            認識講師
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl leading-relaxed">
            我們的講師來自各個專業領域，擁有豐富的教學經驗與實務背景，
            致力於為學生帶來啟發性的學習體驗。
          </p>
        </div>
      </section>

      {/* 引導說明 */}
      <section className="py-12 border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-black mb-4">
              尋找您的生命導師
            </h2>
            <p className="text-base sm:text-lg text-ink-muted leading-relaxed">
              我們提供專業的講師媒合服務。您可以點擊下方頭像進入講師個人簡介，了解其專業背景；若有特定的講座需求或諮詢，請進入個人頁面後於下方留言與講師連繫。
            </p>
          </div>
        </div>
      </section>

      {/* Lecturers Grid */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          {lecturers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-ink-muted">目前尚無講師資料</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lecturers.map((lecturer, index) => (
                <Link
                  key={lecturer.id}
                  href={`/lecturer/${lecturer.id}`}
                  className="group card-editorial"
                >
                  {/* Photo */}
                  <div className="relative aspect-[4/3] bg-paper-dark border-b-2 border-black overflow-hidden">
                    {lecturer.avatar_url ? (
                      <img
                        src={lecturer.avatar_url}
                        alt={lecturer.full_name}
                        className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-8xl grayscale group-hover:grayscale-0 transition-all duration-500">👨‍🏫</span>
                      </div>
                    )}
                    {/* Number Badge */}
                    <div className="absolute top-4 right-4 font-serif text-5xl font-bold text-black/10">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-serif text-2xl font-bold text-black mb-2 group-hover:underline underline-offset-4 decoration-2">
                      {lecturer.display_name || lecturer.full_name}
                    </h3>
                    {lecturer.title && (
                      <p className="text-sm text-ink-muted uppercase tracking-wider mb-4">
                        {lecturer.title}
                      </p>
                    )}
                    {lecturer.bio && (
                      <p className="text-ink-muted text-sm line-clamp-2 mb-4">
                        {lecturer.bio}
                      </p>
                    )}

                    {/* Expertise Tags */}
                    {lecturer.expertise && lecturer.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {lecturer.expertise.slice(0, 3).map((skill, i) => (
                          <span key={i} className="tag-editorial">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* View Profile */}
                  <div className="px-6 py-4 border-t-2 border-black bg-paper group-hover:bg-black group-hover:text-paper transition-colors">
                    <span className="flex items-center justify-between text-sm uppercase tracking-wider font-medium">
                      查看介紹
                      <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-black text-paper">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-6">
            想成為講師？
          </h2>
          <p className="text-paper/70 mb-10 max-w-2xl mx-auto">
            如果您也熱愛教育、樂於分享，歡迎加入我們的講師團隊，
            一起為校園帶來更多精彩的講座。
          </p>
          <Link href="/apply" className="btn-editorial bg-paper text-black border-paper hover:bg-transparent hover:text-paper">
            <span>申請成為講師</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </div>
  )
}
