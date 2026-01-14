'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setStatus('error')
        setMessage(error.message)
        return
      }

      setStatus('success')
      setMessage('密碼重設郵件已發送！請檢查您的信箱。')
    } catch {
      setStatus('error')
      setMessage('發生未知錯誤，請稍後再試')
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-3 text-black font-bold text-2xl font-serif">
            <span className="text-3xl">📰</span>
            <span>生命應該是這樣的</span>
          </Link>
          <h2 className="mt-8 font-serif text-4xl font-bold text-black">
            忘記密碼
          </h2>
          <p className="mt-3 text-ink-muted">
            輸入您的電子郵件，我們將發送密碼重設連結
          </p>
        </div>

        {/* Form Card */}
        <div className="card-editorial p-8">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 border-2 border-black bg-black flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-paper" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl font-bold text-black mb-4">
                郵件已發送！
              </h3>
              <p className="text-ink-muted mb-6">
                請檢查您的信箱 <strong className="text-black">{email}</strong>，
                點擊郵件中的連結重設密碼。
              </p>
              <p className="text-xs text-ink-muted mb-6">
                💡 如果沒收到郵件，請檢查垃圾郵件資料夾
              </p>
              <Link href="/login" className="btn-editorial inline-flex">
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                <span>返回登入</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                  <Mail className="w-4 h-4" strokeWidth={1.5} />
                  電子郵件
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-editorial"
                  placeholder="your@email.com"
                />
              </div>

              {/* Error Message */}
              {status === 'error' && message && (
                <div className="p-4 border-2 border-black bg-red-50 text-red-800 text-sm">
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-editorial w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    發送中...
                  </span>
                ) : (
                  <>
                    <Send className="w-5 h-5" strokeWidth={1.5} />
                    <span>發送重設連結</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Back to Login */}
        <p className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-black transition-colors uppercase tracking-wider font-medium">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            返回登入
          </Link>
        </p>
      </div>
    </div>
  )
}
