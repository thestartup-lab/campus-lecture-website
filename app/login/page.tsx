'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, Clock, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'pending' | 'registered'>('idle')
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      if (isLogin) {
        // 登入
        const { error, needsApproval } = await signIn(email, password)
        if (error) {
          if (needsApproval) {
            setStatus('pending')
            setMessage('您的帳號尚未通過審核，請等待管理員核准後再登入。')
          } else if (error.message.includes('Invalid login credentials')) {
            setStatus('error')
            setMessage('電子郵件或密碼錯誤')
          } else {
            setStatus('error')
            setMessage(error.message)
          }
          return
        }
        router.push('/dashboard')
      } else {
        // 註冊
        if (!fullName.trim()) {
          setStatus('error')
          setMessage('請輸入您的姓名')
          return
        }
        const { error } = await signUp(email, password, fullName)
        if (error) {
          setStatus('error')
          if (error.message.includes('already registered')) {
            setMessage('此電子郵件已被註冊')
          } else {
            setMessage(error.message)
          }
          return
        }
        setStatus('registered')
        setMessage('註冊成功！')
      }
    } catch (error) {
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
            <span>校園講座計劃</span>
          </Link>
          <h2 className="mt-8 font-serif text-4xl font-bold text-black">
            {isLogin ? '講師登入' : '講師註冊'}
          </h2>
          <p className="mt-3 text-ink-muted">
            {isLogin ? '登入您的帳戶以管理講座邀約' : '建立帳戶開始接受講座邀約'}
          </p>
        </div>

        {/* Form Card */}
        <div className="card-editorial p-8">
          {/* Tab Switcher */}
          <div className="flex mb-8 border-2 border-black">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-sm font-medium uppercase tracking-wider transition-all duration-200 ${
                isLogin
                  ? 'bg-black text-paper'
                  : 'bg-paper text-black hover:bg-black/5'
              }`}
            >
              登入
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-sm font-medium uppercase tracking-wider transition-all duration-200 border-l-2 border-black ${
                !isLogin
                  ? 'bg-black text-paper'
                  : 'bg-paper text-black hover:bg-black/5'
              }`}
            >
              註冊
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name (只在註冊時顯示) */}
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  姓名
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-editorial"
                  placeholder="請輸入您的姓名"
                />
              </div>
            )}

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

            {/* Password */}
            <div>
              <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                <Lock className="w-4 h-4" strokeWidth={1.5} />
                密碼
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
                  placeholder={isLogin ? '請輸入密碼' : '至少 6 個字元'}
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

            {/* Status Messages */}
            {message && (
              <div className={`p-4 border-2 border-black text-sm ${
                status === 'error' 
                  ? 'bg-red-50 text-red-800' 
                  : status === 'pending'
                  ? 'bg-yellow-50 text-yellow-800'
                  : status === 'registered'
                  ? 'bg-paper text-black'
                  : 'bg-green-50 text-green-800'
              }`}>
                <div className="flex items-start gap-3">
                  {(status === 'pending' || status === 'registered') && (
                    <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  )}
                  <div>
                    <p className="font-medium">{message}</p>
                    {status === 'registered' && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm text-ink-muted">請完成以下步驟：</p>
                        <ol className="list-decimal list-inside text-sm space-y-2 text-black">
                          <li className="flex items-start gap-2">
                            <span className="font-medium">1.</span>
                            <span>前往您的 <strong>Email 信箱</strong>，點擊驗證連結完成認證</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-medium">2.</span>
                            <span>等待管理員審核您的申請</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-medium">3.</span>
                            <span>審核通過後即可登入系統</span>
                          </li>
                        </ol>
                        <p className="text-xs text-ink-muted mt-3">
                          💡 提示：如果沒收到驗證信，請檢查垃圾郵件資料夾
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsLogin(true)
                            setStatus('idle')
                            setMessage('')
                          }}
                          className="mt-3 text-black hover:underline font-medium"
                        >
                          返回登入
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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
                  處理中...
                </span>
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5" strokeWidth={1.5} />
                  <span>登入</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" strokeWidth={1.5} />
                  <span>註冊</span>
                </>
              )}
            </button>
          </form>

          {/* Forgot Password */}
          {isLogin && (
            <p className="mt-6 text-center text-sm text-ink-muted">
              忘記密碼？{' '}
              <button className="text-black hover:underline font-medium">
                重設密碼
              </button>
            </p>
          )}
        </div>

        {/* Back to Home */}
        <p className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-black transition-colors uppercase tracking-wider font-medium">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            返回首頁
          </Link>
        </p>
      </div>
    </div>
  )
}
