'use client'

import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' as const },
  },
}

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const categories = [
  {
    icon: <GraduationCap className="w-5 h-5" strokeWidth={1.5} />,
    audience: '高中生',
    tag: '探索與裝備',
    topics: [
      '不只是讀書：AI 時代所需的領導力與核心素養',
      '設計你的人生：從自我覺察到職涯藍圖繪製',
      '學會合作，更要學會共好：高效團隊溝通術',
    ],
  },
  {
    icon: <BookOpen className="w-5 h-5" strokeWidth={1.5} />,
    audience: '教師',
    tag: '賦能與創新',
    topics: [
      '教室裡的領導者：引爆學生動機的教學影響力',
      '當老師遇上 ChatGPT：創新教學策略與思維轉變',
      '翻轉教育，體驗學習：做中學，學中覺，讓學生成為學習的主人',
    ],
  },
  {
    icon: <Heart className="w-5 h-5" strokeWidth={1.5} />,
    audience: '家長',
    tag: '理解與陪伴',
    topics: [
      '聽懂青春期的「外星語」：建立高品質親子連結',
      '允許失敗的勇氣：培養孩子受用一生的成長型思維',
      '界線中的愛：讓孩子願意聽你說，也願意說給你聽',
    ],
  },
]

export default function PopularTopics() {
  return (
    <section className="py-24 border-b-2 border-black bg-paper">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* 標題區 */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeInUp}
          className="mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-ink-muted font-bold block mb-3">
            2026 Featured Topics
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight mb-4">
                2026 年度熱門講座主題
              </h2>
              <div className="w-24 h-1 bg-black" />
            </div>
            <Link
              href="/lecture-request"
              className="btn-editorial-outline inline-flex self-start sm:self-auto shrink-0"
            >
              <span>立即邀約</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </motion.div>

        {/* 主題卡片 */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-0 border-2 border-black"
        >
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              className={`p-8 lg:p-10 flex flex-col gap-6 ${
                idx < categories.length - 1
                  ? 'border-b-2 md:border-b-0 md:border-r-2 border-black'
                  : ''
              }`}
            >
              {/* 頭部：對象標籤 */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 border-2 border-black bg-black text-paper">
                  {cat.icon}
                </div>
                <div>
                  <div className="font-serif text-xl font-bold text-black leading-tight">
                    {cat.audience}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-ink-muted">
                    {cat.tag}
                  </div>
                </div>
              </div>

              {/* 分隔線 */}
              <div className="w-full h-px bg-black/20" />

              {/* 主題列表 */}
              <ul className="space-y-4 flex-1">
                {cat.topics.map((topic, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <span className="font-serif font-bold text-black mt-0.5 text-lg leading-none shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-ink-light leading-snug group-hover:text-black transition-colors text-sm">
                      {topic}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* 底部提示 */}
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center text-sm text-ink-muted mt-8"
        >
          以上為精選主題，實際講座內容可依學校需求客製化調整。
          <Link href="/lecturers" className="ml-2 underline underline-offset-4 hover:text-black transition-colors">
            查看所有講師 →
          </Link>
        </motion.p>
      </div>
    </section>
  )
}
