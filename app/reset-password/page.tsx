'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  
  const router = useRouter()

  // 檢查是否有有效的重設密碼 session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // 檢查 URL 中是否有 recovery token
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')
      
      if (type === 'recovery' && accessToken) {
        // 設置 session
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        })
        
        if (!error) {
          setIsValidSession(true)
        }
      } else if (session) {
        setIsValidSession(true)
      }
      
      setCheckingSession(false)
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('兩次輸入的密碼不一致')
      return
    }

    if (password.length < 6) {
      setStatus('error')
      setMessage('密碼至少需要 6 個字元')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setStatus('error')
        setMessage(error.message)
        return
      }

      setStatus('success')
      setMessage('密碼已成功更新！')
      
      // 3 秒後跳轉到登入頁
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch {
      setStatus('error')
      setMessage('發生未知錯誤，請稍後再試')
    }
  }

  // 載入中
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-ink-muted uppercase tracking-wider text-sm">驗證中...</p>
        </div>
      </div>
    )
  }

  // 無效的 session
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="card-editorial p-8">
            <div className="w-16 h-16 mx-auto mb-6 border-2 border-black flex items-center justify-center">
              <Lock className="w-8 h-8 text-black" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-black mb-4">
              連結已失效
            </h2>
            <p className="text-ink-muted mb-6">
              此密碼重設連結已過期或無效。請重新申請密碼重設。
            </p>
            <Link href="/forgot-password" className="btn-editorial inline-flex">
              <span>重新申請</span>
            </Link>
          </div>
          <p className="mt-8">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-black transition-colors uppercase tracking-wider font-medium">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              返回登入
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-3 text-black font-bold text-2xl font-serif">
            <span className="text-3xl">📰</span>
            <span>校園講座計劃</span>
          </Link>
          <h2 className="mt-8 font-serif text-4xl font-bold text-black">
            重設密碼
          </h2>
          <p className="mt-3 text-ink-muted">
            請輸入您的新密碼
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
                密碼已更新！
              </h3>
              <p className="text-ink-muted mb-6">
                您的密碼已成功更新。<br />
                即將跳轉至登入頁面...
              </p>
              <Link href="/login" className="btn-editorial inline-flex">
                <span>立即登入</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                  <Lock className="w-4 h-4" strokeWidth={1.5} />
                  新密碼
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input-editorial pr-12"
                    placeholder="至少 6 個字元"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                  <Lock className="w-4 h-4" strokeWidth={1.5} />
                  確認新密碼
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input-editorial pr-12"
                    placeholder="再次輸入新密碼"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-black transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
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
                    更新中...
                  </span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" strokeWidth={1.5} />
                    <span>更新密碼</span>
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
