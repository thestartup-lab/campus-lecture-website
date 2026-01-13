'use client'

import { useState } from 'react'
import { ChevronDown, Send, CheckCircle, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQItem {
  id: string
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: '如何邀約講座？',
    answer: '請點選網頁上方的「立即邀約」，填寫基礎資訊後，我們將在 3 個工作日內與您連繫確認細節。',
  },
  {
    id: '2',
    question: '講座可以客製化嗎？',
    answer: '可以。我們擅長針對不同學群調整敘事重心，請在「講座規劃」頁面告訴我們您的需求。',
  },
  {
    id: '3',
    question: '講座時間通常多長？',
    answer: '標準時數為 90 至 120 分鐘，亦可配合校方週會時間調整。',
  },
  {
    id: '4',
    question: '費用如何計算？',
    answer: '費用根據時數、地點與教材需求而定，公立學校可參考教育部標準。',
  },
  {
    id: '5',
    question: '校方需準備什麼？',
    answer: '僅需投影設備與音響，其餘視覺教材與互動道具由我們準備。',
  },
  {
    id: '6',
    question: '【重要】若學校經費有限？',
    answer: '我們每學期皆保留「公益講座」名額。公益性質講座僅需由校方提供實支實付之「交通往返費用」，講師費全額減免。請在邀約表單註明需求，我們將依現況評估。',
  },
]

function FAQAccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-2 border-black bg-white">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-black/5 transition-colors"
      >
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-black pr-4">
          {item.question}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-black" strokeWidth={2} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 border-t-2 border-black">
              <p className="pt-4 text-base sm:text-lg text-ink-muted leading-relaxed">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/faq-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        setFormData({
          name: '',
          email: '',
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
    <main className="min-h-screen bg-paper">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        {/* 標題區 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 border-b-2 border-black pb-8"
        >
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4 leading-tight">
            常見問題 (FAQ)
          </h1>
          <p className="text-lg sm:text-xl text-ink-muted font-light leading-relaxed">
            讓生命影響生命，我們為教育現場提供最實質的支持。
          </p>
        </motion.div>

        {/* FAQ 折疊區塊 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16 space-y-4"
        >
          {faqItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <FAQAccordionItem
                item={item}
                isOpen={openItems.has(item.id)}
                onToggle={() => toggleItem(item.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* 讀者諮詢表單 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="p-6 sm:p-8 border-b-2 border-black bg-paper-dark">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 border-2 border-black bg-white">
                <MessageCircle className="w-5 h-5 text-black" strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-black">
                讀者諮詢
              </h2>
            </div>
            <p className="text-sm text-ink-muted">
              還有其他疑問？請填寫以下表單，我們將盡快回覆您。
            </p>
          </div>

          {isSuccess ? (
            <div className="p-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="p-3 border-2 border-black bg-black text-paper rounded-full">
                  <CheckCircle className="w-8 h-8" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="font-serif text-2xl font-bold text-black mb-2">
                諮詢已送出！
              </h3>
              <p className="text-ink-muted mb-6">
                我們將盡快回覆您的問題。
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="btn-editorial-outline"
              >
                <span>送出另一個諮詢</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* 姓名 */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium uppercase tracking-wider text-black mb-3"
                >
                  姓名
                </label>
                <input
                  type="text"
                  id="name"
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
                  htmlFor="email"
                  className="block text-sm font-medium uppercase tracking-wider text-black mb-3"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 bg-paper border-2 border-black text-black placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-black text-base"
                />
              </div>

              {/* 疑問內容 */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium uppercase tracking-wider text-black mb-3"
                >
                  疑問內容
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="請描述您的疑問..."
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
                    <>
                      <span>提交中...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" strokeWidth={1.5} />
                      <span>送出諮詢</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </main>
  )
}
