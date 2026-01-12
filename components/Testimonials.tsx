'use client'

import { useEffect, useState, useRef } from 'react'
import { Quote, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface Testimonial {
  id: string
  name: string
  school_title: string | null
  content: string
  created_at: string
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      // 從 Notion API 獲取已審核的回饋
      const response = await fetch('/api/testimonials?approved=true&limit=10')
      const result = await response.json()

      if (result.success && result.data) {
        // 轉換資料格式
        const formattedData = result.data.map((item: {
          id: string
          name: string
          schoolTitle: string
          content: string
          createdAt: string
        }) => ({
          id: item.id,
          name: item.name,
          school_title: item.schoolTitle,
          content: item.content,
          created_at: item.createdAt,
        }))
        setTestimonials(formattedData)
      } else {
        console.error('獲取回饋錯誤:', result.error)
      }
    } catch (error) {
      console.error('獲取回饋錯誤:', error)
    }
    setLoading(false)
  }

  // 檢查滾動狀態
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [testimonials])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
      setTimeout(checkScroll, 300)
    }
  }

  // 如果沒有回饋，不顯示區塊
  if (!loading && testimonials.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-paper-dark border-t-2 border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* 標題區 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-paper mb-6">
            <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm uppercase tracking-wider">Testimonials</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-black mb-4">
            聽見校園的真實聲音
          </h2>
          <p className="text-ink-muted max-w-xl mx-auto">
            來自全台各地學校的真誠回饋，見證每一場講座帶來的改變
          </p>
        </div>

        {/* 回饋卡片區 - 桌面版 Masonry */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* 桌面版 - Masonry Grid */}
            <div className="hidden md:block">
              <div className="columns-2 lg:columns-3 gap-6 space-y-6">
                {testimonials.map((testimonial, index) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
                ))}
              </div>
            </div>

            {/* 手機版 - 水平滾動 */}
            <div className="md:hidden relative">
              {/* 滾動指示器 */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                <button
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className={`p-2 border-2 border-black bg-paper transition-all ${
                    canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                <button
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className={`p-2 border-2 border-black bg-paper transition-all ${
                    canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* 滾動容器 */}
              <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={testimonial.id} className="flex-shrink-0 w-[85vw] max-w-[320px] snap-center">
                    <TestimonialCard testimonial={testimonial} index={index} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/feedback"
            className="btn-editorial-outline inline-flex"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            <span>分享您的回饋</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

// 單一回饋卡片
function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  // 隨機變化的手繪風格邊框
  const borderStyles = [
    'border-2 border-black',
    'border-2 border-black border-l-4',
    'border-2 border-black border-t-4',
    'border-2 border-black border-r-4',
    'border-2 border-black border-b-4',
  ]
  
  const rotations = [
    'rotate-0',
    '-rotate-1',
    'rotate-1',
    '-rotate-[0.5deg]',
    'rotate-[0.5deg]',
  ]

  return (
    <div 
      className={`break-inside-avoid bg-paper p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow ${borderStyles[index % borderStyles.length]} ${rotations[index % rotations.length]}`}
    >
      {/* 大引號裝飾 */}
      <div className="relative mb-4">
        <Quote className="w-12 h-12 text-black/10 absolute -top-2 -left-2" strokeWidth={1} />
        <p className="text-black leading-relaxed relative z-10 pl-4 font-light">
          {testimonial.content}
        </p>
      </div>

      {/* 簽名區 */}
      <div className="border-t-2 border-black/20 pt-4 mt-4">
        <p className="font-serif font-bold text-black">
          {testimonial.name}
        </p>
        {testimonial.school_title && (
          <p className="text-sm text-ink-muted">
            {testimonial.school_title}
          </p>
        )}
      </div>

      {/* 手繪感裝飾線條 */}
      <svg className="absolute bottom-2 right-2 w-8 h-8 text-black/10" viewBox="0 0 32 32">
        <path
          d="M4 28 C 10 20, 22 20, 28 4"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
