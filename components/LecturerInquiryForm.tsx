'use client'

import { useState } from 'react'
import { Send, CheckCircle, Mail } from 'lucide-react'

interface LecturerInquiryFormProps {
  lecturerId: string
  lecturerName: string
}

export default function LecturerInquiryForm({ lecturerId, lecturerName }: LecturerInquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    content: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/faq-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          target_lecturer_id: lecturerId,
          // 將 subject 和 content 合併為 content
          content: formData.subject ? `【${formData.subject}】\n\n${formData.content}` : formData.content,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        setFormData({
          name: '',
          email: '',
          subject: '',
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

  if (isSuccess) {
    return (
      <div className="border-2 border-black bg-white p-8 sm:p-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 border-2 border-black bg-black text-paper rounded-full">
            <CheckCircle className="w-12 h-12" strokeWidth={1.5} />
          </div>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-4">
          您的訊息已封裝並寄給 {lecturerName}
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
    )
  }

  return (
    <div className="relative border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* 郵票圖示（右上角） */}
      <div className="absolute -top-4 -right-4 z-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-black bg-paper rotate-12 flex items-center justify-center">
          <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-black" strokeWidth={1.5} />
        </div>
      </div>

      <div className="p-6 sm:p-8 pt-12 sm:pt-16">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-black mb-2">
          給導師的一封信
        </h2>
        <p className="text-sm text-ink-muted mb-6">
          填寫下方資訊，我們會將您的訊息轉達給 {lecturerName}
        </p>

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

          {/* 諮詢主題 */}
          <div>
            <label
              htmlFor="inquiry-subject"
              className="block text-sm font-medium uppercase tracking-wider text-black mb-2"
            >
              諮詢主題
            </label>
            <input
              type="text"
              id="inquiry-subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="例如：講座邀約、教學諮詢..."
              className="w-full px-4 py-3 bg-paper border-2 border-black text-black placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-black text-base"
            />
          </div>

          {/* 留言內容 */}
          <div>
            <label
              htmlFor="inquiry-content"
              className="block text-sm font-medium uppercase tracking-wider text-black mb-2"
            >
              留言內容
            </label>
            <textarea
              id="inquiry-content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={6}
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
                <>
                  <span>寄送中...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                  <span>寄出這封信</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
