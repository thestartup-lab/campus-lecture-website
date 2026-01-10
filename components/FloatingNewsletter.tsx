'use client'

import { Mail, Send, X, ChevronDown, Check, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function FloatingNewsletter() {
  const [email, setEmail] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
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
        setIsMinimized(true)
        setIsExpanded(false)
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

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[60]">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-black text-paper px-4 py-3 border-2 border-black shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-hard-lg transition-all"
        >
          <Mail className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm font-medium uppercase tracking-wider">Subscribe</span>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] w-80">
      {/* 浮動卡片 */}
      <div className="bg-black text-paper border-2 border-black shadow-hard">
        {/* 標題列 */}
        <div 
          className="flex items-center justify-between p-4 cursor-pointer border-b border-paper/20"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5" strokeWidth={1.5} />
            <div>
              <h3 className="font-serif text-lg font-bold">電子報</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="p-1 hover:bg-paper/10 transition-colors"
            >
              <ChevronDown 
                className={`w-5 h-5 transition-transform duration-300 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                strokeWidth={1.5}
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsMinimized(true)
                setIsExpanded(false)
              }}
              className="p-1 hover:bg-paper/10 transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* 展開內容 */}
        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4">
            <p className="text-sm text-paper/70 mb-4">
              訂閱以獲取最新講座資訊
            </p>

            {/* 表單 */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={status === 'loading'}
                className="w-full px-4 py-3 bg-paper text-black border-2 border-paper text-sm placeholder:text-ink-muted focus:outline-none disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-4 py-3 bg-paper text-black border-2 border-paper font-medium uppercase tracking-wider text-sm hover:bg-transparent hover:text-paper transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                <div className="p-3 border border-paper/30 flex items-center justify-center gap-2 text-sm animate-[slideIn_0.3s_ease-out]">
                  <Check className="w-4 h-4" strokeWidth={1.5} />
                  <span>{message}</span>
                </div>
              )}

              {status === 'error' && message && (
                <div className="p-3 border border-paper/30 flex items-center justify-center gap-2 text-sm animate-[shake_0.3s_ease-in-out]">
                  <AlertCircle className="w-4 h-4" strokeWidth={1.5} />
                  <span>{message}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
