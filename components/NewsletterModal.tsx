'use client'

import { Mail, Send, X, Check, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function NewsletterModal() {
  const [email, setEmail] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const pathname = usePathname()

  // 監聽 URL hash 變化
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#newsletter') {
        setIsOpen(true)
        // 清除 hash，避免重複觸發
        window.history.replaceState(null, '', pathname)
      }
    }

    // 初始檢查
    checkHash()

    // 監聽 hashchange 事件
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [pathname])

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
      setMessage('訂閱成功！歡迎信已寄出')
      setEmail('')
      
      setTimeout(() => {
        setIsOpen(false)
        setStatus('idle')
        setMessage('')
      }, 2000)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* 彈窗內容 */}
      <div 
        className="relative w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        style={{
          animation: 'modalSlideIn 0.3s ease-out'
        }}
      >
        {/* 關閉按鈕 */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-black hover:text-white transition-colors border-2 border-black"
          aria-label="關閉"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* 標題區 */}
        <div className="p-8 pb-6 border-b-4 border-black text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white mb-6">
            <Mail className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-black text-black mb-3">
            訂閱電子報
          </h2>
          <p className="text-black/60">
            獲取最新講座資訊與教育觀點
          </p>
        </div>

        {/* 表單區 */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newsletter-email" className="block text-xs uppercase tracking-widest font-bold text-black mb-2">
                電子郵件
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={status === 'loading'}
                className="w-full px-4 py-4 bg-white text-black border-3 border-black text-base placeholder:text-black/40 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow disabled:opacity-50"
                style={{ borderWidth: '3px' }}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-6 py-4 bg-black text-white border-3 border-black font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors disabled:opacity-50 flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              style={{ borderWidth: '3px' }}
            >
              {status === 'loading' ? (
                <span className="animate-pulse">訂閱中...</span>
              ) : (
                <>
                  <span>立即訂閱</span>
                  <Send className="w-5 h-5" strokeWidth={2} />
                </>
              )}
            </button>

            {/* 狀態訊息 */}
            {status === 'success' && message && (
              <div className="p-4 border-3 border-black bg-black text-white flex items-center justify-center gap-3 text-sm font-medium" style={{ borderWidth: '3px' }}>
                <Check className="w-5 h-5" strokeWidth={2} />
                <span>{message}</span>
              </div>
            )}

            {status === 'error' && message && (
              <div className="p-4 border-3 border-black bg-white text-black flex items-center justify-center gap-3 text-sm font-medium" style={{ borderWidth: '3px' }}>
                <AlertCircle className="w-5 h-5" strokeWidth={2} />
                <span>{message}</span>
              </div>
            )}
          </form>

          <p className="text-xs text-black/40 mt-6 text-center uppercase tracking-wider">
            我們重視您的隱私，不會分享您的資訊
          </p>
        </div>
      </div>

      {/* 動畫樣式 */}
      <style jsx global>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
