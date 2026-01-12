'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  Calendar, 
  Mail, 
  Phone, 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  User,
  FileText,
  Users,
  Download,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  Save,
  BookOpen,
  Tag,
  MessageCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

// 動態載入富文本編輯器（避免 SSR 問題）
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { 
  ssr: false,
  loading: () => (
    <div className="border-2 border-black p-4 min-h-[300px] flex items-center justify-center bg-paper-dark">
      <p className="text-ink-muted">載入編輯器中...</p>
    </div>
  )
})

interface Application {
  id: string
  created_at: string
  school_name: string
  contact_person: string
  phone: string | null
  email: string
  date: string | null
  topic: string
  status: string
  notes: string | null
}

interface Subscriber {
  id: string
  email: string
  created_at: string
  is_active: boolean
}

interface Article {
  id: string
  title: string
  excerpt: string | null
  content: string
  author: string
  category: string
  image_url: string | null
  status: string
  created_at: string
  updated_at: string
}

interface Testimonial {
  id: string
  name: string
  school_title: string | null
  content: string
  is_approved: boolean
  created_at: string
}

interface NotionApplication {
  id: string
  schoolName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  contactTitle: string
  preferredLecturer: string
  lectureTopics: string[]
  audienceType: string
  audienceCount: number | null
  preferredDates: string
  lectureFormat: string
  lectureContent: string
  howDidYouHear: string[]
  status: string
  createdAt: string
  url: string
}

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'subscribers' | 'articles' | 'testimonials' | 'lectureRequests'>('articles')
  
  // Applications state
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [appError, setAppError] = useState<string | null>(null)
  
  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loadingSubscribers, setLoadingSubscribers] = useState(true)
  const [subError, setSubError] = useState<string | null>(null)

  // Articles state
  const [articles, setArticles] = useState<Article[]>([])
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [articleError, setArticleError] = useState<string | null>(null)

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loadingTestimonials, setLoadingTestimonials] = useState(true)
  const [testimonialError, setTestimonialError] = useState<string | null>(null)
  const [togglingTestimonialId, setTogglingTestimonialId] = useState<string | null>(null)
  const [deletingTestimonialId, setDeletingTestimonialId] = useState<string | null>(null)

  // Notion Lecture Requests state
  const [lectureRequests, setLectureRequests] = useState<NotionApplication[]>([])
  const [loadingLectureRequests, setLoadingLectureRequests] = useState(true)
  const [lectureRequestError, setLectureRequestError] = useState<string | null>(null)
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)

  // Article Modal state
  const [showArticleModal, setShowArticleModal] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [savingArticle, setSavingArticle] = useState(false)
  const [articleForm, setArticleForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '教育理念',
    image_url: '',
    status: 'published'
  })

  // 類別選項（與 Notion 資料庫同步）
  const defaultCategories = ['親子溝通', '教學技巧', '班級經營', '職涯發展', '生涯規劃', '教育理念']
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState('')
  const allCategories = [...defaultCategories, ...customCategories]

  // 檢查登入狀態
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // 獲取講座申請（Supabase - 舊版備份）
  const fetchApplications = async () => {
    setLoadingApps(true)
    setAppError(null)
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // 資料表可能不存在，靜默處理
        if (!error.message?.includes('does not exist')) {
          setAppError(error.message)
        }
      } else {
        setApplications(data || [])
      }
    } catch {
      // 忽略錯誤
    }
    setLoadingApps(false)
  }

  // 獲取訂閱者（Supabase）
  const fetchSubscribers = async () => {
    setLoadingSubscribers(true)
    setSubError(null)
    
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // 資料表可能不存在，靜默處理
        if (!error.message?.includes('does not exist')) {
          setSubError(error.message)
        }
      } else {
        setSubscribers(data || [])
      }
    } catch {
      // 忽略錯誤
    }
    setLoadingSubscribers(false)
  }

  // 獲取文章 (從 Notion)
  const fetchArticles = async () => {
    setLoadingArticles(true)
    setArticleError(null)
    
    try {
      const response = await fetch('/api/posts')
      const result = await response.json()

      if (result.success && result.data) {
        // 轉換 Notion 格式為本地格式
        const formattedArticles = result.data.map((article: {
          id: string
          title: string
          excerpt: string
          content: string
          author: string
          category: string
          imageUrl: string
          status: string
          createdAt: string
        }) => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          author: article.author,
          category: article.category,
          image_url: article.imageUrl,
          status: article.status === '已發佈' ? 'published' : article.status === '草稿' ? 'draft' : 'archived',
          created_at: article.createdAt,
          updated_at: article.createdAt,
        }))
        setArticles(formattedArticles)
      } else {
        console.error('獲取文章錯誤:', result.error)
        setArticleError(result.error || '獲取失敗')
      }
    } catch (error) {
      console.error('獲取文章錯誤:', error)
      setArticleError('網路錯誤，請稍後再試')
    }
    setLoadingArticles(false)
  }

  // 獲取回饋 (從 Notion)
  const fetchTestimonials = async () => {
    setLoadingTestimonials(true)
    setTestimonialError(null)

    try {
      const response = await fetch('/api/testimonials')
      const result = await response.json()

      if (result.success && result.data) {
        // 轉換 Notion 格式為本地格式
        const formattedTestimonials = result.data.map((item: {
          id: string
          name: string
          schoolTitle: string
          content: string
          isApproved: boolean
          createdAt: string
        }) => ({
          id: item.id,
          name: item.name,
          school_title: item.schoolTitle,
          content: item.content,
          is_approved: item.isApproved,
          created_at: item.createdAt,
        }))
        setTestimonials(formattedTestimonials)
      } else {
        console.error('獲取回饋錯誤:', result.error)
        setTestimonialError(result.error || '獲取失敗')
      }
    } catch (error) {
      console.error('獲取回饋錯誤:', error)
      setTestimonialError('網路錯誤，請稍後再試')
    }
    setLoadingTestimonials(false)
  }

  // 獲取 Notion 講座邀約
  const fetchLectureRequests = async () => {
    setLoadingLectureRequests(true)
    setLectureRequestError(null)

    try {
      const response = await fetch('/api/lecture-applications')
      const result = await response.json()

      if (result.success) {
        setLectureRequests(result.data || [])
      } else {
        setLectureRequestError(result.error || '獲取失敗')
      }
    } catch (error) {
      console.error('獲取講座邀約錯誤:', error)
      setLectureRequestError('網路錯誤，請稍後再試')
    }
    setLoadingLectureRequests(false)
  }

  // 更新講座邀約狀態
  const updateLectureRequestStatus = async (pageId: string, newStatus: string) => {
    setUpdatingStatusId(pageId)

    try {
      const response = await fetch('/api/lecture-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, status: newStatus }),
      })
      const result = await response.json()

      if (result.success) {
        // 更新本地狀態
        setLectureRequests(prev =>
          prev.map(req =>
            req.id === pageId ? { ...req, status: newStatus } : req
          )
        )
      } else {
        alert(`更新失敗：${result.error}`)
      }
    } catch (error) {
      console.error('更新狀態錯誤:', error)
      alert('更新狀態時發生錯誤')
    }

    setUpdatingStatusId(null)
  }

  // 切換回饋顯示狀態 (Notion)
  const toggleTestimonialApproval = async (id: string, currentStatus: boolean) => {
    setTogglingTestimonialId(id)

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !currentStatus }),
      })
      const result = await response.json()

      if (!result.success) {
        console.error('更新回饋狀態錯誤:', result.error)
        alert(`更新失敗：${result.error}`)
      } else {
        await fetchTestimonials()
      }
    } catch (error) {
      console.error('更新回饋狀態錯誤:', error)
      alert('更新狀態時發生錯誤')
    }

    setTogglingTestimonialId(null)
  }

  // 刪除回饋 (Notion)
  const deleteTestimonial = async (id: string, name: string) => {
    if (!confirm(`確定要刪除來自「${name}」的回饋嗎？此操作無法復原。`)) {
      return
    }

    setDeletingTestimonialId(id)

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (!result.success) {
        console.error('刪除回饋錯誤:', result.error)
        alert(`刪除失敗：${result.error}`)
      } else {
        await fetchTestimonials()
      }
    } catch (error) {
      console.error('刪除回饋錯誤:', error)
      alert('刪除時發生錯誤')
    }

    setDeletingTestimonialId(null)
  }

  useEffect(() => {
    if (user) {
      fetchApplications()
      fetchSubscribers()
      fetchArticles()
      fetchTestimonials()
      fetchLectureRequests()
    }
  }, [user, profile])

  // 開啟新增文章 Modal
  const openNewArticleModal = () => {
    setEditingArticle(null)
    setArticleForm({
      title: '',
      excerpt: '',
      content: '',
      category: '教育理念',
      image_url: '',
      status: 'published'
    })
    setShowArticleModal(true)
  }

  // 開啟編輯文章 Modal
  const openEditArticleModal = (article: Article) => {
    setEditingArticle(article)
    setArticleForm({
      title: article.title,
      excerpt: article.excerpt || '',
      content: article.content,
      category: article.category,
      image_url: article.image_url || '',
      status: article.status
    })
    setShowArticleModal(true)
  }

  // 儲存文章 (Notion)
  const saveArticle = async () => {
    // Debug: 顯示當前表單狀態
    console.log('saveArticle 被呼叫', {
      title: articleForm.title,
      contentLength: articleForm.content?.length,
      contentPreview: articleForm.content?.substring(0, 100),
      isEditing: !!editingArticle
    })
    
    // 新文章需要標題和內容，更新文章只需要標題（內容可在 Notion 頁面中編輯）
    if (!articleForm.title.trim()) {
      alert('請填寫標題')
      return
    }
    // 新增文章時需要內容，更新時可選（因為可在 Notion 中編輯）
    if (!editingArticle && !articleForm.content.trim()) {
      alert('請填寫內容')
      return
    }

    setSavingArticle(true)

    const authorName = profile?.full_name || profile?.display_name || user?.email || '匿名'
    const authorId = user?.id || ''

    // 轉換狀態格式：published -> 已發佈, draft -> 草稿, archived -> 已封存
    const notionStatus = articleForm.status === 'published' ? '已發佈' : 
                         articleForm.status === 'draft' ? '草稿' : '已封存'

    try {
      if (editingArticle) {
        // 更新文章
        const response = await fetch(`/api/posts/${editingArticle.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: articleForm.title,
            excerpt: articleForm.excerpt || '',
            content: articleForm.content,
            category: articleForm.category,
            imageUrl: articleForm.image_url || '',
            status: notionStatus,
          }),
        })
        const result = await response.json()

        if (!result.success) {
          console.error('更新文章錯誤:', result.error)
          alert(`更新失敗：${result.error}`)
        } else {
          setShowArticleModal(false)
          fetchArticles()
        }
      } else {
        // 新增文章
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: articleForm.title,
            excerpt: articleForm.excerpt || '',
            content: articleForm.content,
            author: authorName,
            authorId: authorId,
            category: articleForm.category,
            imageUrl: articleForm.image_url || '',
            status: notionStatus,
          }),
        })
        const result = await response.json()

        if (!result.success) {
          console.error('新增文章錯誤:', result.error)
          alert(`新增失敗：${result.error}`)
        } else {
          setShowArticleModal(false)
          fetchArticles()
        }
      }
    } catch (error) {
      console.error('儲存文章錯誤:', error)
      alert('儲存時發生錯誤')
    }

    setSavingArticle(false)
  }

  // 刪除文章 (Notion)
  const deleteArticle = async (articleId: string) => {
    if (!confirm('確定要刪除這篇文章嗎？此操作無法復原。')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${articleId}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (!result.success) {
        console.error('刪除文章錯誤:', result.error)
        alert(`刪除失敗：${result.error}`)
      } else {
        fetchArticles()
      }
    } catch (error) {
      console.error('刪除文章錯誤:', error)
      alert('刪除時發生錯誤')
    }
  }

  // 匯出 CSV
  const exportToCSV = () => {
    if (subscribers.length === 0) {
      alert('沒有訂閱者資料可匯出')
      return
    }

    const headers = ['Email', '訂閱日期', '狀態']
    const rows = subscribers.map(sub => [
      sub.email,
      new Date(sub.created_at).toLocaleString('zh-TW'),
      sub.is_active ? '有效' : '已取消'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `電子報訂閱名單_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '-')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // 格式化時間
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 狀態標籤
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      pending: { 
        color: 'bg-paper border-black', 
        icon: <AlertCircle className="w-4 h-4" strokeWidth={1.5} />,
        label: '待處理' 
      },
      reviewing: { 
        color: 'bg-paper border-black', 
        icon: <Clock className="w-4 h-4" strokeWidth={1.5} />,
        label: '審核中' 
      },
      approved: { 
        color: 'bg-black text-paper border-black', 
        icon: <CheckCircle className="w-4 h-4" strokeWidth={1.5} />,
        label: '已核准' 
      },
      rejected: { 
        color: 'bg-paper border-black', 
        icon: <XCircle className="w-4 h-4" strokeWidth={1.5} />,
        label: '已拒絕' 
      },
      completed: { 
        color: 'bg-black text-paper border-black', 
        icon: <CheckCircle className="w-4 h-4" strokeWidth={1.5} />,
        label: '已完成' 
      },
      published: { 
        color: 'bg-black text-paper border-black', 
        icon: <Eye className="w-4 h-4" strokeWidth={1.5} />,
        label: '已發布' 
      },
      draft: { 
        color: 'bg-paper border-black', 
        icon: <Edit3 className="w-4 h-4" strokeWidth={1.5} />,
        label: '草稿' 
      },
    }

    const config = statusConfig[status] || statusConfig.pending

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium border-2 ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  // 如果正在載入，顯示載入畫面
  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-ink-muted uppercase tracking-wider text-sm">載入中...</p>
        </div>
      </div>
    )
  }

  // 如果未登入，不顯示內容（會被重導向）
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <div className="border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-sm uppercase tracking-wider text-ink-muted mb-2 block">
                Dashboard
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-black">
                講師後台
              </h1>
              <p className="mt-2 text-ink-muted">
                歡迎回來，{profile?.full_name || profile?.display_name || user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-editorial p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 border-2 border-black bg-black">
                <BookOpen className="w-6 h-6 text-paper" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-muted">我的文章</p>
                <p className="font-serif text-2xl font-bold text-black">{articles.length}</p>
              </div>
            </div>
          </div>
          <div className="card-editorial p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 border-2 border-black">
                <Calendar className="w-6 h-6 text-black" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-muted">講座邀約</p>
                <p className="font-serif text-2xl font-bold text-black">{lectureRequests.length}</p>
              </div>
            </div>
          </div>
          <div className="card-editorial p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 border-2 border-black">
                <AlertCircle className="w-6 h-6 text-black" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-muted">待處理邀約</p>
                <p className="font-serif text-2xl font-bold text-black">
                  {lectureRequests.filter(r => r.status === '待處理').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card-editorial p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 border-2 border-black">
                <Users className="w-6 h-6 text-black" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-muted">訂閱人數</p>
                <p className="font-serif text-2xl font-bold text-black">{subscribers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card-editorial overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b-2 border-black overflow-x-auto">
            <button
              onClick={() => setActiveTab('articles')}
              className={`flex-shrink-0 px-6 py-4 text-sm font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'articles'
                  ? 'bg-black text-paper'
                  : 'bg-paper text-black hover:bg-black/5'
              }`}
            >
              <BookOpen className="w-4 h-4" strokeWidth={1.5} />
              我的文章
              <span className={`px-2 py-0.5 text-xs ${
                activeTab === 'articles' ? 'bg-paper text-black' : 'bg-black text-paper'
              }`}>
                {articles.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`flex-shrink-0 px-6 py-4 text-sm font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border-l-2 border-black ${
                activeTab === 'subscribers'
                  ? 'bg-black text-paper'
                  : 'bg-paper text-black hover:bg-black/5'
              }`}
            >
              <Mail className="w-4 h-4" strokeWidth={1.5} />
              訂閱名單
              <span className={`px-2 py-0.5 text-xs ${
                activeTab === 'subscribers' ? 'bg-paper text-black' : 'bg-black text-paper'
              }`}>
                {subscribers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`flex-shrink-0 px-6 py-4 text-sm font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border-l-2 border-black ${
                activeTab === 'testimonials'
                  ? 'bg-black text-paper'
                  : 'bg-paper text-black hover:bg-black/5'
              }`}
            >
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
              讀者回饋
              <span className={`px-2 py-0.5 text-xs ${
                activeTab === 'testimonials' ? 'bg-paper text-black' : 'bg-black text-paper'
              }`}>
                {testimonials.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('lectureRequests')}
              className={`flex-shrink-0 px-6 py-4 text-sm font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border-l-2 border-black ${
                activeTab === 'lectureRequests'
                  ? 'bg-black text-paper'
                  : 'bg-paper text-black hover:bg-black/5'
              }`}
            >
              <Calendar className="w-4 h-4" strokeWidth={1.5} />
              講座邀約
              <span className={`px-2 py-0.5 text-xs ${
                activeTab === 'lectureRequests' ? 'bg-paper text-black' : 'bg-black text-paper'
              }`}>
                {lectureRequests.length}
              </span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'articles' ? (
            <>
              {/* Articles Header */}
              <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-paper">
                <div>
                  <h2 className="font-serif text-lg font-bold text-black">我的專欄文章</h2>
                  <p className="text-sm text-ink-muted">管理您發表的文章</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchArticles}
                    disabled={loadingArticles}
                    className="btn-editorial-outline text-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingArticles ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                    <span className="hidden sm:inline">重新整理</span>
                  </button>
                  <button
                    onClick={openNewArticleModal}
                    className="btn-editorial text-sm"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                    <span>新增文章</span>
                  </button>
                </div>
              </div>

              {articleError && (
                <div className="p-4 bg-red-50 border-b-2 border-black text-red-800">
                  載入失敗：{articleError}
                </div>
              )}

              {loadingArticles ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
                  <p className="text-ink-muted text-sm uppercase tracking-wider">載入文章中...</p>
                </div>
              ) : articles.length === 0 ? (
                <div className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-ink-muted mx-auto mb-4" strokeWidth={1} />
                  <p className="text-ink-muted mb-4">您還沒有發表任何文章</p>
                  <button
                    onClick={openNewArticleModal}
                    className="btn-editorial"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                    <span>撰寫第一篇文章</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y-2 divide-black/10">
                  {articles.map((article) => (
                    <div key={article.id} className="px-6 py-4 hover:bg-paper-dark transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-serif text-lg font-bold text-black truncate">
                              {article.title}
                            </h3>
                            {getStatusBadge(article.status)}
                          </div>
                          <p className="text-sm text-ink-muted line-clamp-2 mb-3">
                            {article.excerpt || article.content.substring(0, 100) + '...'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-ink-muted">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" strokeWidth={1.5} />
                              {formatDateTime(article.created_at)}
                            </span>
                            <span className="px-2 py-0.5 bg-paper-dark border border-black/20">
                              {article.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => openEditArticleModal(article)}
                            className="p-2 border-2 border-black hover:bg-black hover:text-paper transition-colors"
                            title="編輯"
                          >
                            <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => deleteArticle(article.id)}
                            className="p-2 border-2 border-black hover:bg-red-600 hover:border-red-600 hover:text-white transition-colors"
                            title="刪除"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : activeTab === 'subscribers' ? (
            <>
              {/* Subscribers Header */}
              <div className="px-6 py-4 border-b-2 border-black flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-paper">
                <div>
                  <h2 className="font-serif text-lg font-bold text-black">電子報訂閱名單</h2>
                  <p className="text-sm text-ink-muted">所有訂閱電子報的 Email 清單</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchSubscribers}
                    disabled={loadingSubscribers}
                    className="btn-editorial-outline text-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingSubscribers ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                    <span>重新整理</span>
                  </button>
                  <button
                    onClick={exportToCSV}
                    disabled={subscribers.length === 0}
                    className="btn-editorial text-sm disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" strokeWidth={1.5} />
                    <span>匯出 CSV</span>
                  </button>
                </div>
              </div>

              {subError && (
                <div className="p-4 bg-red-50 border-b-2 border-black text-red-800">
                  載入失敗：{subError}
                </div>
              )}

              {loadingSubscribers ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
                  <p className="text-ink-muted text-sm uppercase tracking-wider">載入訂閱者中...</p>
                </div>
              ) : subscribers.length === 0 ? (
                <div className="p-12 text-center">
                  <Mail className="w-12 h-12 text-ink-muted mx-auto mb-4" strokeWidth={1} />
                  <p className="text-ink-muted">目前沒有任何訂閱者</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-paper border-b-2 border-black">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-black">
                          #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-black">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-black">
                          訂閱日期
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-black">
                          狀態
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black/10">
                      {subscribers.map((sub, index) => (
                        <tr key={sub.id} className="hover:bg-paper-dark transition-colors">
                          <td className="px-6 py-4 text-ink-muted text-sm font-mono">
                            {String(index + 1).padStart(2, '0')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 border-2 border-black">
                                <Mail className="w-4 h-4 text-black" strokeWidth={1.5} />
                              </div>
                              <span className="font-medium text-black">{sub.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-ink-muted">
                              <Clock className="w-4 h-4" strokeWidth={1.5} />
                              {formatDateTime(sub.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {sub.is_active !== false ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-black text-paper border-2 border-black">
                                <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                                有效
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-paper text-black border-2 border-black">
                                <XCircle className="w-4 h-4" strokeWidth={1.5} />
                                已取消
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : activeTab === 'testimonials' ? (
            <>
              {/* Testimonials Header */}
              <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-paper">
                <div>
                  <h2 className="font-serif text-lg font-bold text-black">讀者回饋管理</h2>
                  <p className="text-sm text-ink-muted">
                    已審核：{testimonials.filter(t => t.is_approved).length} / 總計：{testimonials.length}
                  </p>
                </div>
                <button
                  onClick={fetchTestimonials}
                  disabled={loadingTestimonials}
                  className="p-2 border-2 border-black hover:bg-black hover:text-paper transition-colors"
                  title="重新整理"
                >
                  <RefreshCw className={`w-5 h-5 ${loadingTestimonials ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                </button>
              </div>

              {/* Testimonials List */}
              {testimonialError ? (
                <div className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" strokeWidth={1} />
                  <p className="text-red-600">{testimonialError}</p>
                </div>
              ) : loadingTestimonials ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
                  <p className="text-ink-muted text-sm uppercase tracking-wider">載入回饋資料中...</p>
                </div>
              ) : testimonials.length === 0 ? (
                <div className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-ink-muted mx-auto mb-4" strokeWidth={1} />
                  <p className="text-ink-muted">目前沒有收到任何回饋</p>
                  <p className="text-sm text-ink-muted mt-2">回饋將顯示在這裡供您審核</p>
                </div>
              ) : (
                <div className="divide-y-2 divide-black/10">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="px-6 py-5 hover:bg-paper-dark transition-colors">
                      <div className="flex items-start gap-4">
                        {/* 內容區 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-serif font-bold text-black">
                              {testimonial.name}
                            </p>
                            {testimonial.is_approved ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-black text-paper border border-black">
                                <Eye className="w-3 h-3" strokeWidth={1.5} />
                                已顯示
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-paper text-ink-muted border border-black/30">
                                待審核
                              </span>
                            )}
                          </div>
                          
                          {testimonial.school_title && (
                            <p className="text-sm text-ink-muted mb-2">
                              {testimonial.school_title}
                            </p>
                          )}

                          <p className="text-black leading-relaxed mb-3">
                            「{testimonial.content}」
                          </p>

                          <p className="text-xs text-ink-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" strokeWidth={1.5} />
                            {formatDateTime(testimonial.created_at)}
                          </p>
                        </div>

                        {/* 操作區 */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* 顯示/隱藏開關 */}
                          <button
                            onClick={() => toggleTestimonialApproval(testimonial.id, testimonial.is_approved)}
                            disabled={togglingTestimonialId === testimonial.id}
                            className={`p-2 border-2 transition-colors ${
                              testimonial.is_approved
                                ? 'border-black bg-black text-paper hover:bg-paper hover:text-black'
                                : 'border-black/30 hover:border-black hover:bg-black hover:text-paper'
                            }`}
                            title={testimonial.is_approved ? '點擊隱藏' : '點擊顯示於首頁'}
                          >
                            {togglingTestimonialId === testimonial.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                            ) : testimonial.is_approved ? (
                              <ToggleRight className="w-4 h-4" strokeWidth={1.5} />
                            ) : (
                              <ToggleLeft className="w-4 h-4" strokeWidth={1.5} />
                            )}
                          </button>

                          {/* 刪除按鈕 */}
                          <button
                            onClick={() => deleteTestimonial(testimonial.id, testimonial.name)}
                            disabled={deletingTestimonialId === testimonial.id}
                            className="p-2 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                            title="刪除此回饋"
                          >
                            {deletingTestimonialId === testimonial.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                            ) : (
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : activeTab === 'lectureRequests' ? (
            <>
              {/* Lecture Requests Header */}
              <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-paper">
                <div>
                  <h2 className="font-serif text-lg font-bold text-black">講座邀約管理</h2>
                  <p className="text-sm text-ink-muted">
                    來自 Notion 的講座申請（待處理：{lectureRequests.filter(r => r.status === '待處理').length}）
                  </p>
                </div>
                <button
                  onClick={fetchLectureRequests}
                  disabled={loadingLectureRequests}
                  className="btn-editorial-outline text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingLectureRequests ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                  <span>重新整理</span>
                </button>
              </div>

              {lectureRequestError && (
                <div className="p-4 bg-red-50 border-b-2 border-black text-red-800">
                  載入失敗：{lectureRequestError}
                </div>
              )}

              {loadingLectureRequests ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
                  <p className="text-ink-muted text-sm uppercase tracking-wider">載入講座邀約中...</p>
                </div>
              ) : lectureRequests.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-ink-muted mx-auto mb-4" strokeWidth={1} />
                  <p className="text-ink-muted">目前沒有任何講座邀約申請</p>
                </div>
              ) : (
                <div className="divide-y-2 divide-black/10">
                  {lectureRequests.map((request) => (
                    <div key={request.id} className="px-6 py-5 hover:bg-paper-dark transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* 主要資訊 */}
                        <div className="flex-1 min-w-0">
                          {/* 標題列 */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 border-2 border-black">
                              <Building2 className="w-5 h-5 text-black" strokeWidth={1.5} />
                            </div>
                            <div>
                              <h3 className="font-serif text-lg font-bold text-black">
                                {request.schoolName}
                              </h3>
                              <p className="text-sm text-ink-muted">
                                {request.createdAt ? formatDateTime(request.createdAt) : ''}
                              </p>
                            </div>
                          </div>

                          {/* 詳細資訊網格 */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            {/* 聯絡人 */}
                            <div className="space-y-1">
                              <p className="text-xs uppercase tracking-wider text-ink-muted font-medium">聯絡人</p>
                              <div className="flex items-center gap-2 text-black">
                                <User className="w-4 h-4 text-ink-muted" strokeWidth={1.5} />
                                {request.contactName}
                                {request.contactTitle && (
                                  <span className="text-ink-muted">（{request.contactTitle}）</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-ink-muted">
                                <Mail className="w-4 h-4" strokeWidth={1.5} />
                                <a href={`mailto:${request.contactEmail}`} className="hover:text-black hover:underline">
                                  {request.contactEmail}
                                </a>
                              </div>
                              {request.contactPhone && (
                                <div className="flex items-center gap-2 text-sm text-ink-muted">
                                  <Phone className="w-4 h-4" strokeWidth={1.5} />
                                  {request.contactPhone}
                                </div>
                              )}
                            </div>

                            {/* 講座資訊 */}
                            <div className="space-y-1">
                              <p className="text-xs uppercase tracking-wider text-ink-muted font-medium">講座資訊</p>
                              <div className="flex flex-wrap gap-1">
                                {request.lectureTopics.map((topic, idx) => (
                                  <span key={idx} className="px-2 py-0.5 text-xs bg-black text-paper">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                              <p className="text-sm text-black">
                                聽眾：{request.audienceType}
                                {request.audienceCount && ` (${request.audienceCount} 人)`}
                              </p>
                              <p className="text-sm text-black">
                                形式：{request.lectureFormat}
                              </p>
                            </div>
                          </div>

                          {/* 日期與備註 */}
                          <div className="space-y-2">
                            {request.preferredDates && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-ink-muted" strokeWidth={1.5} />
                                <span className="text-ink-muted">希望日期：</span>
                                <span className="text-black">{request.preferredDates}</span>
                              </div>
                            )}
                            {request.preferredLecturer && (
                              <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-ink-muted" strokeWidth={1.5} />
                                <span className="text-ink-muted">希望講師：</span>
                                <span className="text-black">{request.preferredLecturer}</span>
                              </div>
                            )}
                            {request.lectureContent && (
                              <div className="text-sm">
                                <span className="text-ink-muted">備註：</span>
                                <span className="text-black">{request.lectureContent}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 狀態與操作 */}
                        <div className="flex flex-col gap-3 lg:w-48 flex-shrink-0">
                          {/* 當前狀態 */}
                          <div className="text-center lg:text-right">
                            {getStatusBadge(
                              request.status === '待處理' ? 'pending' :
                              request.status === '處理中' ? 'reviewing' :
                              request.status === '已確認' ? 'approved' :
                              request.status === '已完成' ? 'completed' :
                              request.status === '已取消' ? 'rejected' : 'pending'
                            )}
                          </div>

                          {/* 狀態更新按鈕 */}
                          <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
                            {['待處理', '處理中', '已確認', '已完成', '已取消'].map((status) => (
                              <button
                                key={status}
                                onClick={() => updateLectureRequestStatus(request.id, status)}
                                disabled={updatingStatusId === request.id || request.status === status}
                                className={`px-2 py-1 text-xs border transition-colors ${
                                  request.status === status
                                    ? 'border-black bg-black text-paper cursor-default'
                                    : 'border-black/30 hover:border-black hover:bg-black/5'
                                } disabled:opacity-50`}
                              >
                                {updatingStatusId === request.id ? '...' : status}
                              </button>
                            ))}
                          </div>

                          {/* Notion 連結 */}
                          {request.url && (
                            <a
                              href={request.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-ink-muted hover:text-black underline text-center lg:text-right"
                            >
                              在 Notion 中開啟 →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Article Modal */}
      {showArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-paper border-2 border-black shadow-hard max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between sticky top-0 bg-paper">
              <div>
                <h3 className="font-serif text-xl font-bold text-black">
                  {editingArticle ? '編輯文章' : '新增文章'}
                </h3>
                <p className="text-sm text-ink-muted">
                  {editingArticle ? '修改您的文章內容' : '撰寫一篇新的專欄文章'}
                </p>
              </div>
              <button
                onClick={() => setShowArticleModal(false)}
                className="p-2 border-2 border-black hover:bg-black hover:text-paper transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* 標題 */}
              <div>
                <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                  文章標題 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input-editorial"
                  placeholder="輸入文章標題"
                />
              </div>

              {/* 類別 */}
              <div>
                <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                  <Tag className="w-4 h-4 inline mr-1" strokeWidth={1.5} />
                  文章類別
                </label>
                {/* 現有類別選擇 */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {allCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setArticleForm(prev => ({ ...prev, category: cat }))}
                      className={`px-3 py-1.5 text-sm border-2 border-black transition-colors ${
                        articleForm.category === cat
                          ? 'bg-black text-paper'
                          : 'bg-paper text-black hover:bg-black/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {/* 自訂類別輸入 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (newCategory.trim() && !allCategories.includes(newCategory.trim())) {
                          setCustomCategories(prev => [...prev, newCategory.trim()])
                          setArticleForm(prev => ({ ...prev, category: newCategory.trim() }))
                          setNewCategory('')
                        }
                      }
                    }}
                    className="input-editorial flex-1"
                    placeholder="輸入自訂類別，按 Enter 新增"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCategory.trim() && !allCategories.includes(newCategory.trim())) {
                        setCustomCategories(prev => [...prev, newCategory.trim()])
                        setArticleForm(prev => ({ ...prev, category: newCategory.trim() }))
                        setNewCategory('')
                      }
                    }}
                    className="btn-editorial-outline px-3"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
                {articleForm.category && !allCategories.includes(articleForm.category) && (
                  <p className="text-sm text-ink-muted mt-2">
                    目前選擇：<span className="font-medium text-black">{articleForm.category}</span>
                  </p>
                )}
              </div>

              {/* 摘要 */}
              <div>
                <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                  文章摘要
                </label>
                <textarea
                  value={articleForm.excerpt}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="input-editorial resize-none"
                  rows={2}
                  placeholder="簡短描述文章內容（可選）"
                />
              </div>

              {/* 內容 */}
              <div>
                <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                  文章內容 <span className="text-red-600">*</span>
                </label>
                <RichTextEditor
                  content={articleForm.content}
                  onChange={(content) => setArticleForm(prev => ({ ...prev, content }))}
                  placeholder="開始撰寫您的文章..."
                />
                <p className="text-xs text-ink-muted mt-2">
                  💡 提示：支援標題、粗體、斜體、列表、引用、連結、圖片等格式
                </p>
              </div>

              {/* 封面圖片 */}
              <div>
                <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                  封面圖片網址
                </label>
                <input
                  type="url"
                  value={articleForm.image_url}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, image_url: e.target.value }))}
                  className="input-editorial"
                  placeholder="https://example.com/image.jpg（可選）"
                />
              </div>

              {/* 狀態 */}
              <div>
                <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                  發布狀態
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={articleForm.status === 'published'}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-4 h-4"
                    />
                    <span>立即發布</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={articleForm.status === 'draft'}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-4 h-4"
                    />
                    <span>儲存為草稿</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t-2 border-black bg-paper-dark flex items-center justify-end gap-3 sticky bottom-0">
              <button
                onClick={() => setShowArticleModal(false)}
                className="btn-editorial-outline"
              >
                <span>取消</span>
              </button>
              <button
                onClick={saveArticle}
                disabled={savingArticle}
                className="btn-editorial"
              >
                {savingArticle ? (
                  <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Save className="w-4 h-4" strokeWidth={1.5} />
                )}
                <span>{savingArticle ? '儲存中...' : (editingArticle ? '更新文章' : '發布文章')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
