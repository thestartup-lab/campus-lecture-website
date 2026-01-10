'use client'

import { motion, useScroll, useSpring } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'

// 淡入動畫變體
const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 60 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut" as const
    }
  }
}

// 墨水進度條組件
function InkProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <motion.div 
      className="fixed top-0 left-0 right-0 h-1 bg-black origin-left z-[100]"
      style={{ scaleX }}
    />
  )
}

// 首字下沉組件
function DropCap({ children }: { children: string }) {
  const firstLetter = children.charAt(0)
  const restOfText = children.slice(1)
  
  return (
    <p className="text-lg leading-relaxed text-black/80">
      <span className="float-left text-7xl font-serif font-black leading-[0.8] mr-3 mt-1 text-black">
        {firstLetter}
      </span>
      {restOfText}
    </p>
  )
}

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div 
      ref={containerRef}
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(0,0,0,0.02) 0%, transparent 50%),
          radial-gradient(circle at 80% 50%, rgba(0,0,0,0.02) 0%, transparent 50%),
          linear-gradient(rgba(0,0,0,0.01) 1px, transparent 1px),
          #FAFAFA
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 3px, 100% 100%'
      }}
    >
      {/* 墨水進度條 */}
      <InkProgressBar />

      {/* ===== 區塊一：頁面英雄區 ===== */}
      <section className="relative py-24 sm:py-32 lg:py-40 border-b-8 border-black overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center"
          >
            {/* 標籤 */}
            <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black mb-8 text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 bg-black rounded-full" />
              Our Story
            </div>

            {/* 主標題 */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-black leading-[1.1] tracking-tight mb-8">
              讓生命影響生命
              <br />
              <span className="relative inline-block mt-2">
                計劃緣起
                <span className="absolute bottom-1 left-0 w-full h-3 bg-black/10 -z-10" />
              </span>
            </h1>

            {/* 副標題 */}
            <p className="text-xl sm:text-2xl text-black/60 font-medium max-w-2xl mx-auto">
              「給你選擇，而你可以做出決定。」
            </p>
          </motion.div>
        </div>

        {/* 膠捲裝飾 */}
        <div className="mt-16 sm:mt-20 border-y-2 border-black overflow-hidden">
          <div className="relative h-32 sm:h-40 bg-black flex items-center">
            {/* 膠捲孔 - 上 */}
            <div className="absolute top-2 left-0 right-0 flex justify-around px-4">
              {[...Array(15)].map((_, i) => (
                <div key={`top-${i}`} className="w-4 h-4 sm:w-5 sm:h-5 bg-white/90 rounded-sm" />
              ))}
            </div>
            
            {/* 膠捲內容區 */}
            <div className="flex-1 mx-8 sm:mx-12 h-20 sm:h-24 bg-white/10 flex items-center justify-center">
              <p className="text-white/60 text-sm sm:text-base uppercase tracking-[0.3em] font-medium">
                — 全國校園巡迴分享 —
              </p>
            </div>
            
            {/* 膠捲孔 - 下 */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-around px-4">
              {[...Array(15)].map((_, i) => (
                <div key={`bottom-${i}`} className="w-4 h-4 sm:w-5 sm:h-5 bg-white/90 rounded-sm" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 區塊二：第一章 - 初衷 ===== */}
      <section className="py-20 sm:py-28 border-b-4 border-black">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            {/* 章節標題 */}
            <div className="mb-12">
              <span className="text-xs uppercase tracking-widest text-black/40 font-bold block mb-3">
                Chapter 01
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-black text-black leading-tight">
                初衷
                <span className="block text-xl sm:text-2xl font-medium text-black/60 mt-2">
                  —— 脫下盔甲後的真實對話
                </span>
              </h2>
              <div className="w-24 h-1 bg-black mt-6" />
            </div>

            {/* 首字下沉內容 */}
            <div className="space-y-6">
              <DropCap>
                每一場冒險的起點，往往都源於一個微小的問號。在多年的教學與演講生涯中，我常被問到：「為什麼要走進校園？」
              </DropCap>
              
              <p className="text-lg leading-relaxed text-black/80">
                對我而言，鋼鐵人的盔甲不僅僅是力量的象徵，它更像是一種守護。但我發現，現今校園裡的青少年，缺少的往往不是保護，而是「選擇的勇氣」。
              </p>
              
              <p className="text-lg leading-relaxed text-black/80">
                我希望建立一個平台，不只是傳遞知識，而是透過一場場真實的生命分享，讓學生看見：在標準答案之外，人生還有無數種可能。
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 區塊三：第二章 - 轉折 (社論側寫框) ===== */}
      <section className="py-20 sm:py-28 border-b-4 border-black bg-black/5">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            {/* 社論側寫框 */}
            <div 
              className="bg-white border-4 border-black p-8 sm:p-12 lg:p-16 relative"
              style={{
                boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)'
              }}
            >
              {/* 裝飾角標 */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-black" />
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-black" />
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-black" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-black" />

              {/* 章節標題 */}
              <div className="mb-10">
                <span className="text-xs uppercase tracking-widest text-black/40 font-bold block mb-3">
                  Chapter 02
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-black text-black leading-tight">
                  那雙在黑暗中發光的眼睛
                </h2>
                <div className="w-full h-1 bg-black mt-6" />
              </div>

              {/* 引言 */}
              <blockquote className="border-l-8 border-black pl-6 mb-8">
                <p className="font-serif text-xl sm:text-2xl italic text-black/80 leading-relaxed">
                  「老師，我從來不覺得自己有選擇權，我以為我只能照著別人的期待走。」
                </p>
              </blockquote>

              {/* 內文 */}
              <div className="space-y-6">
                <p className="text-lg leading-relaxed text-black/80">
                  記得在某一場偏鄉高中的演講結束後，一位學生在台下等了很久。他低著頭對我說出了這句話。
                </p>
                
                <p className="text-lg leading-relaxed text-black/80">
                  那一刻，我意識到這不再只是一個「講座計畫」，而是一場「覺醒運動」。當我們在膠捲般的生命歷程中，按下暫停鍵，重新審視每一個格位時，我們才真正開始「活著」。
                </p>
                
                <p className="text-lg leading-relaxed text-black font-medium">
                  從那一場開始，我決定要把這套關於「選擇」的技術，帶進全台灣的每一間教室。
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 區塊四：第三章 - 願景 ===== */}
      <section className="py-20 sm:py-28 border-b-4 border-black">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            {/* 章節標題 */}
            <div className="mb-12">
              <span className="text-xs uppercase tracking-widest text-black/40 font-bold block mb-3">
                Chapter 03
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-black text-black leading-tight">
                願景
                <span className="block text-xl sm:text-2xl font-medium text-black/60 mt-2">
                  —— 給你選擇，由你決定
                </span>
              </h2>
              <div className="w-24 h-1 bg-black mt-6" />
            </div>

            {/* 數據展示 */}
            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="border-4 border-black p-6 text-center">
                <div className="font-serif text-5xl sm:text-6xl font-black text-black mb-2">100</div>
                <div className="text-sm uppercase tracking-widest text-black/60 font-bold">所高中職</div>
              </div>
              <div className="border-4 border-black p-6 text-center">
                <div className="font-serif text-5xl sm:text-6xl font-black text-black mb-2">10,000</div>
                <div className="text-sm uppercase tracking-widest text-black/60 font-bold">個可能的改變</div>
              </div>
            </div>

            {/* 內文 */}
            <div className="space-y-6">
              <p className="text-lg leading-relaxed text-black/80">
                我們的目標很明確：在三年內，走遍全台灣一百所高中職。這不只是一個數字，而是代表著一萬個可能的改變。
              </p>
              
              <p className="text-lg leading-relaxed text-black/80">
                我們透過「專欄寫作」延續影響力，透過「實體講座」點燃火種，並透過「數位伴隨」讓資源不再有城鄉差距。
              </p>
              
              <p className="text-lg leading-relaxed text-black/80">
                我們相信，每一個生命都值得擁有一次「重新決定」的機會。而這一切，就從你邀請我們走進校園的那一刻開始。
              </p>
            </div>

            {/* 三大支柱 */}
            <div className="grid sm:grid-cols-3 gap-4 mt-12">
              <div className="border-2 border-black p-6 text-center hover:bg-black hover:text-white transition-colors group">
                <div className="text-3xl mb-3">📝</div>
                <div className="text-sm uppercase tracking-widest font-bold">專欄寫作</div>
                <div className="text-xs text-black/60 group-hover:text-white/60 mt-2">延續影響力</div>
              </div>
              <div className="border-2 border-black p-6 text-center hover:bg-black hover:text-white transition-colors group">
                <div className="text-3xl mb-3">🎤</div>
                <div className="text-sm uppercase tracking-widest font-bold">實體講座</div>
                <div className="text-xs text-black/60 group-hover:text-white/60 mt-2">點燃火種</div>
              </div>
              <div className="border-2 border-black p-6 text-center hover:bg-black hover:text-white transition-colors group">
                <div className="text-3xl mb-3">💻</div>
                <div className="text-sm uppercase tracking-widest font-bold">數位伴隨</div>
                <div className="text-xs text-black/60 group-hover:text-white/60 mt-2">消弭城鄉差距</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 區塊五：結尾簽名 ===== */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-right"
          >
            <div className="inline-block">
              <p className="text-sm uppercase tracking-widest text-black/40 font-bold mb-4">
                創辦人
              </p>
              <p 
                className="font-serif text-3xl sm:text-4xl italic text-black mb-4"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                Peter Li
              </p>
              {/* 手繪墨水線 */}
              <svg 
                width="200" 
                height="20" 
                viewBox="0 0 200 20" 
                className="ml-auto"
              >
                <path 
                  d="M0 10 Q 30 5, 60 12 T 120 8 T 180 12 L 200 10" 
                  stroke="black" 
                  strokeWidth="2" 
                  fill="none"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: '200',
                    strokeDashoffset: '0'
                  }}
                />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA 區塊 ===== */}
      <section className="py-16 bg-black text-white border-t-8 border-black">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-6">
              準備好讓改變發生了嗎？
            </h3>
            <a 
              href="/invitation"
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-transparent hover:text-white border-2 border-white transition-colors"
            >
              邀請我們走進校園
              <span className="text-lg">→</span>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
