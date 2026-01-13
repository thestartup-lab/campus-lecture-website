'use client'

import { ArrowRight, Users, BookOpen } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'

// 數字跳動動畫 Hook
function useCountUp(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // easeOutExpo 緩動函數
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.floor(easeProgress * (end - start) + start))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [hasStarted, end, duration, start])

  return { count, ref }
}

export default function Hero() {
  const [settings, setSettings] = useState<Record<string, string | number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setSettings(result.data)
        }
      })
      .catch(err => console.error('載入網站設定錯誤:', err))
      .finally(() => setLoading(false))
  }, [])

  const lecturersCount = typeof settings.hero_lecturers_count === 'number' ? settings.hero_lecturers_count : 20
  const lecturesCount = typeof settings.hero_lectures_count === 'number' ? settings.hero_lectures_count : 1200
  const studentsCount = typeof settings.hero_students_count === 'number' ? settings.hero_students_count : 50

  const lecturers = useCountUp(lecturersCount, 1500)
  const lectures = useCountUp(lecturesCount, 2000)
  const students = useCountUp(studentsCount, 1800)

  return (
    <section className="relative bg-paper overflow-hidden">
      {/* 橫向主圖 */}
      <div className="relative w-full bg-paper">
        <Image
          src="/images/hero-cover.jpeg?v=5"
          alt="生命 - 全國校園巡迴分享"
          width={1920}
          height={800}
          className="w-full h-auto object-contain"
          sizes="100vw"
          priority
          unoptimized
        />
      </div>

      {/* 內容區域 */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* 左側：主要內容 */}
          <div>
            {/* Subtitle */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6 leading-[1.1]">
              讓教育
              <span className="relative inline-block ml-2">
                更有溫度
                <span className="absolute bottom-1 left-0 w-full h-2 bg-black/10 -z-10" />
              </span>
            </h2>
            
            <p className="text-lg sm:text-xl text-ink-light mb-10 leading-relaxed font-light">
              連結專業講師與校園，為學生帶來啟發性的學習體驗。
              我們相信，每一場講座都能點燃學習的熱情，開啟未來的可能。
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/lecture-request" className="btn-editorial group">
                <span>立即邀約講師</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/lecturers" className="btn-editorial-outline group">
                <Users className="w-4 h-4" />
                <span>認識講師</span>
              </Link>
              <Link href="/blog" className="btn-editorial-outline group">
                <BookOpen className="w-4 h-4" />
                <span>瀏覽專欄</span>
              </Link>
            </div>
          </div>

          {/* 右側：統計數據 */}
          <div className="lg:border-l-2 lg:border-black lg:pl-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black mb-8 text-sm font-medium uppercase tracking-wider">
              <span className="w-2 h-2 bg-black rounded-full" />
              <span>Our Impact</span>
            </div>
            
            <div className="space-y-8">
              <div className="group" ref={lecturers.ref}>
                <div className="font-serif text-5xl sm:text-6xl font-bold text-black mb-2 group-hover:translate-x-2 transition-transform">
                  <span className="inline-block tabular-nums">{lecturers.count}</span>
                  <span className="text-4xl sm:text-5xl">+</span>
                </div>
                <div className="text-sm uppercase tracking-wider text-ink-muted border-b border-black/20 pb-4">合作講師</div>
              </div>
              <div className="group" ref={lectures.ref}>
                <div className="font-serif text-5xl sm:text-6xl font-bold text-black mb-2 group-hover:translate-x-2 transition-transform">
                  <span className="inline-block tabular-nums">{lectures.count.toLocaleString()}</span>
                  <span className="text-4xl sm:text-5xl">+</span>
                </div>
                <div className="text-sm uppercase tracking-wider text-ink-muted border-b border-black/20 pb-4">場次講座</div>
              </div>
              <div className="group" ref={students.ref}>
                <div className="font-serif text-5xl sm:text-6xl font-bold text-black mb-2 group-hover:translate-x-2 transition-transform">
                  <span className="inline-block tabular-nums">{students.count}</span>
                  <span className="text-4xl sm:text-5xl">K+</span>
                </div>
                <div className="text-sm uppercase tracking-wider text-ink-muted">學生參與</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
