'use client'

import { useState } from 'react'
import { Calendar, Mail, Phone, User, School, MessageSquare, Send, CheckCircle, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function InvitationPage() {
  const [formData, setFormData] = useState({
    school_name: '',
    contact_person: '',
    phone: '',
    email: '',
    date: '',
    topic: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      // 處理空的日期欄位，將空字串轉為 null
      const submitData = {
        ...formData,
        date: formData.date || null
      }

      const { data, error, status, statusText } = await supabase
        .from('applications')
        .insert([submitData])
        .select()

      console.log('Supabase 回應:', { data, error, status, statusText })

      if (error) {
        setStatus('error')
        const errorMsg = error.message || error.code || JSON.stringify(error) || '未知錯誤'
        setMessage(`提交失敗：${errorMsg}`)
        console.error('提交錯誤詳情:', JSON.stringify(error, null, 2))
        
        setTimeout(() => {
          setStatus('idle')
          setMessage('')
        }, 8000)
        return
      }

      setStatus('success')
      setMessage('感謝您的申請！我們會盡快與您聯繫。')
      
      // 清空表單
      setFormData({
        school_name: '',
        contact_person: '',
        phone: '',
        email: '',
        date: '',
        topic: '',
      })

      // 5秒後清除成功訊息
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    } catch (error) {
      console.error('提交錯誤:', error)
      setStatus('error')
      setMessage('提交失敗，請稍後再試。')
      
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Hero */}
      <section className="py-24 border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <span className="text-sm uppercase tracking-wider text-ink-muted mb-4 block">
            Lecture Invitation
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-black mb-8">
            講座邀約申請
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl leading-relaxed">
            歡迎申請校園講座，讓我們一起為學生帶來精彩的學習體驗
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="card-editorial p-8 sm:p-12">
            {status === 'success' ? (
              // 成功訊息
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-black mb-6">
                  <CheckCircle className="w-12 h-12 text-black" strokeWidth={1.5} />
                </div>
                <h2 className="font-serif text-3xl font-bold text-black mb-4">
                  申請已送出！
                </h2>
                <p className="text-lg text-ink-muted mb-8">
                  {message}
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="btn-editorial"
                >
                  <span>繼續申請其他講座</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              // 申請表單
              <>
                <div className="mb-10">
                  <h2 className="font-serif text-2xl font-bold text-black mb-2">
                    填寫申請資訊
                  </h2>
                  <p className="text-ink-muted">
                    請填寫以下資訊，我們將盡快與您聯繫確認講座細節
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* 學校名稱 */}
                  <div>
                    <label htmlFor="school_name" className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                      <School className="w-4 h-4" strokeWidth={1.5} />
                      學校名稱 <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="school_name"
                      name="school_name"
                      value={formData.school_name}
                      onChange={handleChange}
                      required
                      className="input-editorial"
                      placeholder="例：台北市立某某高中"
                    />
                  </div>

                  {/* 聯絡人 */}
                  <div>
                    <label htmlFor="contact_person" className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                      <User className="w-4 h-4" strokeWidth={1.5} />
                      聯絡人姓名 <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact_person"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleChange}
                      required
                      className="input-editorial"
                      placeholder="請輸入您的姓名"
                    />
                  </div>

                  {/* 聯絡電話 & Email */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                        <Phone className="w-4 h-4" strokeWidth={1.5} />
                        聯絡電話
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-editorial"
                        placeholder="0912-345-678"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                        <Mail className="w-4 h-4" strokeWidth={1.5} />
                        電子郵件 <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input-editorial"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  {/* 希望日期 */}
                  <div>
                    <label htmlFor="date" className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                      <Calendar className="w-4 h-4" strokeWidth={1.5} />
                      希望講座日期
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="input-editorial"
                    />
                  </div>

                  {/* 講座主題 */}
                  <div>
                    <label htmlFor="topic" className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                      <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                      講座主題或需求說明 <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="topic"
                      name="topic"
                      value={formData.topic}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="input-editorial resize-none"
                      placeholder="請描述您希望的講座主題、預期參與人數、時間長度等資訊..."
                    />
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
                        <span className="animate-pulse">提交中</span>
                        <span className="flex space-x-1 ml-2">
                          <span className="w-2 h-2 bg-paper rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-paper rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-paper rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span>提交申請</span>
                        <Send className="w-5 h-5" strokeWidth={1.5} />
                      </>
                    )}
                  </button>

                  <p className="text-sm text-ink-muted text-center">
                    提交後，我們將在 3 個工作日內與您聯繫
                  </p>
                </form>
              </>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="card-editorial p-6">
              <div className="w-12 h-12 border-2 border-black flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-black" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-bold text-black text-lg mb-2">免費申請</h3>
              <p className="text-sm text-ink-muted">
                所有講座申請完全免費，無任何隱藏費用
              </p>
            </div>

            <div className="card-editorial p-6">
              <div className="w-12 h-12 border-2 border-black flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-black" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-bold text-black text-lg mb-2">專業講師</h3>
              <p className="text-sm text-ink-muted">
                超過 500 位專業講師，涵蓋各領域專業知識
              </p>
            </div>

            <div className="card-editorial p-6">
              <div className="w-12 h-12 border-2 border-black flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-black" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-bold text-black text-lg mb-2">彈性安排</h3>
              <p className="text-sm text-ink-muted">
                根據您的需求彈性安排講座時間與內容
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
