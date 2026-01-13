'use client'

import { ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface ResourceLink {
  id: string
  title: string
  description: string
  url: string
  domain: string
  thumbnail?: string
}

const resourceLinks: ResourceLink[] = [
  {
    id: '1',
    title: 'Google for Education',
    description: 'Google 提供的全方位雲端教育解決方案，包含 Classroom、Meet、Drive 等工具，協助教師建立數位化教學環境。',
    url: 'https://edu.google.com',
    domain: 'edu.google.com',
    thumbnail: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
  },
  {
    id: '2',
    title: 'Canva 教育版',
    description: '簡單強大的視覺設計工具，為師生提供免費高級資源，讓教學素材製作變得輕鬆有趣。',
    url: 'https://www.canva.com/education',
    domain: 'canva.com',
    thumbnail: 'https://www.canva.com/favicon.ico',
  },
  {
    id: '3',
    title: 'Notion',
    description: '全能的筆記與知識管理系統，適合建立教學資料庫、課程規劃與協作專案，整合所有教學資源於一處。',
    url: 'https://www.notion.so',
    domain: 'notion.so',
    thumbnail: 'https://www.notion.so/images/logo-ios.png',
  },
  {
    id: '4',
    title: '均一教育平台',
    description: '台灣在地優質的線上學習資源，提供豐富的跨學科內容，從國小到高中各年級課程完整涵蓋。',
    url: 'https://www.junyiacademy.org',
    domain: 'junyiacademy.org',
    thumbnail: 'https://www.junyiacademy.org/favicon.ico',
  },
  {
    id: '5',
    title: 'Khan Academy',
    description: '全球知名的免費線上課程平台，強調個人化學習進度，涵蓋數學、科學、人文等多元領域。',
    url: 'https://www.khanacademy.org',
    domain: 'khanacademy.org',
    thumbnail: 'https://cdn.kastatic.org/images/khan-logo-dark-background-2-transparent.png',
  },
]

// LinkCard 元件
function LinkCard({ resource }: { resource: ResourceLink }) {
  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return resource.domain
    }
  }

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-black/5 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row h-full">
        {/* 左側內容 (70%) */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-3 leading-tight">
              {resource.title}
            </h3>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed mb-4 line-clamp-2">
              {resource.description}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-muted uppercase tracking-wider">
            <span>{getDomainFromUrl(resource.url)}</span>
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
          </div>
        </div>

        {/* 右側縮圖 (30%) */}
        <div className="w-full sm:w-[30%] h-48 sm:h-auto border-t-2 sm:border-t-0 sm:border-l-2 border-black bg-paper-dark flex items-center justify-center overflow-hidden relative">
          {resource.thumbnail ? (
            <Image
              src={resource.thumbnail}
              alt={resource.title}
              fill
              className="object-cover grayscale contrast-125"
              unoptimized
              onError={(e) => {
                // 如果圖片載入失敗，顯示 fallback
                const target = e.currentTarget as HTMLImageElement
                target.style.display = 'none'
                const fallback = target.parentElement?.querySelector('.thumbnail-fallback')
                if (fallback) {
                  (fallback as HTMLElement).style.display = 'flex'
                }
              }}
            />
          ) : null}
          <div className="thumbnail-fallback absolute inset-0 flex items-center justify-center text-ink-muted" style={{ display: resource.thumbnail ? 'none' : 'flex' }}>
            <ExternalLink className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={1} />
          </div>
        </div>
      </div>
    </a>
  )
}

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        {/* 標題區 */}
        <div className="mb-12 border-b-2 border-black pb-8">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4 leading-tight">
            教育資源導航
          </h1>
          <p className="text-lg sm:text-xl text-ink-muted font-light leading-relaxed">
            精選數位工具與教育平台，點擊直接前往官方網站。
          </p>
        </div>

        {/* 資源卡片網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {resourceLinks.map((resource) => (
            <LinkCard key={resource.id} resource={resource} />
          ))}
        </div>

        {/* 底部提示 */}
        <div className="mt-16 pt-8 border-t-2 border-black">
          <p className="text-sm text-ink-muted text-center uppercase tracking-wider">
            持續更新中 · 歡迎推薦優質教育資源
          </p>
        </div>
      </div>
    </main>
  )
}
