'use client'

import { Mail, Send, X, Check, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function FloatingNewsletter() {
  const [email, setEmail] = useState('')
  const [isOpen, setIsOpen] = useState(true)
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
        setMessage('您已訂閱過囉！')
        
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
          setMessage('您已訂閱過囉！')
        } else {
          setStatus('error')
          setMessage('訂閱失敗')
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
      setMessage('訂閱成功！')
      setEmail('')
      
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
        setIsOpen(false)
      }, 3000)
    } catch (error) {
      console.error('訂閱錯誤:', error)
      setStatus('error')
      setMessage('訂閱失敗')
      
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    }
  }

  // 最小化狀態 - 只顯示按鈕
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-5 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
        >
          <Mail className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm font-bold uppercase tracking-wider">訂閱電子報</span>
        </button>
      </div>
    )
  }

  // 展開狀態 - 顯示完整表單
  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-80">
      <div className="bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5" strokeWidth={1.5} />
            <h3 className="font-serif text-lg font-bold">訂閱電子報</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 transition-colors rounded cursor-pointer"
            aria-label="關閉"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* 表單內容 */}
        <div className="p-4">
          <p className="text-sm text-white/70 mb-4">
            訂閱以獲取最新講座資訊與教育觀點
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={status === 'loading'}
              className="w-full px-4 py-3 bg-white text-black border-2 border-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-4 py-3 bg-white text-black border-2 border-white font-bold uppercase tracking-wider text-sm hover:bg-transparent hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {status === 'loading' ? (
                <span className="animate-pulse">訂閱中...</span>
              ) : (
                <>
                  <span>立即訂閱</span>
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                </>
              )}
            </button>

            {/* 狀態訊息 */}
            {status === 'success' && message && (
              <div className="p-3 border border-white/30 flex items-center justify-center gap-2 text-sm bg-white/10">
                <Check className="w-4 h-4" strokeWidth={1.5} />
                <span>{message}</span>
              </div>
            )}

            {status === 'error' && message && (
              <div className="p-3 border border-white/30 flex items-center justify-center gap-2 text-sm bg-white/10">
                <AlertCircle className="w-4 h-4" strokeWidth={1.5} />
                <span>{message}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
