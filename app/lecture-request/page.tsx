'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Building2,
  User, 
  Mail, 
  Phone, 
  Briefcase,
  Users,
  Calendar,
  MapPin,
  MessageSquare,
  Send, 
  CheckCircle, 
  ArrowLeft,
  Mic2,
  Search
} from 'lucide-react'

// 講座類型選項
const LECTURE_TYPES = [
  '新生訓練',
  '志工訓練',
  '幹部訓練',
  '學生講座',
  '親職講座',
  '教師研習',
]

// 得知管道選項
const HOW_DID_YOU_HEAR = [
  '網站搜尋',
  '社群媒體',
  '朋友推薦',
  '學校推薦',
  '其他',
]

// 講座形式選項
const LECTURE_FORMATS = ['實體', '線上', '皆可'] as const

export default function LectureRequestPage() {
  const [formData, setFormData] = useState({
    // 學校資訊
    schoolName: '',
    // 聯絡人資訊
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactTitle: '',
    // 講座資訊
    preferredLecturer: '',
    lectureTopics: [] as string[],
    audienceType: '',
    audienceCount: '',
    // 時間與形式
    preferredDates: '',
    lectureFormat: '' as '' | '實體' | '線上' | '皆可',
    // 其他
    lectureContent: '',
    howDidYouHear: '',
  })
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleLectureTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      lectureTopics: prev.lectureTopics.includes(topic)
        ? prev.lectureTopics.filter(t => t !== topic)
        : [...prev.lectureTopics, topic]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    // 驗證必填欄位
    if (!formData.schoolName || !formData.contactName || !formData.contactEmail) {
      setStatus('error')
      setMessage('請填寫所有必填欄位')
      return
    }

    if (formData.lectureTopics.length === 0) {
      setStatus('error')
      setMessage('請至少選擇一個講座類型')
      return
    }

    if (!formData.audienceType) {
      setStatus('error')
      setMessage('請填寫聽眾類型')
      return
    }

    if (!formData.preferredDates) {
      setStatus('error')
      setMessage('請填寫希望的講座日期')
      return
    }

    if (!formData.lectureFormat) {
      setStatus('error')
      setMessage('請選擇講座形式')
      return
    }

    try {
      const response = await fetch('/api/lecture-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolName: formData.schoolName,
          contactName: formData.contactName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone || undefined,
          contactTitle: formData.contactTitle || undefined,
          preferredLecturer: formData.preferredLecturer || undefined,
          lectureTopics: formData.lectureTopics,
          audienceType: formData.audienceType,
          audienceCount: formData.audienceCount ? parseInt(formData.audienceCount) : undefined,
          preferredDates: formData.preferredDates.split(',').map(d => d.trim()),
          lectureFormat: formData.lectureFormat,
          lectureContent: formData.lectureContent || undefined,
          howDidYouHear: formData.howDidYouHear || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage(data.message)
      } else {
        throw new Error(data.error || '提交失敗')
      }
    } catch (error) {
      console.error('提交錯誤:', error)
      setStatus('error')
      setMessage(error instanceof Error ? error.message : '提交申請時發生錯誤，請稍後再試')
    }
  }

  // 成功畫面
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
              感謝您的講座申請！<br />
              我們將在 3-5 個工作日內與您聯繫，確認講座細節。
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
            Request a Lecture
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-black mb-8">
            申請講座
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl leading-relaxed">
            填寫以下表單，為您的學校預約一場啟發性的講座。我們將根據您的需求，媒合最適合的講師。
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* 學校資訊 */}
            <div className="card-editorial p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 border-2 border-black flex items-center justify-center">
                  <Building2 className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h2 className="font-serif text-2xl font-bold text-black">
                  學校資訊
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                    學校名稱 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    required
                    className="input-editorial"
                    placeholder="例：台北市立第一高級中學"
                  />
                </div>
              </div>
            </div>

            {/* 聯絡人資訊 */}
            <div className="card-editorial p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 border-2 border-black flex items-center justify-center">
                  <User className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h2 className="font-serif text-2xl font-bold text-black">
                  聯絡人資訊
                </h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                      <User className="w-4 h-4" strokeWidth={1.5} />
                      聯絡人姓名 <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      className="input-editorial"
                      placeholder="請輸入姓名"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                      <Briefcase className="w-4 h-4" strokeWidth={1.5} />
                      職稱
                    </label>
                    <input
                      type="text"
                      name="contactTitle"
                      value={formData.contactTitle}
                      onChange={handleChange}
                      className="input-editorial"
                      placeholder="例：教務主任"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                      <Mail className="w-4 h-4" strokeWidth={1.5} />
                      電子郵件 <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      required
                      className="input-editorial"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                      <Phone className="w-4 h-4" strokeWidth={1.5} />
                      聯絡電話
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="input-editorial"
                      placeholder="0912-345-678"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 講座資訊 */}
            <div className="card-editorial p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 border-2 border-black flex items-center justify-center">
                  <Mic2 className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h2 className="font-serif text-2xl font-bold text-black">
                  講座資訊
                </h2>
              </div>

              <div className="space-y-8">
                {/* 講座類型 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-4">
                    希望的講座類型 <span className="text-red-600">*</span>
                    <span className="text-ink-muted normal-case font-normal">（可多選）</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {LECTURE_TYPES.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleLectureTopic(topic)}
                        className={`
                          px-4 py-2 text-sm font-medium border-2 border-black transition-all
                          ${formData.lectureTopics.includes(topic)
                            ? 'bg-black text-paper shadow-hard-sm -translate-x-0.5 -translate-y-0.5'
                            : 'bg-white text-black hover:bg-gray-100'
                          }
                        `}
                      >
                        {formData.lectureTopics.includes(topic) && (
                          <span className="mr-1">✓</span>
                        )}
                        {topic}
                      </button>
                    ))}
                  </div>
                  {formData.lectureTopics.length > 0 && (
                    <p className="text-sm text-ink-muted mt-3">
                      已選擇：{formData.lectureTopics.join('、')}
                    </p>
                  )}
                </div>

                {/* 希望講師 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                    <User className="w-4 h-4" strokeWidth={1.5} />
                    希望邀請的講師
                  </label>
                  <input
                    type="text"
                    name="preferredLecturer"
                    value={formData.preferredLecturer}
                    onChange={handleChange}
                    className="input-editorial"
                    placeholder="如有特定講師偏好，請填寫講師姓名（選填）"
                  />
                  <p className="text-xs text-ink-muted mt-2">
                    若無特定偏好，我們將根據您的需求推薦合適的講師
                  </p>
                </div>

                {/* 聽眾資訊 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                      <Users className="w-4 h-4" strokeWidth={1.5} />
                      聽眾類型 <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="audienceType"
                      value={formData.audienceType}
                      onChange={handleChange}
                      required
                      className="input-editorial"
                      placeholder="例：高三學生、全校教師"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                      <Users className="w-4 h-4" strokeWidth={1.5} />
                      預估人數
                    </label>
                    <input
                      type="number"
                      name="audienceCount"
                      value={formData.audienceCount}
                      onChange={handleChange}
                      className="input-editorial"
                      placeholder="例：200"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 時間與形式 */}
            <div className="card-editorial p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 border-2 border-black flex items-center justify-center">
                  <Calendar className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h2 className="font-serif text-2xl font-bold text-black">
                  時間與形式
                </h2>
              </div>

              <div className="space-y-6">
                {/* 希望日期 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                    <Calendar className="w-4 h-4" strokeWidth={1.5} />
                    希望的講座日期 <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="preferredDates"
                    value={formData.preferredDates}
                    onChange={handleChange}
                    required
                    className="input-editorial"
                    placeholder="例：2026/03/15、2026/03/22（可填寫多個日期）"
                  />
                  <p className="text-xs text-ink-muted mt-2">
                    可填寫多個日期，用逗號分隔
                  </p>
                </div>

                {/* 講座形式 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-4">
                    <MapPin className="w-4 h-4" strokeWidth={1.5} />
                    講座形式 <span className="text-red-600">*</span>
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {LECTURE_FORMATS.map((format) => (
                      <label
                        key={format}
                        className={`
                          flex items-center gap-3 px-6 py-4 border-2 border-black cursor-pointer transition-all
                          ${formData.lectureFormat === format
                            ? 'bg-black text-paper shadow-hard-sm -translate-x-0.5 -translate-y-0.5'
                            : 'bg-white text-black hover:bg-gray-100'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="lectureFormat"
                          value={format}
                          checked={formData.lectureFormat === format}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className={`
                          w-5 h-5 border-2 flex items-center justify-center
                          ${formData.lectureFormat === format
                            ? 'border-paper bg-paper'
                            : 'border-black'
                          }
                        `}>
                          {formData.lectureFormat === format && (
                            <span className="w-2.5 h-2.5 bg-black"></span>
                          )}
                        </span>
                        <span className="font-medium">{format}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 其他資訊 */}
            <div className="card-editorial p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 border-2 border-black flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h2 className="font-serif text-2xl font-bold text-black">
                  其他資訊
                </h2>
              </div>

              <div className="space-y-6">
                {/* 講座內容/備註 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                    <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                    講座內容說明
                  </label>
                  <textarea
                    name="lectureContent"
                    value={formData.lectureContent}
                    onChange={handleChange}
                    rows={4}
                    className="input-editorial resize-none"
                    placeholder="請描述您對講座內容的期望、特殊需求或其他備註..."
                  />
                </div>

                {/* 得知管道 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-3">
                    <Search className="w-4 h-4" strokeWidth={1.5} />
                    如何得知我們？
                  </label>
                  <select
                    name="howDidYouHear"
                    value={formData.howDidYouHear}
                    onChange={handleChange}
                    className="input-editorial"
                  >
                    <option value="">請選擇...</option>
                    {HOW_DID_YOU_HEAR.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 錯誤訊息 */}
            {status === 'error' && (
              <div className="p-4 border-2 border-black bg-red-50 text-red-800">
                <p className="font-medium">{message}</p>
              </div>
            )}

            {/* 提交按鈕 */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-editorial w-full justify-center py-5 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <span>送出講座申請</span>
                  <Send className="w-5 h-5" strokeWidth={1.5} />
                </>
              )}
            </button>

            <p className="text-sm text-ink-muted text-center">
              提交後，我們將在 3-5 個工作日內與您聯繫
            </p>
          </form>

          {/* Back to Home */}
          <p className="mt-12 text-center">
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
