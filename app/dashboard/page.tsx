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
  EyeOff,
  X,
  Save,
  BookOpen,
  Tag,
  MessageCircle,
  ToggleLeft,
  ToggleRight,
  Star,
  Globe,
  HelpCircle,
  Lock
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
  featured: boolean
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

interface LecturePlan {
  id: string
  audience: string
  pain_points: string
  budget: string
  contact_email: string
  status: string
  created_at: string
  updated_at: string
}

interface FAQInquiry {
  id: string
  name: string
  email: string
  content: string
  target_lecturer_id: string | null
  status: string
  created_at: string
  updated_at: string
  lecturer_name?: string // 從 join 取得的講師姓名
}

export default function DashboardPage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'subscribers' | 'articles' | 'testimonials' | 'lectureRequests' | 'lecturePlans' | 'faqInquiries' | 'siteSettings'>('articles')
  
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
  const [deletingLectureRequestId, setDeletingLectureRequestId] = useState<string | null>(null)

  // Lecture Plans state
  const [lecturePlans, setLecturePlans] = useState<LecturePlan[]>([])
  const [loadingLecturePlans, setLoadingLecturePlans] = useState(true)
  const [lecturePlanError, setLecturePlanError] = useState<string | null>(null)
  const [deletingLecturePlanId, setDeletingLecturePlanId] = useState<string | null>(null)

  // FAQ Inquiries state
  const [faqInquiries, setFaqInquiries] = useState<FAQInquiry[]>([])
  const [loadingFaqInquiries, setLoadingFaqInquiries] = useState(true)
  const [faqInquiryError, setFaqInquiryError] = useState<string | null>(null)
  const [togglingFaqInquiryId, setTogglingFaqInquiryId] = useState<string | null>(null)
  const [deletingFaqInquiryId, setDeletingFaqInquiryId] = useState<string | null>(null)
  const [filterLecturerId, setFilterLecturerId] = useState<string | 'all'>('all')

  // Profile state
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    title: '',
    bio: '',
    bio_long: '',
    expertise: [] as string[],
    is_public: false,
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [newExpertise, setNewExpertise] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // 更改密碼 state
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Site Settings state
  const [siteSettings, setSiteSettings] = useState<Record<string, string | number>>({})
  const [loadingSiteSettings, setLoadingSiteSettings] = useState(true)
  const [savingSiteSettings, setSavingSiteSettings] = useState(false)

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
    status: 'published',
    featured: false
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
  // Dashboard 是講師後台，所有用戶（包括管理員）都只看到自己的文章
  const fetchArticles = async () => {
    setLoadingArticles(true)
    setArticleError(null)
    
    try {
      // Dashboard 永遠只顯示當前用戶自己的文章
      const apiUrl = `/api/posts?authorId=${user?.id || ''}`
      
      const response = await fetch(apiUrl)
      const result = await response.json()

      if (result.success && result.data) {
        // 轉換 Notion 格式為本地格式
        const formattedArticles = result.data.map((article: {
          id: string
          title: string
          excerpt: string
          content: string
          author: string
          authorId: string
          category: string
          imageUrl: string
          status: string
          featured: boolean
          createdAt: string
        }) => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          author: article.author,
          authorId: article.authorId,
          category: article.category,
          image_url: article.imageUrl,
          status: article.status === '已發佈' ? 'published' : article.status === '草稿' ? 'draft' : 'archived',
          featured: article.featured || false,
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

  // 獲取講座規劃申請
  const fetchLecturePlans = async () => {
    setLoadingLecturePlans(true)
    setLecturePlanError(null)

    try {
      const response = await fetch('/api/lecture-plans')
      const result = await response.json()

      if (result.success) {
        setLecturePlans(result.data || [])
      } else {
        setLecturePlanError(result.error || '獲取失敗')
      }
    } catch (error) {
      console.error('獲取講座規劃申請錯誤:', error)
      setLecturePlanError('網路錯誤，請稍後再試')
    }
    setLoadingLecturePlans(false)
  }

  // 刪除講座規劃申請
  const deleteLecturePlan = async (id: string, email: string) => {
    if (!confirm(`確定要刪除來自「${email}」的講座規劃申請嗎？此操作無法復原。`)) {
      return
    }

    setDeletingLecturePlanId(id)

    try {
      const response = await fetch(`/api/lecture-plans?id=${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        await fetchLecturePlans()
      } else {
        console.error('刪除講座規劃申請錯誤:', result.error)
        alert(`刪除失敗：${result.error}`)
      }
    } catch (error) {
      console.error('刪除講座規劃申請錯誤:', error)
      alert('刪除時發生錯誤')
    }

    setDeletingLecturePlanId(null)
  }

  // 獲取常見問題諮詢
  const fetchFaqInquiries = async () => {
    setLoadingFaqInquiries(true)
    setFaqInquiryError(null)

    try {
      const url = filterLecturerId === 'all' 
        ? '/api/faq-inquiries'
        : `/api/faq-inquiries?lecturer_id=${filterLecturerId}`
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setFaqInquiries(result.data || [])
      } else {
        setFaqInquiryError(result.error || '獲取失敗')
      }
    } catch (error) {
      console.error('獲取常見問題諮詢錯誤:', error)
      setFaqInquiryError('網路錯誤，請稍後再試')
    }
    setLoadingFaqInquiries(false)
  }

  // 取得講師列表（用於過濾器）
  const [lecturers, setLecturers] = useState<Array<{ id: string; display_name: string | null; full_name: string }>>([])
  
  // 當切換到諮詢管理 Tab 時，載入講師列表
  useEffect(() => {
    if (user && activeTab === 'faqInquiries') {
      // 取得講師列表
      supabase
        .from('profiles')
        .select('id, display_name, full_name')
        .eq('role', 'instructor')
        .eq('is_approved', true)
        .then(({ data }) => {
          if (data) {
            setLecturers(data)
          }
        })
    }
  }, [user, activeTab])

  // 當過濾條件改變時重新載入諮詢
  useEffect(() => {
    if (user && activeTab === 'faqInquiries') {
      fetchFaqInquiries()
    }
  }, [filterLecturerId, activeTab])

  // 切換常見問題諮詢狀態
  const toggleFaqInquiryStatus = async (id: string, currentStatus: string) => {
    setTogglingFaqInquiryId(id)
    const newStatus = currentStatus === 'pending' ? 'replied' : 'pending'

    try {
      const response = await fetch(`/api/faq-inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const result = await response.json()

      if (!result.success) {
        alert('更新失敗：' + result.error)
      } else {
        await fetchFaqInquiries()
      }
    } catch (error) {
      console.error('更新狀態錯誤:', error)
      alert('更新時發生錯誤')
    }

    setTogglingFaqInquiryId(null)
  }

  // 刪除常見問題諮詢
  const deleteFaqInquiry = async (id: string) => {
    if (!confirm('確定要刪除這則諮詢嗎？此操作無法復原。')) {
      return
    }

    setDeletingFaqInquiryId(id)

    try {
      const response = await fetch(`/api/faq-inquiries/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (!result.success) {
        console.error('刪除諮詢錯誤:', result.error)
        alert(`刪除失敗：${result.error}`)
      } else {
        await fetchFaqInquiries()
      }
    } catch (error) {
      console.error('刪除諮詢錯誤:', error)
      alert('刪除時發生錯誤')
    }

    setDeletingFaqInquiryId(null)
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

  // 刪除講座邀約
  const deleteLectureRequest = async (pageId: string, schoolName: string) => {
    if (!confirm(`確定要刪除來自「${schoolName}」的講座邀約嗎？此操作無法復原。`)) {
      return
    }

    setDeletingLectureRequestId(pageId)

    try {
      const response = await fetch(`/api/lecture-applications?pageId=${pageId}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        await fetchLectureRequests()
      } else {
        console.error('刪除講座邀約錯誤:', result.error)
        alert(`刪除失敗：${result.error}`)
      }
    } catch (error) {
      console.error('刪除講座邀約錯誤:', error)
      alert('刪除時發生錯誤')
    }

    setDeletingLectureRequestId(null)
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
      fetchLecturePlans()
      fetchFaqInquiries()
      loadProfileForm()
      if (profile?.role === 'admin') {
        fetchSiteSettings()
      }
    }
  }, [user, profile])

  // 載入網站設定
  const fetchSiteSettings = async () => {
    setLoadingSiteSettings(true)
    try {
      const response = await fetch('/api/site-settings')
      const result = await response.json()
      if (result.success && result.data) {
        setSiteSettings(result.data)
      }
    } catch (error) {
      console.error('載入網站設定錯誤:', error)
    } finally {
      setLoadingSiteSettings(false)
    }
  }

  // 儲存網站設定
  const saveSiteSetting = async (key: string, value: string | number) => {
    try {
      const response = await fetch('/api/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      const result = await response.json()
      if (!result.success) {
        console.error('儲存網站設定錯誤:', result.error)
        alert('儲存失敗：' + (result.error || '未知錯誤'))
        return false
      }
      // 更新本地狀態
      setSiteSettings(prev => ({ ...prev, [key]: value }))
      return true
    } catch (error) {
      console.error('儲存網站設定例外:', error)
      alert('儲存時發生錯誤：' + (error instanceof Error ? error.message : '未知錯誤'))
      return false
    }
  }

  // 儲存所有網站設定
  const saveAllSiteSettings = async () => {
    setSavingSiteSettings(true)
    try {
      const promises = Object.entries(siteSettings).map(([key, value]) =>
        saveSiteSetting(key, value)
      )
      const results = await Promise.all(promises)
      const successCount = results.filter(r => r).length
      const totalCount = results.length
      
      if (results.every(r => r)) {
        alert('網站設定已儲存！')
      } else {
        alert(`部分設定儲存失敗：成功 ${successCount}/${totalCount} 項`)
      }
    } catch (error) {
      console.error('儲存所有網站設定錯誤:', error)
      alert('儲存時發生錯誤：' + (error instanceof Error ? error.message : '未知錯誤'))
    } finally {
      setSavingSiteSettings(false)
    }
  }

// 載入個人資料表單
  const loadProfileForm = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        // 忽略「找不到資料」的錯誤
        if (error.code !== 'PGRST116') {
          console.warn('載入個人資料警告:', error.message)
        }
        return
      }

      if (data) {
        // 如果 display_name 為空，使用註冊時的 full_name
        const displayName = data.display_name || data.full_name || ''
        setProfileForm({
          display_name: displayName,
          title: data.title || '',
          bio: data.bio || '',
          bio_long: data.bio_long || '',
          expertise: Array.isArray(data.expertise) ? data.expertise : [],
          is_public: data.is_public || false,
        })
        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url)
        }
      }
    } catch {
      // 靜默處理錯誤
    }
  }

  // 儲存個人資料
  const saveProfile = async () => {
    if (!user) {
      alert('請先登入')
      return
    }
    
    console.log('開始儲存個人資料，用戶 ID:', user.id)
    setSavingProfile(true)
    
    try {
      let avatarUrl = avatarPreview

      // 如果有上傳新頭像
      if (avatarFile) {
        console.log('準備上傳頭像...')
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile)

        if (uploadError) {
          console.error('上傳頭像錯誤:', uploadError)
          alert('上傳頭像失敗：' + uploadError.message)
          setSavingProfile(false)
          return
        } else {
          // 取得公開 URL
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)
          
          avatarUrl = publicUrlData.publicUrl
        }
      }

      // 更新 profile - 使用 upsert 以確保資料存在
      const updateData: Record<string, unknown> = {
        id: user.id,
        display_name: profileForm.display_name || null,
        avatar_url: avatarUrl || null,
        is_public: profileForm.is_public,
      }
      
      // 只有當欄位有值時才加入（避免欄位不存在的錯誤）
      if (profileForm.title) updateData.title = profileForm.title
      if (profileForm.bio) updateData.bio = profileForm.bio
      if (profileForm.bio_long) updateData.bio_long = profileForm.bio_long
      if (profileForm.expertise.length > 0) updateData.expertise = profileForm.expertise

      console.log('準備儲存的資料:', JSON.stringify(updateData, null, 2))

      // 直接執行，不使用重試（簡化流程）
      const { error, data } = await supabase
        .from('profiles')
        .upsert(updateData, { onConflict: 'id' })
        .select()
      
      console.log('Supabase 回應:', { error, data })

      if (error) {
        console.error('Supabase 錯誤詳情:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        alert('儲存失敗：' + error.message)
        setSavingProfile(false)
        return
      }

      // 刷新 AuthContext 的 profile，讓新文章使用新的顯示名稱
      await refreshProfile()
      
      // 重新載入個人資料表單（更新顯示）
      await loadProfileForm()
      
      // 詢問是否要同時更新舊文章的作者名稱
      const newName = profileForm.display_name.trim()
      if (newName && confirm(`個人資料已儲存！\n\n是否要同時更新您所有舊文章的作者名稱為「${newName}」？`)) {
        try {
          const response = await fetch('/api/posts/update-author', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              authorId: user.id,
              newAuthorName: newName,
            }),
          })
          const result = await response.json()
          if (result.success && result.updated > 0) {
            // 只有在實際更新了文章時才顯示訊息
            alert(result.message)
            fetchArticles() // 重新載入文章列表
          }
          // 如果 updated 為 0，不顯示任何訊息（靜默處理）
        } catch (e) {
          alert('更新文章作者時發生錯誤')
        }
      }
      
      setAvatarFile(null)
      
      // 跳回管理頁面首頁（切換到文章 Tab）
      setActiveTab('articles')

      /* 舊的重試機制 - 暫時停用
      // 重試機制
      let retries = 2
      let lastError: Error | null = null
      
      while (retries > 0) {
        try {
          const { error } = await supabase
            .from('profiles')
            .upsert(updateData, { onConflict: 'id' })

          if (error) {
            // 如果是欄位不存在的錯誤，嘗試只更新基本欄位
            if (error.message?.includes('does not exist')) {
              const { error: basicError } = await supabase
                .from('profiles')
                .upsert({
                  id: user.id,
                  display_name: profileForm.display_name || null,
                  avatar_url: avatarUrl || null,
                  is_public: profileForm.is_public,
                }, { onConflict: 'id' })
              
              if (basicError) {
                console.warn('儲存個人資料警告:', basicError.message)
                alert('儲存失敗：' + basicError.message)
              } else {
                alert('個人資料已儲存！（部分欄位可能需要資料庫更新）')
                setAvatarFile(null)
              }
            } else {
              console.warn('儲存個人資料警告:', error.message)
              alert('儲存失敗：' + error.message)
            }
          } else {
            alert('個人資料已儲存！')
            setAvatarFile(null)
          }
          break // 成功，跳出迴圈
        } catch (e) {
          lastError = e as Error
          retries--
          if (retries > 0) {
            // 等待 500ms 後重試
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }
      }
      
      if (retries === 0 && lastError) {
        // 如果是 AbortError，給用戶更友善的訊息
        if (lastError.name === 'AbortError') {
          alert('連線逾時，請稍後再試')
        } else {
          alert('儲存時發生錯誤：' + lastError.message)
        }
      }
      */ // 舊的重試機制結束
    } catch (e) {
      const err = e as Error
      console.error('儲存個人資料例外:', err.name, err.message, err)
      if (err.name === 'AbortError') {
        alert('連線逾時，請重新整理頁面後再試')
      } else {
        alert('儲存時發生錯誤：' + err.message)
      }
    }
    
    setSavingProfile(false)
  }

  // 處理頭像選擇
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 更改密碼
  const handleChangePassword = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)

    // 驗證
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('請填寫所有欄位')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('新密碼至少需要 6 個字元')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('兩次輸入的新密碼不一致')
      return
    }

    setChangingPassword(true)

    try {
      // 先用當前密碼重新驗證
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordForm.currentPassword,
      })

      if (signInError) {
        setPasswordError('目前密碼不正確')
        setChangingPassword(false)
        return
      }

      // 更新密碼
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      })

      if (updateError) {
        setPasswordError(updateError.message)
        setChangingPassword(false)
        return
      }

      // 成功
      setPasswordSuccess(true)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      
      // 3 秒後關閉 Modal
      setTimeout(() => {
        setShowChangePassword(false)
        setPasswordSuccess(false)
      }, 2000)

    } catch {
      setPasswordError('發生未知錯誤，請稍後再試')
    }

    setChangingPassword(false)
  }

  // 新增專長
  const addExpertise = () => {
    if (newExpertise.trim() && !profileForm.expertise.includes(newExpertise.trim())) {
      setProfileForm(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }))
      setNewExpertise('')
    }
  }

  // 移除專長
  const removeExpertise = (skill: string) => {
    setProfileForm(prev => ({
      ...prev,
      expertise: prev.expertise.filter(s => s !== skill)
    }))
  }

  // 開啟新增文章 Modal
  const openNewArticleModal = () => {
    setEditingArticle(null)
    setArticleForm({
      title: '',
      excerpt: '',
      content: '',
      category: '教育理念',
      image_url: '',
      status: 'published',
      featured: false
    })
    setShowArticleModal(true)
  }

  // 開啟編輯文章 Modal（從 Notion 獲取完整內容）
  const openEditArticleModal = async (article: Article) => {
    setEditingArticle(article)
    
    // 先用本地資料顯示
    setArticleForm({
      title: article.title,
      excerpt: article.excerpt || '',
      content: article.content || '',
      category: article.category,
      image_url: article.image_url || '',
      status: article.status,
      featured: article.featured || false
    })
    setShowArticleModal(true)
    
    // 從 API 獲取完整內容（包括 Notion 頁面內容）
    try {
      const response = await fetch(`/api/posts/${article.id}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        // 優先使用 Notion 頁面內容（htmlContent），如果沒有則使用「內容」欄位
        const contentToUse = result.data.htmlContent?.trim() 
          ? result.data.htmlContent 
          : (result.data.content || '')
        
        setArticleForm(prev => ({
          ...prev,
          content: contentToUse,
          featured: result.data.featured || false
        }))
      }
    } catch (error) {
      console.error('獲取文章內容失敗:', error)
      // 失敗時使用本地資料，不影響編輯
    }
  }

// 儲存文章 (Notion)
  const saveArticle = async () => {
    // 驗證標題（必填）
    if (!articleForm.title.trim()) {
      alert('請填寫標題')
      return
    }

    // 檢查內容是否有實際文字（移除 HTML 標籤後檢查）
    const plainTextContent = articleForm.content
      .replace(/<[^>]*>/g, '')  // 移除 HTML 標籤
      .replace(/&nbsp;/g, ' ')   // 替換 &nbsp;
      .trim()

    // 內容為選填，可以之後在 Notion 或後台編輯器補充
    // （移除強制要求內容的驗證）

    setSavingArticle(true)

    // 優先使用後台設定的顯示名稱，其次是註冊時的全名，最後才是 email
    const authorName = profile?.display_name || profile?.full_name || user?.user_metadata?.full_name || user?.email || '匿名'
    console.log('文章作者名稱來源:', {
      'profile.display_name': profile?.display_name,
      'profile.full_name': profile?.full_name,
      'user_metadata.full_name': user?.user_metadata?.full_name,
      'user.email': user?.email,
      '最終使用': authorName
    })
    const authorId = user?.id || ''

    // 轉換狀態格式：published -> 已發佈, draft -> 草稿, archived -> 已封存
    const notionStatus = articleForm.status === 'published' ? '已發佈' : 
                         articleForm.status === 'draft' ? '草稿' : '已封存'

    try {
      if (editingArticle) {
        // 更新文章 - 只傳送有變更的欄位
        const updateData: Record<string, unknown> = {
          title: articleForm.title,
          excerpt: articleForm.excerpt || '',
          category: articleForm.category,
          imageUrl: articleForm.image_url || '',
          status: notionStatus,
          featured: articleForm.featured,
          author: authorName, // 自動更新作者名稱
        }
        
        // 只有當編輯器有實際內容時才更新 content 欄位
        if (plainTextContent) {
          updateData.content = articleForm.content
        }
        
        const response = await fetch(`/api/posts/${editingArticle.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
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
            featured: articleForm.featured,
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
      in_progress: {
        color: 'bg-paper border-black',
        icon: <Clock className="w-4 h-4" strokeWidth={1.5} />,
        label: '處理中'
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
      cancelled: {
        color: 'bg-paper border-black',
        icon: <XCircle className="w-4 h-4" strokeWidth={1.5} />,
        label: '已取消'
      },
      completed: {
        color: 'bg-black text-paper border-black',
        icon: <CheckCircle className="w-4 h-4" strokeWidth={1.5} />,
        label: '已完成'
      },
      replied: {
        color: 'bg-black text-paper border-black',
        icon: <CheckCircle className="w-4 h-4" strokeWidth={1.5} />,
        label: '已回覆'
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
              onClick={() => setActiveTab('profile')}
              className={`flex-shrink-0 px-6 py-4 text-sm font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-black text-paper'
                  : 'bg-paper text-black hover:bg-black/5'
              }`}
            >
              <User className="w-4 h-4" strokeWidth={1.5} />
              個人資料
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`flex-shrink-0 px-6 py-4 text-sm font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border-l-2 border-black ${
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
            <button
              onClick={() => setActiveTab('lecturePlans')}
              className={`flex-shrink-0 px-6 py-4 text-sm font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border-l-2 border-black ${
                activeTab === 'lecturePlans'
                  ? 'bg-black text-paper'
                  : 'bg-paper text-black hover:bg-black/5'
              }`}
            >
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              講座規劃
              <span className={`px-2 py-0.5 text-xs ${
                activeTab === 'lecturePlans' ? 'bg-paper text-black' : 'bg-black text-paper'
              }`}>
                {lecturePlans.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('faqInquiries')}
              className={`flex-shrink-0 px-6 py-4 text-sm font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border-l-2 border-black ${
                activeTab === 'faqInquiries'
                  ? 'bg-black text-paper'
                  : 'bg-paper text-black hover:bg-black/5'
              }`}
            >
              <HelpCircle className="w-4 h-4" strokeWidth={1.5} />
              諮詢管理
              <span className={`px-2 py-0.5 text-xs ${
                activeTab === 'faqInquiries' ? 'bg-paper text-black' : 'bg-black text-paper'
              }`}>
                {faqInquiries.length}
              </span>
            </button>
            {profile?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('siteSettings')}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border-l-2 border-black ${
                  activeTab === 'siteSettings'
                    ? 'bg-black text-paper'
                    : 'bg-paper text-black hover:bg-black/5'
                }`}
              >
                <Globe className="w-4 h-4" strokeWidth={1.5} />
                網站設定
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' ? (
            <>
              {/* Profile Header */}
              <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-paper">
                <div>
                  <h2 className="font-serif text-lg font-bold text-black">個人資料設定</h2>
                  <p className="text-sm text-ink-muted">編輯您的公開講師頁面資料</p>
                </div>
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="btn-editorial text-sm"
                >
                  {savingProfile ? (
                    <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Save className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  <span>{savingProfile ? '儲存中...' : '儲存資料'}</span>
                </button>
              </div>

              {/* Profile Form */}
              <div className="p-6 space-y-8">
                {/* 頭像 */}
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 border-2 border-black overflow-hidden bg-paper-dark">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="頭像預覽" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          👨‍🏫
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                      頭像照片
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="block w-full text-sm text-ink-muted file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-sm file:font-medium file:bg-paper file:text-black hover:file:bg-black hover:file:text-paper file:cursor-pointer file:transition-colors"
                    />
                    <p className="text-xs text-ink-muted mt-2">
                      建議尺寸：1200 x 900 像素（4:3 比例），支援 JPG、PNG 格式，檔案大小建議 200KB 以內
                    </p>
                  </div>
                </div>

                {/* 顯示名稱 */}
                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                    顯示名稱 *
                  </label>
                  <input
                    type="text"
                    value={profileForm.display_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, display_name: e.target.value }))}
                    className="input-editorial"
                    placeholder="例如：王小明老師"
                  />
                </div>

                {/* 職稱 */}
                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                    職稱
                  </label>
                  <input
                    type="text"
                    value={profileForm.title}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, title: e.target.value }))}
                    className="input-editorial"
                    placeholder="例如：資深教育顧問 / 創新教學專家"
                  />
                </div>

                {/* 簡短自介 */}
                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                    簡短自介
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="input-editorial resize-none"
                    rows={2}
                    placeholder="一句話介紹自己（顯示在講師列表）"
                  />
                </div>

                {/* 詳細自介 */}
                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                    詳細自介
                  </label>
                  <textarea
                    value={profileForm.bio_long}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio_long: e.target.value }))}
                    className="input-editorial resize-none"
                    rows={6}
                    placeholder="詳細的個人介紹，會顯示在您的講師頁面（可使用換行分段）"
                  />
                </div>

                {/* 專長領域 */}
                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                    專長領域
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                      className="input-editorial flex-1"
                      placeholder="輸入專長後按 Enter 新增"
                    />
                    <button
                      type="button"
                      onClick={addExpertise}
                      className="btn-editorial-outline"
                    >
                      <Plus className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                  {profileForm.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profileForm.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-black text-paper text-sm"
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
                </div>

                {/* 公開設定 */}
                <div className="border-t-2 border-black pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setProfileForm(prev => ({ ...prev, is_public: !prev.is_public }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        profileForm.is_public ? 'bg-black' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          profileForm.is_public ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <div>
                      <span className="font-medium">公開講師頁面</span>
                      <p className="text-sm text-ink-muted">
                        {profileForm.is_public 
                          ? '您的講師頁面已公開，訪客可以在「講師陣容」頁面看到您' 
                          : '您的講師頁面目前隱藏，不會顯示在公開頁面'}
                      </p>
                    </div>
                  </label>
                </div>

                {/* 講師頁面連結 */}
                {user && (
                  <div className="border-t-2 border-black pt-6">
                    <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                      您的講師頁面連結
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/lecturer/${user.id}`}
                        readOnly
                        className="input-editorial flex-1 bg-paper-dark"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/lecturer/${user.id}`)
                          alert('已複製連結！')
                        }}
                        className="btn-editorial-outline"
                      >
                        複製
                      </button>
                    </div>
                  </div>
                )}

                {/* 更改密碼 */}
                <div className="border-t-2 border-black pt-6">
                  <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                    帳號安全
                  </label>
                  <p className="text-sm text-ink-muted mb-4">
                    定期更換密碼可以保護您的帳號安全
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(true)}
                    className="btn-editorial-outline"
                  >
                    <Lock className="w-4 h-4" strokeWidth={1.5} />
                    <span>更改密碼</span>
                  </button>
                </div>
              </div>
            </>
          ) : activeTab === 'articles' ? (
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
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-serif text-lg font-bold text-black truncate">
                              {article.title}
                            </h3>
                            {article.featured && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-black text-paper text-xs uppercase tracking-wider">
                                <Star className="w-3 h-3" strokeWidth={1.5} fill="currentColor" />
                                精選
                              </span>
                            )}
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

                          {/* Notion 連結與刪除 */}
                          <div className="flex items-center gap-3">
                            {request.url && (
                              <a
                                href={request.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-ink-muted hover:text-black underline"
                              >
                                在 Notion 中開啟 →
                              </a>
                            )}
                            <button
                              onClick={() => deleteLectureRequest(request.id, request.schoolName)}
                              disabled={deletingLectureRequestId === request.id}
                              className="p-1.5 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                              title="刪除此邀約"
                            >
                              {deletingLectureRequestId === request.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" strokeWidth={1.5} />
                              ) : (
                                <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : activeTab === 'lecturePlans' ? (
            <>
              {/* Lecture Plans Header */}
              <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-paper">
                <div>
                  <h2 className="font-serif text-lg font-bold text-black">講座規劃申請</h2>
                  <p className="text-sm text-ink-muted">
                    客製化講座規劃需求（待處理：{lecturePlans.filter(p => p.status === 'pending').length}）
                  </p>
                </div>
                <button
                  onClick={fetchLecturePlans}
                  disabled={loadingLecturePlans}
                  className="btn-editorial-outline text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingLecturePlans ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                  <span>重新整理</span>
                </button>
              </div>

              {lecturePlanError && (
                <div className="p-4 bg-red-50 border-b-2 border-black text-red-800">
                  載入失敗：{lecturePlanError}
                </div>
              )}

              {loadingLecturePlans ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
                  <p className="text-ink-muted text-sm uppercase tracking-wider">載入講座規劃申請中...</p>
                </div>
              ) : lecturePlans.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-ink-muted mx-auto mb-4" strokeWidth={1} />
                  <p className="text-ink-muted">目前沒有任何講座規劃申請</p>
                </div>
              ) : (
                <div className="divide-y-2 divide-black/10">
                  {lecturePlans.map((plan) => (
                    <div key={plan.id} className="px-6 py-5 hover:bg-paper-dark transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* 主要資訊 */}
                        <div className="flex-1 min-w-0">
                          {/* 標題列 */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 border-2 border-black">
                              <FileText className="w-5 h-5 text-black" strokeWidth={1.5} />
                            </div>
                            <div>
                              <h3 className="font-serif text-lg font-bold text-black">
                                講座規劃需求
                              </h3>
                              <p className="text-sm text-ink-muted">
                                {formatDateTime(plan.created_at)}
                              </p>
                            </div>
                          </div>

                          {/* 詳細資訊 */}
                          <div className="space-y-3 mb-4">
                            {/* 對象與人數 */}
                            <div>
                              <p className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-1">對象與人數</p>
                              <p className="text-black">{plan.audience}</p>
                            </div>

                            {/* 核心痛點或需求 */}
                            <div>
                              <p className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-1">核心痛點或需求</p>
                              <p className="text-black whitespace-pre-wrap">{plan.pain_points}</p>
                            </div>

                            {/* 經費預算與時數限制 */}
                            <div>
                              <p className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-1">經費預算與時數限制</p>
                              <p className="text-black">{plan.budget}</p>
                            </div>

                            {/* 聯絡 Email */}
                            <div>
                              <p className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-1">聯絡 Email</p>
                              <div className="flex items-center gap-2 text-black">
                                <Mail className="w-4 h-4 text-ink-muted" strokeWidth={1.5} />
                                <a href={`mailto:${plan.contact_email}`} className="hover:underline">
                                  {plan.contact_email}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 右側狀態 */}
                        <div className="lg:w-48 flex-shrink-0">
                          <div className="flex flex-col gap-3">
                            {/* 狀態標籤 */}
                            <div>
                              {getStatusBadge(plan.status)}
                            </div>

                            {/* 操作按鈕 */}
                            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                              {['pending', 'in_progress', 'completed', 'cancelled'].map((status) => {
                                const statusLabels: Record<string, string> = {
                                  pending: '待處理',
                                  in_progress: '處理中',
                                  completed: '已完成',
                                  cancelled: '已取消',
                                }
                                return (
                                  <button
                                    key={status}
                                    onClick={async () => {
                                      try {
                                        const response = await fetch('/api/lecture-plans', {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ id: plan.id, status }),
                                        })
                                        const result = await response.json()
                                        if (result.success) {
                                          fetchLecturePlans()
                                        } else {
                                          alert('更新失敗：' + result.error)
                                        }
                                      } catch (error) {
                                        alert('更新時發生錯誤')
                                      }
                                    }}
                                    disabled={plan.status === status}
                                    className={`px-2 py-1 text-xs border transition-colors ${
                                      plan.status === status
                                        ? 'border-black bg-black text-paper cursor-default'
                                        : 'border-black/30 hover:border-black hover:bg-black/5'
                                    } disabled:opacity-50`}
                                  >
                                    {statusLabels[status]}
                                  </button>
                                )
                              })}
                            </div>
                            
                            {/* 刪除按鈕 */}
                            <button
                              onClick={() => deleteLecturePlan(plan.id, plan.contact_email)}
                              disabled={deletingLecturePlanId === plan.id}
                              className="p-1.5 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                              title="刪除此申請"
                            >
                              {deletingLecturePlanId === plan.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" strokeWidth={1.5} />
                              ) : (
                                <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : activeTab === 'faqInquiries' ? (
            <>
              {/* FAQ Inquiries Header */}
              <div className="px-6 py-4 border-b-2 border-black bg-paper">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-black">諮詢管理</h2>
                    <p className="text-sm text-ink-muted">
                      來自常見問題頁面的諮詢留言（待處理：{faqInquiries.filter(i => i.status === 'pending').length}）
                    </p>
                  </div>
                  <button
                    onClick={fetchFaqInquiries}
                    disabled={loadingFaqInquiries}
                    className="btn-editorial-outline text-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingFaqInquiries ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                    <span>重新整理</span>
                  </button>
                </div>
                
                {/* 過濾器 */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium uppercase tracking-wider text-black">
                    篩選：
                  </label>
                  <select
                    value={filterLecturerId}
                    onChange={(e) => setFilterLecturerId(e.target.value as string | 'all')}
                    className="px-4 py-2 border-2 border-black bg-paper text-black focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  >
                    <option value="all">全部諮詢</option>
                    <option value="null">一般網站諮詢</option>
                    {lecturers.map((lecturer) => (
                      <option key={lecturer.id} value={lecturer.id}>
                        給 {lecturer.display_name || lecturer.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {faqInquiryError && (
                <div className="p-4 bg-red-50 border-b-2 border-black text-red-800">
                  載入失敗：{faqInquiryError}
                </div>
              )}

              {loadingFaqInquiries ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
                  <p className="text-ink-muted text-sm uppercase tracking-wider">載入諮詢中...</p>
                </div>
              ) : faqInquiries.length === 0 ? (
                <div className="p-12 text-center">
                  <HelpCircle className="w-12 h-12 text-ink-muted mx-auto mb-4" strokeWidth={1} />
                  <p className="text-ink-muted">目前沒有任何諮詢留言</p>
                </div>
              ) : (
                <div className="divide-y-2 divide-black/10">
                  {faqInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="px-6 py-5 hover:bg-paper-dark transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* 主要資訊 */}
                        <div className="flex-1 min-w-0">
                          {/* 標題列 */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 border-2 border-black">
                              <MessageCircle className="w-5 h-5 text-black" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-serif text-lg font-bold text-black">
                                  {inquiry.name}
                                </h3>
                                {inquiry.target_lecturer_id && inquiry.lecturer_name && (
                                  <span className="px-2 py-0.5 text-xs bg-black text-paper uppercase tracking-wider">
                                    給 {inquiry.lecturer_name}
                                  </span>
                                )}
                                {!inquiry.target_lecturer_id && (
                                  <span className="px-2 py-0.5 text-xs bg-paper-dark border border-black text-black uppercase tracking-wider">
                                    一般諮詢
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-ink-muted">
                                {formatDateTime(inquiry.created_at)}
                              </p>
                            </div>
                          </div>

                          {/* 詳細資訊 */}
                          <div className="space-y-3 mb-4">
                            {/* Email */}
                            <div>
                              <p className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-1">Email</p>
                              <div className="flex items-center gap-2 text-black">
                                <Mail className="w-4 h-4 text-ink-muted" strokeWidth={1.5} />
                                <a href={`mailto:${inquiry.email}`} className="hover:underline">
                                  {inquiry.email}
                                </a>
                              </div>
                            </div>

                            {/* 疑問內容 */}
                            <div>
                              <p className="text-xs uppercase tracking-wider text-ink-muted font-medium mb-1">疑問內容</p>
                              <p className="text-black whitespace-pre-wrap">{inquiry.content}</p>
                            </div>
                          </div>
                        </div>

                        {/* 右側狀態與操作 */}
                        <div className="lg:w-48 flex-shrink-0">
                          <div className="flex flex-col gap-3">
                            {/* 狀態標籤 */}
                            <div>
                              {getStatusBadge(inquiry.status)}
                            </div>

                            {/* 操作按鈕 */}
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => toggleFaqInquiryStatus(inquiry.id, inquiry.status)}
                                disabled={togglingFaqInquiryId === inquiry.id}
                                className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider border-2 border-black bg-paper text-black hover:bg-black hover:text-paper transition-colors disabled:opacity-50"
                              >
                                {togglingFaqInquiryId === inquiry.id
                                  ? '處理中...'
                                  : inquiry.status === 'pending'
                                  ? '標記為已回覆'
                                  : '標記為待處理'}
                              </button>
                              <a
                                href={`mailto:${inquiry.email}?subject=回覆：${encodeURIComponent(inquiry.name)}的諮詢`}
                                className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider border-2 border-black bg-paper text-black hover:bg-black hover:text-paper transition-colors text-center"
                              >
                                快速回信
                              </a>
                              <button
                                onClick={() => deleteFaqInquiry(inquiry.id)}
                                disabled={deletingFaqInquiryId === inquiry.id}
                                className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider border-2 border-red-600 bg-paper text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                              >
                                {deletingFaqInquiryId === inquiry.id ? '刪除中...' : '刪除'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : activeTab === 'siteSettings' ? (
            <>
              {/* Site Settings Header */}
              <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-paper">
                <div>
                  <h2 className="font-serif text-lg font-bold text-black">網站設定</h2>
                  <p className="text-sm text-ink-muted">管理網站的基本資訊與設定</p>
                </div>
                <button
                  onClick={saveAllSiteSettings}
                  disabled={savingSiteSettings || loadingSiteSettings}
                  className="btn-editorial text-sm"
                >
                  {savingSiteSettings ? (
                    <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Save className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  <span>{savingSiteSettings ? '儲存中...' : '儲存設定'}</span>
                </button>
              </div>

              {loadingSiteSettings ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
                  <p className="text-ink-muted text-sm uppercase tracking-wider">載入設定中...</p>
                </div>
              ) : (
                <div className="p-6 space-y-8">
                  {/* 網站名稱 */}
                  <div>
                    <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                      網站名稱
                    </label>
                    <input
                      type="text"
                      value={siteSettings.site_name || ''}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, site_name: e.target.value }))}
                      className="input-editorial"
                      placeholder="例如：校園講座"
                    />
                  </div>

                  {/* Logo URL */}
                  <div>
                    <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                      Logo 網址（可選）
                    </label>
                    <input
                      type="url"
                      value={siteSettings.site_logo_url || ''}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, site_logo_url: e.target.value }))}
                      className="input-editorial"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  {/* Hero 統計數字 */}
                  <div className="border-t-2 border-black pt-6">
                    <h3 className="font-serif text-lg font-bold text-black mb-4">首頁統計數字</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                          合作講師數
                        </label>
                        <input
                          type="number"
                          value={siteSettings.hero_lecturers_count || ''}
                          onChange={(e) => setSiteSettings(prev => ({ ...prev, hero_lecturers_count: parseInt(e.target.value) || 0 }))}
                          className="input-editorial"
                          placeholder="20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                          場次講座數
                        </label>
                        <input
                          type="number"
                          value={siteSettings.hero_lectures_count || ''}
                          onChange={(e) => setSiteSettings(prev => ({ ...prev, hero_lectures_count: parseInt(e.target.value) || 0 }))}
                          className="input-editorial"
                          placeholder="1200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                          學生參與數（K）
                        </label>
                        <input
                          type="number"
                          value={siteSettings.hero_students_count || ''}
                          onChange={(e) => setSiteSettings(prev => ({ ...prev, hero_students_count: parseInt(e.target.value) || 0 }))}
                          className="input-editorial"
                          placeholder="50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer 資訊 */}
                  <div className="border-t-2 border-black pt-6">
                    <h3 className="font-serif text-lg font-bold text-black mb-4">頁尾聯絡資訊</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={siteSettings.footer_email || ''}
                          onChange={(e) => setSiteSettings(prev => ({ ...prev, footer_email: e.target.value }))}
                          className="input-editorial"
                          placeholder="info@campuslecture.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                          電話
                        </label>
                        <input
                          type="tel"
                          value={siteSettings.footer_phone || ''}
                          onChange={(e) => setSiteSettings(prev => ({ ...prev, footer_phone: e.target.value }))}
                          className="input-editorial"
                          placeholder="(02) 1234-5678"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                          地址
                        </label>
                        <input
                          type="text"
                          value={siteSettings.footer_address || ''}
                          onChange={(e) => setSiteSettings(prev => ({ ...prev, footer_address: e.target.value }))}
                          className="input-editorial"
                          placeholder="台北市大安區"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                          頁尾描述
                        </label>
                        <textarea
                          value={siteSettings.footer_description || ''}
                          onChange={(e) => setSiteSettings(prev => ({ ...prev, footer_description: e.target.value }))}
                          className="input-editorial resize-none"
                          rows={2}
                          placeholder="致力於連結專業講師與校園，為學生帶來啟發性的學習體驗。"
                        />
                      </div>
                    </div>
                  </div>
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

              {/* 精選文章 */}
              <div>
                <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                  首頁精選
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setArticleForm(prev => ({ ...prev, featured: !prev.featured }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      articleForm.featured ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        articleForm.featured ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="flex items-center gap-2">
                    <Star className={`w-4 h-4 ${articleForm.featured ? 'text-black fill-black' : 'text-gray-400'}`} strokeWidth={1.5} />
                    {articleForm.featured ? '顯示於首頁精選專欄' : '不顯示於首頁'}
                  </span>
                </label>
                <p className="text-xs text-ink-muted mt-2">
                  精選文章會優先顯示在首頁的「精選專欄」區塊
                </p>
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

      {/* 更改密碼 Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-paper border-2 border-black shadow-hard max-w-md w-full">
            <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-black">更改密碼</h3>
                <p className="text-sm text-ink-muted">請輸入目前密碼和新密碼</p>
              </div>
              <button
                onClick={() => {
                  setShowChangePassword(false)
                  setPasswordError(null)
                  setPasswordSuccess(false)
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                className="p-2 border-2 border-black hover:bg-black hover:text-paper transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {passwordSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-6 border-2 border-black bg-black flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-paper" strokeWidth={1.5} />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-black mb-2">
                    密碼已更新！
                  </h4>
                  <p className="text-ink-muted">
                    您的密碼已成功更改
                  </p>
                </div>
              ) : (
                <>
                  {/* 目前密碼 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-2">
                      <Lock className="w-4 h-4" strokeWidth={1.5} />
                      目前密碼
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="input-editorial pr-12"
                        placeholder="請輸入目前密碼"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-black transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>

                  {/* 新密碼 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-2">
                      <Lock className="w-4 h-4" strokeWidth={1.5} />
                      新密碼
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="input-editorial pr-12"
                        placeholder="至少 6 個字元"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-black transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>

                  {/* 確認新密碼 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-2">
                      <Lock className="w-4 h-4" strokeWidth={1.5} />
                      確認新密碼
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="input-editorial"
                      placeholder="再次輸入新密碼"
                    />
                  </div>

                  {/* 錯誤訊息 */}
                  {passwordError && (
                    <div className="p-4 border-2 border-black bg-red-50 text-red-800 text-sm">
                      {passwordError}
                    </div>
                  )}

                  {/* 按鈕 */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
                    <button
                      onClick={() => {
                        setShowChangePassword(false)
                        setPasswordError(null)
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      }}
                      className="btn-editorial-outline"
                    >
                      <span>取消</span>
                    </button>
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="btn-editorial"
                    >
                      {changingPassword ? (
                        <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                      ) : (
                        <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                      )}
                      <span>{changingPassword ? '更新中...' : '更新密碼'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
