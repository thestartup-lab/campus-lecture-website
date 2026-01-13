'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'

export default function LecturePlanningPage() {
  const [formData, setFormData] = useState({
    audience: '',
    painPoints: '',
    budget: '',
    contactEmail: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/lecture-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        setFormData({
          audience: '',
          painPoints: '',
          budget: '',
          contactEmail: '',
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

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-paper">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
          <div className="border-2 border-black p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="p-4 border-2 border-black bg-black text-paper rounded-full">
                <CheckCircle className="w-12 h-12" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-black mb-4">
              需求已送出！
            </h2>
            <p className="text-lg text-ink-muted leading-relaxed mb-8">
              專屬方案正在產出中，請留意您的信箱。
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="btn-editorial-outline"
            >
              <span>提交另一個需求</span>
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        {/* 標題區 */}
        <div className="mb-12 border-b-2 border-black pb-8">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
            客製化講座提案
          </h1>
          <p className="text-lg sm:text-xl text-ink-muted font-light leading-relaxed">
            每一場校園風景都不同，我們提供量身打造的講座設計。請告訴我們以下資訊，我們將在 3 個工作日內回覆專屬的講座設計方案。
          </p>
        </div>

        {/* 表單 */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 對象與人數 */}
          <div>
            <label
              htmlFor="audience"
              className="block text-sm font-medium uppercase tracking-wider text-black mb-3"
            >
              對象與人數
            </label>
            <input
              type="text"
              id="audience"
              name="audience"
              value={formData.audience}
              onChange={handleChange}
              required
              placeholder="例如：高一學生，約 500 人"
              className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-black text-black placeholder-ink-muted focus:outline-none focus:border-black text-base sm:text-lg"
            />
          </div>

          {/* 核心痛點或需求 */}
          <div>
            <label
              htmlFor="painPoints"
              className="block text-sm font-medium uppercase tracking-wider text-black mb-3"
            >
              核心痛點或需求
            </label>
            <textarea
              id="painPoints"
              name="painPoints"
              value={formData.painPoints}
              onChange={handleChange}
              required
              rows={4}
              placeholder="例如：學生對未來感到迷惘、希望提升簡報表達力"
              className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-black text-black placeholder-ink-muted focus:outline-none focus:border-black resize-none text-base sm:text-lg"
            />
          </div>

          {/* 經費預算與時數限制 */}
          <div>
            <label
              htmlFor="budget"
              className="block text-sm font-medium uppercase tracking-wider text-black mb-3"
            >
              經費預算與時數限制
            </label>
            <input
              type="text"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
              placeholder="例如：可提供多少小時鐘點費，以及其他可申報費用預算估計"
              className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-black text-black placeholder-ink-muted focus:outline-none focus:border-black text-base sm:text-lg"
            />
          </div>

          {/* 聯絡 Email */}
          <div>
            <label
              htmlFor="contactEmail"
              className="block text-sm font-medium uppercase tracking-wider text-black mb-3"
            >
              聯絡 Email
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
              className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-black text-black placeholder-ink-muted focus:outline-none focus:border-black text-base sm:text-lg"
            />
          </div>

          {/* 提交按鈕 */}
          <div className="pt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-12 py-6 bg-black text-paper font-serif text-xl sm:text-2xl font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <span>處理中...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                  <span>獲取客製化方案</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
