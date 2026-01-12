'use client'

import { useState } from 'react'
import { 
  Send, 
  CheckCircle, 
  User, 
  Building, 
  MessageSquare,
  Quote,
  PenTool
} from 'lucide-react'

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    school_title: '',
    content: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // 驗證
    if (!formData.name.trim() || !formData.content.trim()) {
      setError('請填寫姓名與回饋內容')
      setIsSubmitting(false)
      return
    }

    try {
      // 提交到 Notion API
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          schoolTitle: formData.school_title.trim() || '',
          content: formData.content.trim(),
          isApproved: false,
          isFeatured: false,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        console.error('提交回饋錯誤:', result.error)
        setError('提交失敗，請稍後再試')
        setIsSubmitting(false)
        return
      }

      setIsSubmitted(true)
    } catch (err) {
      console.error('提交回饋錯誤:', err)
      setError('提交失敗，請稍後再試')
    }
    setIsSubmitting(false)
  }

  // 已提交成功畫面
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-paper py-16 px-4">
        <div className="max-w-xl mx-auto">
          {/* 成功卡片 */}
          <div className="border-2 border-black bg-paper shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
            {/* 郵戳裝飾 */}
            <div className="inline-flex items-center justify-center w-20 h-20 border-4 border-black rounded-full mb-6 relative">
              <CheckCircle className="w-10 h-10 text-black" strokeWidth={1.5} />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-black" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
            </div>

            <h2 className="font-serif text-3xl font-bold text-black mb-4">
              感謝您的投書！
            </h2>
            
            <div className="border-t-2 border-b-2 border-black py-4 my-6">
              <p className="text-ink-muted leading-relaxed">
                您的回饋已成功送出。<br />
                經審核通過後，將刊登於首頁「校園真實聲音」專區。
              </p>
            </div>

            <p className="text-sm text-ink-muted uppercase tracking-wider mb-6">
              RECEIVED & RECORDED
            </p>

            <a
              href="/"
              className="btn-editorial inline-flex"
            >
              <span>返回首頁</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 頁面標題 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black mb-6">
            <PenTool className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm uppercase tracking-wider">Reader&apos;s Voice</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-black mb-4">
            讀者投書
          </h1>
          <p className="text-ink-muted max-w-md mx-auto">
            分享您參與講座後的心得與回饋，<br />
            讓更多人聽見校園的真實聲音。
          </p>
        </div>

        {/* 投書表單卡片 */}
        <div className="border-2 border-black bg-paper shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
          {/* 郵票裝飾 */}
          <div className="absolute -top-3 -right-3 w-16 h-20 border-2 border-black bg-paper flex flex-col items-center justify-center" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)', backgroundSize: '100% 8px', backgroundPosition: '0 0' }}>
            <Quote className="w-6 h-6 text-black" strokeWidth={1.5} />
            <span className="text-[8px] uppercase tracking-wider mt-1 bg-paper px-1">VOICE</span>
          </div>

          {/* 表單頭部 */}
          <div className="border-b-2 border-black px-6 py-4 bg-paper-dark">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
              <div>
                <h2 className="font-serif font-bold text-lg text-black">讀者回函卡</h2>
                <p className="text-xs text-ink-muted uppercase tracking-wider">Feedback Form</p>
              </div>
            </div>
          </div>

          {/* 表單內容 */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 姓名欄位 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                <User className="w-4 h-4" strokeWidth={1.5} />
                <span>您的姓名</span>
                <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="請輸入您的姓名"
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-black focus:ring-0 focus:border-black text-black placeholder:text-ink-muted/50 font-medium"
                required
              />
            </div>

            {/* 學校/職稱欄位 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                <Building className="w-4 h-4" strokeWidth={1.5} />
                <span>學校 / 職稱</span>
                <span className="text-ink-muted text-xs normal-case">(選填)</span>
              </label>
              <input
                type="text"
                value={formData.school_title}
                onChange={(e) => setFormData(prev => ({ ...prev, school_title: e.target.value }))}
                placeholder="例：台北市立某國中 教務主任"
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-black/50 focus:ring-0 focus:border-black text-black placeholder:text-ink-muted/50"
              />
            </div>

            {/* 回饋內容 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                <Quote className="w-4 h-4" strokeWidth={1.5} />
                <span>回饋內容</span>
                <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="請分享您參與講座的心得、對講師的評價，或對活動的建議..."
                  rows={6}
                  className="w-full p-4 bg-paper border-2 border-black focus:ring-0 focus:border-black text-black placeholder:text-ink-muted/50 resize-none"
                  required
                />
                {/* 引號裝飾 */}
                <div className="absolute -top-3 -left-3 text-6xl font-serif text-black/10 select-none">"</div>
                <div className="absolute -bottom-3 -right-3 text-6xl font-serif text-black/10 select-none rotate-180">"</div>
              </div>
              <p className="text-xs text-ink-muted mt-2 text-right">
                {formData.content.length} / 500 字
              </p>
            </div>

            {/* 錯誤訊息 */}
            {error && (
              <div className="p-4 border-2 border-red-600 bg-red-50 text-red-800 text-sm">
                {error}
              </div>
            )}

            {/* 提交按鈕 */}
            <div className="pt-4 border-t-2 border-black/20">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-editorial justify-center py-4"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-paper border-t-transparent"></div>
                    <span>投遞中...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                    <span>投遞回函</span>
                  </>
                )}
              </button>

              <p className="text-xs text-ink-muted text-center mt-4">
                提交後，您的回饋將經由審核後刊登於首頁
              </p>
            </div>
          </form>

          {/* 底部裝飾 */}
          <div className="border-t-2 border-dashed border-black/30 px-6 py-3 bg-paper-dark flex items-center justify-between text-xs text-ink-muted uppercase tracking-wider">
            <span>Campus Lecture Program</span>
            <span>讓教育更有溫度</span>
          </div>
        </div>
      </div>
    </div>
  )
}
