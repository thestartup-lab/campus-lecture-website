'use client'

import { Mail, Send, Check, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const { supabase } = await import('@/lib/supabase')
      
      // 先檢查 Email 是否已存在
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (existing) {
        setStatus('error')
        setMessage('您已訂閱過囉！感謝您的支持')
        
        setTimeout(() => {
          setStatus('idle')
          setMessage('')
        }, 3000)
        return
      }
      
      // 新增訂閱
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: email.toLowerCase().trim() }])

      if (error) {
        if (error.code === '23505') {
          setStatus('error')
          setMessage('您已訂閱過囉！感謝您的支持')
        } else {
          setStatus('error')
          setMessage('訂閱失敗，請稍後再試')
        }
        
        setTimeout(() => {
          setStatus('idle')
          setMessage('')
        }, 3000)
        return
      }

      // 發送歡迎信
      const subscribedEmail = email.toLowerCase().trim()
      fetch('/api/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscribedEmail }),
      }).catch(err => console.error('發送歡迎信失敗:', err))

      setStatus('success')
      setMessage('訂閱成功！歡迎信已寄出')
      setEmail('')
      
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch (error) {
      console.error('訂閱錯誤:', error)
      setStatus('error')
      setMessage('訂閱失敗，請稍後再試')
      
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    }
  }

  return (
    <section className="py-24 bg-black text-paper">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-paper mb-8">
            <Mail className="w-7 h-7" strokeWidth={1.5} />
          </div>

          {/* Title */}
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-6">
            訂閱電子報
          </h2>

          {/* Description */}
          <p className="text-paper/70 mb-10 leading-relaxed">
            獲取最新的講座資訊、教育觀點與活動通知
            <br />
            讓我們一起為教育注入更多可能
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={status === 'loading'}
                className="flex-1 px-5 py-4 bg-paper text-black border-2 border-paper placeholder:text-ink-muted focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-4 bg-paper text-black border-2 border-paper font-medium uppercase tracking-wider text-sm hover:bg-transparent hover:text-paper transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                {status === 'loading' ? (
                  <span className="animate-pulse">訂閱中...</span>
                ) : (
                  <>
                    <span>訂閱</span>
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                  </>
                )}
              </button>
            </div>

            {/* Status Messages */}
            {status === 'success' && message && (
              <div className="mt-4 p-4 border-2 border-paper/30 flex items-center justify-center gap-2 animate-[slideIn_0.3s_ease-out]">
                <Check className="w-5 h-5" strokeWidth={1.5} />
                <span>{message}</span>
              </div>
            )}

            {status === 'error' && message && (
              <div className="mt-4 p-4 border-2 border-paper/30 flex items-center justify-center gap-2 animate-[shake_0.3s_ease-in-out]">
                <AlertCircle className="w-5 h-5" strokeWidth={1.5} />
                <span>{message}</span>
              </div>
            )}
          </form>

          {/* Privacy Note */}
          <p className="text-xs text-paper/50 mt-8 uppercase tracking-wider">
            我們重視您的隱私，不會與第三方分享您的資訊
          </p>
        </div>
      </div>
    </section>
  )
}
