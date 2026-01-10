'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  Send, 
  CheckCircle, 
  ArrowLeft,
  Plus,
  X,
  BookOpen
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    title: '',
    bio: '',
    expertise: [] as string[],
    experience: '',
    motivation: '',
  })
  const [newExpertise, setNewExpertise] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addExpertise = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }))
      setNewExpertise('')
    }
  }

  const removeExpertise = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(s => s !== skill)
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addExpertise()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    // 驗證
    if (!formData.full_name || !formData.email || !formData.password) {
      setStatus('error')
      setMessage('請填寫所有必填欄位')
      return
    }

    if (formData.password.length < 6) {
      setStatus('error')
      setMessage('密碼至少需要 6 個字元')
      return
    }

    if (formData.expertise.length === 0) {
      setStatus('error')
      setMessage('請至少新增一項專長領域')
      return
    }

    try {
      // 1. 註冊用戶
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
          }
        }
      })

      if (authError) {
        setStatus('error')
        if (authError.message.includes('already registered')) {
          setMessage('此電子郵件已被註冊，請使用其他郵件或直接登入')
        } else {
          setMessage(authError.message)
        }
        return
      }

      if (!authData.user) {
        setStatus('error')
        setMessage('註冊失敗，請稍後再試')
        return
      }

      // 2. 更新 profile 資料
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          display_name: formData.full_name,
          phone: formData.phone || null,
          title: formData.title || null,
          bio: formData.bio || null,
          bio_long: formData.motivation || null,
          expertise: formData.expertise,
          role: 'instructor',
          is_approved: false,
          is_public: false,
        })
        .eq('id', authData.user.id)

      if (profileError) {
        console.error('更新 profile 錯誤:', profileError)
        // 即使 profile 更新失敗，帳號已創建成功
      }

      // 3. 登出（因為需要審核才能登入）
      await supabase.auth.signOut()

      setStatus('success')
      setMessage('您的講師申請已成功送出！我們將在審核完成後通知您。')

    } catch (error) {
      console.error('申請錯誤:', error)
      setStatus('error')
      setMessage('申請過程中發生錯誤，請稍後再試')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="card-editorial p-12">
            <div className="w-20 h-20 border-2 border-black mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-black" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif text-3xl font-bold text-black mb-4">
              申請已送出！
            </h2>
            <p className="text-ink-muted mb-8 leading-relaxed">
              感謝您申請成為講師！<br />
              我們將審核您的資料，並在 3-5 個工作日內以 Email 通知審核結果。
            </p>
            <Link href="/" className="btn-editorial">
              <span>返回首頁</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Hero */}
      <section className="py-24 border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <span className="text-sm uppercase tracking-wider text-ink-muted mb-4 block">
            Become a Lecturer
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-black mb-8">
            申請成為講師
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl leading-relaxed">
            加入我們的講師團隊，分享您的專業知識，為校園帶來啟發性的學習體驗
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="card-editorial p-8 sm:p-12">
            <div className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-black mb-2">
                填寫申請資料
              </h2>
              <p className="text-ink-muted">
                請詳細填寫以下資訊，我們將根據您的背景進行審核
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 基本資訊 */}
              <div className="space-y-6">
                <h3 className="font-serif text-lg font-bold text-black border-b-2 border-black pb-2">
                  基本資訊
                </h3>

                {/* 姓名 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                    <User className="w-4 h-4" strokeWidth={1.5} />
                    姓名 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="input-editorial"
                    placeholder="請輸入您的真實姓名"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                    電子郵件 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-editorial"
                    placeholder="your@email.com"
                  />
                  <p className="text-xs text-ink-muted mt-2">此 Email 將作為您的登入帳號</p>
                </div>

                {/* 密碼 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                    <span className="w-4 h-4 flex items-center justify-center">🔒</span>
                    密碼 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="input-editorial"
                    placeholder="至少 6 個字元"
                  />
                </div>

                {/* 電話 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                    <Phone className="w-4 h-4" strokeWidth={1.5} />
                    聯絡電話
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-editorial"
                    placeholder="0912-345-678"
                  />
                </div>
              </div>

              {/* 專業背景 */}
              <div className="space-y-6">
                <h3 className="font-serif text-lg font-bold text-black border-b-2 border-black pb-2">
                  專業背景
                </h3>

                {/* 職稱/頭銜 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                    <Briefcase className="w-4 h-4" strokeWidth={1.5} />
                    職稱/頭銜 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="input-editorial"
                    placeholder="例：資深教育顧問、大學教授、企業講師"
                  />
                </div>

                {/* 專長領域 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                    <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                    專長領域 <span className="text-red-600">*</span>
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="input-editorial flex-1"
                      placeholder="輸入專長後按 Enter 或點擊新增"
                    />
                    <button
                      type="button"
                      onClick={addExpertise}
                      className="btn-editorial-outline px-4"
                    >
                      <Plus className="w-4 h-4" strokeWidth={1.5} />
                      <span>新增</span>
                    </button>
                  </div>
                  {formData.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-black text-paper text-sm border-2 border-black"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeExpertise(skill)}
                            className="hover:text-red-300 transition-colors"
                          >
                            <X className="w-3 h-3" strokeWidth={2} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-ink-muted mt-2">建議新增 3-5 項專長</p>
                </div>

                {/* 簡短自我介紹 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                    <FileText className="w-4 h-4" strokeWidth={1.5} />
                    簡短自我介紹 <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="input-editorial resize-none"
                    placeholder="請用 2-3 句話簡單介紹自己（將顯示在講師列表）"
                  />
                </div>

                {/* 經歷描述 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                    <Briefcase className="w-4 h-4" strokeWidth={1.5} />
                    相關經歷
                  </label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    rows={4}
                    className="input-editorial resize-none"
                    placeholder="請描述您的教學經歷、演講經驗或相關工作背景"
                  />
                </div>

                {/* 申請動機 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                    <FileText className="w-4 h-4" strokeWidth={1.5} />
                    申請動機
                  </label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleChange}
                    rows={4}
                    className="input-editorial resize-none"
                    placeholder="為什麼想成為講師？希望為學生帶來什麼樣的學習體驗？"
                  />
                </div>
              </div>

              {/* 錯誤訊息 */}
              {status === 'error' && (
                <div className="p-4 border-2 border-black bg-red-50 text-red-800">
                  {message}
                </div>
              )}

              {/* 提交按鈕 */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-editorial w-full justify-center py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <>
                    <span className="animate-pulse">提交申請中</span>
                    <span className="flex space-x-1 ml-2">
                      <span className="w-2 h-2 bg-paper rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-paper rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-paper rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                  </>
                ) : (
                  <>
                    <span>送出申請</span>
                    <Send className="w-5 h-5" strokeWidth={1.5} />
                  </>
                )}
              </button>

              <p className="text-sm text-ink-muted text-center">
                提交後，我們將在 3-5 個工作日內審核您的申請
              </p>
            </form>
          </div>

          {/* Already have account */}
          <p className="mt-8 text-center">
            <span className="text-ink-muted">已經有帳號了？</span>
            <Link href="/login" className="ml-2 text-black hover:underline font-medium">
              立即登入
            </Link>
          </p>

          {/* Back to Home */}
          <p className="mt-4 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-black transition-colors uppercase tracking-wider font-medium">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              返回首頁
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
