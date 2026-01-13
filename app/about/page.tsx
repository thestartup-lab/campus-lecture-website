'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { BookOpen, Users, Heart, Target, GraduationCap, Briefcase, Users2, Lightbulb, MessageCircle, Send, CheckCircle, Mail, Building2 } from 'lucide-react'

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

// 首字下沉組件
function DropCap({ children }: { children: string }) {
  const firstLetter = children.charAt(0)
  const restOfText = children.slice(1)
  
  return (
    <p className="text-lg sm:text-xl leading-relaxed text-ink-light">
      <span className="float-left text-7xl sm:text-8xl font-serif font-black leading-[0.8] mr-3 mt-1 text-black">
        {firstLetter}
      </span>
      {restOfText}
    </p>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper">
      {/* ===== Hero 區 ===== */}
      <section className="py-24 sm:py-32 border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center"
          >
            <span className="text-sm uppercase tracking-wider text-ink-muted mb-4 block">
              Our Story
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-black mb-8">
              計劃緣起
            </h1>
            <p className="text-lg sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
              二十載耕耘，回歸教育初心
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== 第一章：品牌歷程 ===== */}
      <section className="py-24 border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            {/* 章節標題 */}
            <div className="mb-12">
              <span className="text-xs uppercase tracking-widest text-ink-muted font-bold block mb-3">
                Chapter 01
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
                品牌歷程
              </h2>
              <div className="w-24 h-1 bg-black" />
            </div>

            {/* 內容與時間軸 */}
            <div className="grid lg:grid-cols-3 gap-12 items-start">
              {/* 文字內容 */}
              <div className="lg:col-span-2 space-y-6">
                <DropCap>
                  自 2002 年起，我們在各大專院校播下領導力的種子。從中華康輔教育推廣協會啟程，到成立「競爭LEAD教育中心」的專業深耕。這二十多年來，我們培育出無數優秀的領導人才，受邀演講累積達上百所高中職與大專院校，足跡從校園跨入企業。無論走得再遠，我們始終掛念著那群正處於生命轉折點的孩子。2026 年，我們決定展開回饋校園的計劃，讓更多的孩子可以從覺察開始，追求卓越的人生。
                </DropCap>
              </div>

              {/* 時間軸 */}
              <div className="lg:col-span-1">
                <div className="border-2 border-black p-8 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="space-y-8">
                    {/* 2002 */}
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-2 w-4 h-4 border-2 border-black bg-white rounded-full" />
                      <div className="absolute left-2 top-2 w-0.5 h-full bg-black" />
                      <div>
                        <div className="font-serif text-2xl font-bold text-black mb-1">2002</div>
                        <div className="text-sm text-ink-muted uppercase tracking-wider">啟航</div>
                      </div>
                    </div>

                    {/* 2026 */}
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-2 w-4 h-4 border-2 border-black bg-black rounded-full" />
                      <div>
                        <div className="font-serif text-2xl font-bold text-black mb-1">2026</div>
                        <div className="text-sm text-ink-muted uppercase tracking-wider">回饋計畫</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 第二章：我們可以做的事 ===== */}
      <section className="py-24 border-b-2 border-black bg-paper-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            {/* 章節標題 */}
            <div className="mb-16 text-center">
              <span className="text-xs uppercase tracking-widest text-ink-muted font-bold block mb-3">
                Chapter 02
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
                我們可以做的事
              </h2>
              <p className="text-lg text-ink-muted max-w-2xl mx-auto">
                三位一體的專業支持
              </p>
              <div className="w-24 h-1 bg-black mx-auto mt-6" />
            </div>

            {/* 三欄式排版 */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* A. 學生端 */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-3 border-2 border-black">
                    <GraduationCap className="w-6 h-6 text-black" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-black">學生端</h3>
                </div>
                <ul className="space-y-4 text-ink-light">
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold mt-1">•</span>
                    <span><strong className="text-black">生涯輔導：</strong>引導學生自我覺察，探索生命意義與未來方向。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold mt-1">•</span>
                    <span><strong className="text-black">職涯發展：</strong>接軌產業趨勢，建立職涯藍圖與卓越的人生態度。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold mt-1">•</span>
                    <span><strong className="text-black">團隊協作：</strong>透過領導力實踐，培養溝通、解決問題與共好的核心素養。</span>
                  </li>
                </ul>
              </motion.div>

              {/* B. 教師端 */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                transition={{ delay: 0.1 }}
                className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-3 border-2 border-black">
                    <BookOpen className="w-6 h-6 text-black" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-black">教師端</h3>
                </div>
                <ul className="space-y-4 text-ink-light">
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold mt-1">•</span>
                    <span><strong className="text-black">教學領導力賦能：</strong>提供專業成長路徑，讓每一位老師成為點燃學生生命的火種。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold mt-1">•</span>
                    <span><strong className="text-black">創新教學策略支援：</strong>協助教師發展多元教學方法，提升教學成效。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold mt-1">•</span>
                    <span><strong className="text-black">改變校園的專業成長：</strong>建立教師社群，共同推動校園變革。</span>
                  </li>
                </ul>
              </motion.div>

              {/* C. 家長端 */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
                className="border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-3 border-2 border-black">
                    <Heart className="w-6 h-6 text-black" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-black">家長端</h3>
                </div>
                <ul className="space-y-4 text-ink-light">
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold mt-1">•</span>
                    <span><strong className="text-black">親子溝通覺察引導：</strong>協助家長建立有效的親子溝通模式。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold mt-1">•</span>
                    <span><strong className="text-black">成長型思維建立：</strong>培養家長與孩子共同成長的思維模式。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-black font-bold mt-1">•</span>
                    <span><strong className="text-black">家庭教育的長期支持：</strong>提供持續性的家庭教育資源與陪伴。</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 第三章：我們想要做的事 ===== */}
      <section className="py-24 border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            {/* 章節標題 */}
            <div className="mb-12">
              <span className="text-xs uppercase tracking-widest text-ink-muted font-bold block mb-3">
                Chapter 03
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
                我們想要做的事
              </h2>
              <div className="w-24 h-1 bg-black" />
            </div>

            {/* 核心願景大區塊 */}
            <div className="border-2 border-black bg-black text-paper p-12 sm:p-16 lg:p-20 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
              <div className="max-w-4xl mx-auto text-center">
                <p className="font-serif text-3xl sm:text-4xl lg:text-5xl italic font-bold leading-relaxed">
                  改變校園，從老師開始。我們致力於培養教師的領導力，讓每一位老師成為點燃學生生命的火種。
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 結尾簽名 ===== */}
      <section className="py-24 border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-right"
          >
            <div className="inline-block">
              <p className="text-sm uppercase tracking-widest text-ink-muted font-bold mb-4">
                創辦人
              </p>
              <p 
                className="font-serif text-3xl sm:text-4xl italic text-black mb-6"
                style={{ 
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontStyle: 'italic'
                }}
              >
                李柏賢
              </p>
              {/* 手繪墨水筆劃 */}
              <svg 
                width="250" 
                height="30" 
                viewBox="0 0 250 30" 
                className="ml-auto"
                style={{ filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.3))' }}
              >
                <path 
                  d="M0 15 Q 40 8, 80 18 T 160 12 T 240 18 L 250 15" 
                  stroke="black" 
                  strokeWidth="3" 
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: '250',
                    strokeDashoffset: '0'
                  }}
                />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 第四章：諮詢表單 ===== */}
      <InquiryFormSection />
    </div>
  )
}

// 諮詢表單組件
function InquiryFormSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    content: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 如果有單位，將單位資訊包含在內容中
      const contentWithOrg = formData.organization 
        ? `【單位】${formData.organization}\n\n${formData.content}`
        : formData.content

      const response = await fetch('/api/faq-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          content: contentWithOrg,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        setFormData({
          name: '',
          email: '',
          organization: '',
          content: '',
        })
      } else {
        alert('提交失敗：' + (result.error || '未知錯誤'))
      }
    } catch (error) {
      console.error('提交錯誤:', error)
      alert('提交時發生錯誤，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <section className="py-24 bg-paper">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="relative"
        >
          {/* 復古投書明信片風格 */}
          <div className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
            {/* 郵票裝飾（右上角） */}
            <div className="absolute -top-4 -right-4 z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-black bg-paper rotate-12 flex items-center justify-center">
                <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-black" strokeWidth={1.5} />
              </div>
            </div>

            <div className="p-8 sm:p-12 pt-16 sm:pt-20">
              {/* 引導文字 */}
              <div className="mb-8 text-center">
                <p className="text-lg sm:text-xl text-ink-light leading-relaxed">
                  看完我們的故事，若您有任何講座邀約、公益需求或教育諮詢，請直接給我們一封信。
                </p>
              </div>

              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 border-2 border-black bg-black text-paper rounded-full">
                      <CheckCircle className="w-12 h-12" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-4">
                    您的訊息已送出
                  </h3>
                  <p className="text-lg text-ink-muted leading-relaxed mb-8">
                    我們將儘速回覆。
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="btn-editorial-outline"
                  >
                    <span>送出另一封信</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 姓名 */}
                  <div>
                    <label
                      htmlFor="inquiry-name"
                      className="block text-sm font-medium uppercase tracking-wider text-black mb-2"
                    >
                      您的姓名
                    </label>
                    <input
                      type="text"
                      id="inquiry-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="請輸入您的姓名"
                      className="w-full px-4 py-3 bg-paper border-2 border-black text-black placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-black text-base"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="inquiry-email"
                      className="block text-sm font-medium uppercase tracking-wider text-black mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="inquiry-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 bg-paper border-2 border-black text-black placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-black text-base"
                    />
                  </div>

                  {/* 單位 */}
                  <div>
                    <label
                      htmlFor="inquiry-organization"
                      className="block text-sm font-medium uppercase tracking-wider text-black mb-2"
                    >
                      單位
                    </label>
                    <input
                      type="text"
                      id="inquiry-organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="例如：XX 高中、XX 教育基金會..."
                      className="w-full px-4 py-3 bg-paper border-2 border-black text-black placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-black text-base"
                    />
                  </div>

                  {/* 訊息內容 */}
                  <div>
                    <label
                      htmlFor="inquiry-content"
                      className="block text-sm font-medium uppercase tracking-wider text-black mb-2"
                    >
                      訊息內容
                    </label>
                    <textarea
                      id="inquiry-content"
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      required
                      rows={8}
                      placeholder="請描述您的需求或疑問..."
                      className="w-full px-4 py-3 bg-paper border-2 border-black text-black placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-black resize-none text-base"
                    />
                  </div>

                  {/* 提交按鈕 */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-editorial w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <span>寄送中...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" strokeWidth={1.5} />
                          <span>寄出這封信</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
