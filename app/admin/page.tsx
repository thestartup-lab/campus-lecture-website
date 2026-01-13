'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Shield,
  Mail,
  Calendar,
  RefreshCw,
  UserCheck,
  UserX,
  AlertTriangle,
  Phone,
  Briefcase,
  BookOpen,
  FileText,
  X,
  UserPlus,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react'

interface Experience {
  title: string
  organization: string
  date: string
  description?: string
}

interface Instructor {
  id: string
  full_name: string | null
  display_name: string | null
  email: string
  phone: string | null
  title: string | null
  bio: string | null
  bio_long: string | null
  expertise: string[] | null
  experiences: Experience[] | null
  avatar_url: string | null
  social_links: Record<string, string> | null
  role: string
  is_approved: boolean
  is_public: boolean
  created_at: string
  approved_at: string | null
}

interface Article {
  id: string
  title: string
  excerpt: string | null
  content: string
  category: string | null
  image_url: string | null
  status: string
  author_id: string
  author_name?: string
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const { user, profile, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'instructors' | 'articles'>('instructors')
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
  
  // 文章管理
  const [articles, setArticles] = useState<Article[]>([])
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [articleError, setArticleError] = useState<string | null>(null)
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null)
  
  // 新增講師 Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [addingInstructor, setAddingInstructor] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [newInstructor, setNewInstructor] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    title: '',
    bio: '',
    expertise: [] as string[],
  })
  const [newExpertise, setNewExpertise] = useState('')

  // 編輯講師 Modal
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    display_name: '',
    full_name: '',
    title: '',
    phone: '',
    bio: '',
    bio_long: '',
    expertise: [] as string[],
    experiences: [] as Experience[],
    is_public: false,
    avatar_url: '',
    social_links: {} as Record<string, string>,
  })
  const [editExpertise, setEditExpertise] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // 檢查權限
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (!isAdmin) {
        router.push('/dashboard')
      }
    }
  }, [user, loading, isAdmin, router])

  // 獲取所有講師
  const fetchInstructors = async () => {
    setLoadingData(true)
    setError(null)

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('獲取講師錯誤:', profilesError)
      setError(profilesError.message)
      setLoadingData(false)
      return
    }

    const instructorsWithEmail = profiles.map(p => ({
      ...p,
      email: p.id
    }))

    setInstructors(instructorsWithEmail as Instructor[])
    setLoadingData(false)
  }

  useEffect(() => {
    if (user && isAdmin) {
      fetchInstructors()
      fetchArticles()
    }
  }, [user, isAdmin])

  // 獲取所有文章
  const fetchArticles = async () => {
    setLoadingArticles(true)
    setArticleError(null)

    // 獲取文章
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (postsError) {
      console.error('獲取文章錯誤:', postsError)
      setArticleError(postsError.message)
      setLoadingArticles(false)
      return
    }

    // 獲取所有講師資料以對應作者名稱
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, display_name')

    const profileMap = new Map(
      profiles?.map(p => [p.id, p.full_name || p.display_name || '未知作者']) || []
    )

    const articlesWithAuthor = posts.map(post => ({
      ...post,
      author_name: profileMap.get(post.author_id) || '未知作者'
    }))

    setArticles(articlesWithAuthor as Article[])
    setLoadingArticles(false)
  }

  // 刪除文章
  const deleteArticle = async (articleId: string, articleTitle: string) => {
    if (!confirm(`確定要刪除文章「${articleTitle}」嗎？此操作無法復原。`)) {
      return
    }

    setDeletingArticleId(articleId)

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', articleId)

    if (error) {
      console.error('刪除文章錯誤:', error)
      alert(`刪除失敗：${error.message}`)
    } else {
      await fetchArticles()
    }

    setDeletingArticleId(null)
  }

  // 切換文章狀態
  const toggleArticleStatus = async (articleId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    
    const { error } = await supabase
      .from('posts')
      .update({ status: newStatus })
      .eq('id', articleId)

    if (error) {
      console.error('更新狀態錯誤:', error)
      alert(`更新失敗：${error.message}`)
    } else {
      await fetchArticles()
    }
  }

  // 審核通過
  const approveInstructor = async (instructorId: string) => {
    setProcessingId(instructorId)
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_approved: true,
        approved_at: new Date().toISOString(),
        approved_by: user?.id,
        is_public: true
      })
      .eq('id', instructorId)

    if (error) {
      console.error('審核失敗:', error)
      alert(`審核失敗：${error.message}`)
    } else {
      await fetchInstructors()
      setSelectedInstructor(null)
    }
    
    setProcessingId(null)
  }

  // 取消審核
  const revokeApproval = async (instructorId: string) => {
    setProcessingId(instructorId)
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_approved: false,
        approved_at: null,
        approved_by: null,
        is_public: false
      })
      .eq('id', instructorId)

    if (error) {
      console.error('取消審核失敗:', error)
      alert(`取消審核失敗：${error.message}`)
    } else {
      await fetchInstructors()
      setSelectedInstructor(null)
    }
    
    setProcessingId(null)
  }

  // 新增內部講師
  const handleAddInstructor = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingInstructor(true)
    setAddError(null)

    // 驗證
    if (!newInstructor.full_name || !newInstructor.email || !newInstructor.password) {
      setAddError('請填寫所有必填欄位')
      setAddingInstructor(false)
      return
    }

    if (newInstructor.password.length < 6) {
      setAddError('密碼至少需要 6 個字元')
      setAddingInstructor(false)
      return
    }

    try {
      // 1. 註冊用戶
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newInstructor.email,
        password: newInstructor.password,
        options: {
          data: {
            full_name: newInstructor.full_name,
          }
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setAddError('此電子郵件已被註冊')
        } else {
          setAddError(authError.message)
        }
        setAddingInstructor(false)
        return
      }

      if (!authData.user) {
        setAddError('建立帳號失敗，請稍後再試')
        setAddingInstructor(false)
        return
      }

      // 2. 更新 profile 資料（直接設為已審核）
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: newInstructor.full_name,
          display_name: newInstructor.full_name,
          phone: newInstructor.phone || null,
          title: newInstructor.title || null,
          bio: newInstructor.bio || null,
          expertise: newInstructor.expertise.length > 0 ? newInstructor.expertise : null,
          role: 'instructor',
          is_approved: true, // 直接審核通過
          is_public: true,   // 直接公開
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq('id', authData.user.id)

      if (profileError) {
        console.error('更新 profile 錯誤:', profileError)
        // 帳號已創建，但 profile 更新失敗
        setAddError('帳號已建立，但資料更新失敗，請手動審核')
      }

      // 成功
      setShowAddModal(false)
      setNewInstructor({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        title: '',
        bio: '',
        expertise: [],
      })
      await fetchInstructors()
      alert('內部講師已成功新增並自動審核通過！')

    } catch (err) {
      console.error('新增講師錯誤:', err)
      setAddError('新增過程中發生錯誤')
    }

    setAddingInstructor(false)
  }

  // 新增專長
  const addExpertise = () => {
    if (newExpertise.trim() && !newInstructor.expertise.includes(newExpertise.trim())) {
      setNewInstructor(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }))
      setNewExpertise('')
    }
  }

  // 移除專長
  const removeExpertise = (skill: string) => {
    setNewInstructor(prev => ({
      ...prev,
      expertise: prev.expertise.filter(s => s !== skill)
    }))
  }

  // 開啟編輯講師 Modal
  const openEditModal = (instructor: Instructor) => {
    setEditingInstructor(instructor)
    setEditForm({
      display_name: instructor.display_name || '',
      full_name: instructor.full_name || '',
      title: instructor.title || '',
      phone: instructor.phone || '',
      bio: instructor.bio || '',
      bio_long: instructor.bio_long || '',
      expertise: instructor.expertise || [],
      experiences: instructor.experiences || [],
      is_public: instructor.is_public || false,
      avatar_url: instructor.avatar_url || '',
      social_links: instructor.social_links || {},
    })
    setAvatarPreview(instructor.avatar_url || null)
    setAvatarFile(null)
    setEditError(null)
  }

  // 關閉編輯 Modal
  const closeEditModal = () => {
    setEditingInstructor(null)
    setEditError(null)
    setAvatarFile(null)
    setAvatarPreview(null)
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

  // 編輯專長操作
  const addEditExpertise = () => {
    if (editExpertise.trim() && !editForm.expertise.includes(editExpertise.trim())) {
      setEditForm(prev => ({
        ...prev,
        expertise: [...prev.expertise, editExpertise.trim()]
      }))
      setEditExpertise('')
    }
  }

  const removeEditExpertise = (skill: string) => {
    setEditForm(prev => ({
      ...prev,
      expertise: prev.expertise.filter(s => s !== skill)
    }))
  }

  // 經歷操作
  const addExperience = () => {
    setEditForm(prev => ({
      ...prev,
      experiences: [...prev.experiences, { title: '', organization: '', date: '', description: '' }]
    }))
  }

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setEditForm(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const removeExperience = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }))
  }

  // 儲存編輯
  const saveInstructorEdit = async () => {
    if (!editingInstructor) return
    
    setSavingEdit(true)
    setEditError(null)

    try {
      let avatarUrl = editForm.avatar_url

      // 如果有新頭像，先上傳
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${editingInstructor.id}-${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true })

        if (uploadError) {
          throw new Error(`頭像上傳失敗：${uploadError.message}`)
        }

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        avatarUrl = urlData.publicUrl
      }

      // 更新講師資料
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name || null,
          full_name: editForm.full_name || null,
          title: editForm.title || null,
          phone: editForm.phone || null,
          bio: editForm.bio || null,
          bio_long: editForm.bio_long || null,
          expertise: editForm.expertise.length > 0 ? editForm.expertise : null,
          experiences: editForm.experiences.length > 0 ? editForm.experiences : null,
          is_public: editForm.is_public,
          avatar_url: avatarUrl || null,
          social_links: Object.keys(editForm.social_links).length > 0 ? editForm.social_links : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingInstructor.id)

      if (error) {
        throw new Error(error.message)
      }

      // 成功
      await fetchInstructors()
      closeEditModal()
      alert('講師資料已更新！')

    } catch (err) {
      console.error('儲存編輯錯誤:', err)
      setEditError(err instanceof Error ? err.message : '儲存失敗')
    } finally {
      setSavingEdit(false)
    }
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

  // 統計數據
  const stats = {
    total: instructors.length,
    pending: instructors.filter(i => !i.is_approved && i.role !== 'admin').length,
    approved: instructors.filter(i => i.is_approved).length,
    admins: instructors.filter(i => i.role === 'admin').length,
    totalArticles: articles.length,
    publishedArticles: articles.filter(a => a.status === 'published').length,
    draftArticles: articles.filter(a => a.status === 'draft').length,
  }

  // 載入中
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

  // 非管理員
  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <div className="bg-black text-paper border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8" strokeWidth={1.5} />
                <span className="text-sm uppercase tracking-wider text-paper/70">Admin Panel</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold">管理員後台</h1>
              <p className="text-paper/70 mt-2">
                管理講師帳號審核與系統設定
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-editorial bg-paper text-black border-paper hover:bg-transparent hover:text-paper"
              >
                <UserPlus className="w-4 h-4" strokeWidth={1.5} />
                <span>新增內部講師</span>
              </button>
              <button
                onClick={fetchInstructors}
                disabled={loadingData}
                className="p-2 border-2 border-paper text-paper hover:bg-paper hover:text-black transition-colors"
                title="重新整理"
              >
                <RefreshCw className={`w-5 h-5 ${loadingData ? 'animate-spin' : ''}`} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-editorial p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 border-2 border-black">
                <Users className="w-6 h-6 text-black" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-muted">總用戶數</p>
                <p className="font-serif text-2xl font-bold text-black">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="card-editorial p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 border-2 border-black">
                <Clock className="w-6 h-6 text-black" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-muted">待審核</p>
                <p className="font-serif text-2xl font-bold text-black">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="card-editorial p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 border-2 border-black bg-black">
                <CheckCircle className="w-6 h-6 text-paper" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-muted">已審核</p>
                <p className="font-serif text-2xl font-bold text-black">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="card-editorial p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 border-2 border-black bg-black">
                <Shield className="w-6 h-6 text-paper" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-muted">管理員</p>
                <p className="font-serif text-2xl font-bold text-black">{stats.admins}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals Alert */}
        {stats.pending > 0 && activeTab === 'instructors' && (
          <div className="mb-6 p-4 border-2 border-black bg-paper flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-black flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-black">
                有 {stats.pending} 位講師等待審核
              </p>
              <p className="text-sm text-ink-muted">
                點擊「查看詳情」檢視申請資料並進行審核
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b-2 border-black mb-6">
          <button
            onClick={() => setActiveTab('instructors')}
            className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'instructors'
                ? 'bg-black text-paper'
                : 'bg-paper text-black hover:bg-black/5'
            }`}
          >
            <Users className="w-4 h-4" strokeWidth={1.5} />
            講師管理
            {stats.pending > 0 && (
              <span className={`px-2 py-0.5 text-xs ${
                activeTab === 'instructors' ? 'bg-paper text-black' : 'bg-yellow-500 text-white'
              }`}>
                {stats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'articles'
                ? 'bg-black text-paper'
                : 'bg-paper text-black hover:bg-black/5'
            }`}
          >
            <BookOpen className="w-4 h-4" strokeWidth={1.5} />
            文章管理
            <span className={`px-2 py-0.5 text-xs ${
              activeTab === 'articles' ? 'bg-paper text-black' : 'bg-black text-paper'
            }`}>
              {stats.totalArticles}
            </span>
          </button>
        </div>

        {/* Instructors Table */}
        {activeTab === 'instructors' && (
        <div className="card-editorial overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-black">講師管理</h2>
              <p className="text-sm text-ink-muted">審核和管理所有講師帳號</p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-b-2 border-black text-red-800">
              載入失敗：{error}
            </div>
          )}

          {loadingData ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
              <p className="text-ink-muted text-sm uppercase tracking-wider">載入用戶資料中...</p>
            </div>
          ) : instructors.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-ink-muted mx-auto mb-4" strokeWidth={1} />
              <p className="text-ink-muted">目前沒有任何用戶</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-black/10">
              {instructors.map((instructor) => (
                <div key={instructor.id}>
                  <div className="px-6 py-4 hover:bg-paper-dark transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border-2 border-black ${
                          instructor.role === 'admin' ? 'bg-black text-paper' : 'bg-paper text-black'
                        }`}>
                          {instructor.role === 'admin' ? (
                            <Shield className="w-6 h-6" strokeWidth={1.5} />
                          ) : (
                            <Users className="w-6 h-6" strokeWidth={1.5} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif font-bold text-black text-lg truncate">
                            {instructor.full_name || instructor.display_name || '未命名'}
                          </p>
                          <p className="text-sm text-ink-muted truncate">
                            {instructor.title || (instructor.role === 'admin' ? '系統管理員' : '講師申請者')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {instructor.role === 'admin' ? (
                          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-black text-paper border-2 border-black">
                            <Shield className="w-4 h-4" strokeWidth={1.5} />
                            管理員
                          </span>
                        ) : instructor.is_approved ? (
                          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-black text-paper border-2 border-black">
                            <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                            已審核
                          </span>
                        ) : (
                          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-yellow-50 text-yellow-800 border-2 border-yellow-600">
                            <Clock className="w-4 h-4" strokeWidth={1.5} />
                            待審核
                          </span>
                        )}

                        <button
                          onClick={() => openEditModal(instructor)}
                          className="btn-editorial-outline text-sm py-2 px-3"
                          title="編輯講師資料"
                        >
                          <Edit className="w-4 h-4" strokeWidth={1.5} />
                          <span className="hidden sm:inline">編輯</span>
                        </button>
                        {instructor.role !== 'admin' && (
                          <button
                            onClick={() => setSelectedInstructor(instructor)}
                            className="btn-editorial-outline text-sm py-2 px-3"
                          >
                            <FileText className="w-4 h-4" strokeWidth={1.5} />
                            <span className="hidden sm:inline">審核</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" strokeWidth={1.5} />
                        {formatDateTime(instructor.created_at)}
                      </span>
                      {instructor.expertise && instructor.expertise.length > 0 && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                          {instructor.expertise.slice(0, 3).join('、')}
                          {instructor.expertise.length > 3 && `...+${instructor.expertise.length - 3}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Articles Table */}
        {activeTab === 'articles' && (
        <div className="card-editorial overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-black">文章管理</h2>
              <p className="text-sm text-ink-muted">
                管理所有講師發布的文章（已發布：{stats.publishedArticles}，草稿：{stats.draftArticles}）
              </p>
            </div>
            <button
              onClick={fetchArticles}
              disabled={loadingArticles}
              className="p-2 border-2 border-black hover:bg-black hover:text-paper transition-colors"
              title="重新整理"
            >
              <RefreshCw className={`w-5 h-5 ${loadingArticles ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            </button>
          </div>

          {articleError && (
            <div className="p-4 bg-red-50 border-b-2 border-black text-red-800">
              載入失敗：{articleError}
            </div>
          )}

          {loadingArticles ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
              <p className="text-ink-muted text-sm uppercase tracking-wider">載入文章資料中...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-ink-muted mx-auto mb-4" strokeWidth={1} />
              <p className="text-ink-muted">目前沒有任何文章</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-black/10">
              {articles.map((article) => (
                <div key={article.id} className="px-6 py-4 hover:bg-paper-dark transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-serif font-bold text-black text-lg truncate">
                          {article.title}
                        </h3>
                        {article.status === 'published' ? (
                          <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-black text-paper border border-black">
                            <Eye className="w-3 h-3" strokeWidth={1.5} />
                            已發布
                          </span>
                        ) : (
                          <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-paper text-ink-muted border border-black/30">
                            <EyeOff className="w-3 h-3" strokeWidth={1.5} />
                            草稿
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-ink-muted line-clamp-2 mb-2">
                        {article.excerpt || article.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>

                      <div className="flex flex-wrap gap-4 text-xs text-ink-muted">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" strokeWidth={1.5} />
                          {article.author_name}
                        </span>
                        {article.category && (
                          <span className="px-2 py-0.5 bg-black/5 border border-black/20">
                            {article.category}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" strokeWidth={1.5} />
                          {formatDateTime(article.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleArticleStatus(article.id, article.status)}
                        className={`p-2 border-2 transition-colors ${
                          article.status === 'published'
                            ? 'border-black hover:bg-black hover:text-paper'
                            : 'border-black/30 hover:border-black hover:bg-black hover:text-paper'
                        }`}
                        title={article.status === 'published' ? '設為草稿' : '發布文章'}
                      >
                        {article.status === 'published' ? (
                          <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                        ) : (
                          <Eye className="w-4 h-4" strokeWidth={1.5} />
                        )}
                      </button>
                      <button
                        onClick={() => deleteArticle(article.id, article.title)}
                        disabled={deletingArticleId === article.id}
                        className="p-2 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                        title="刪除文章"
                      >
                        {deletingArticleId === article.id ? (
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
        </div>
        )}
      </div>

      {/* 詳情 Modal */}
      {selectedInstructor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-paper border-2 border-black shadow-hard max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between sticky top-0 bg-paper">
              <div>
                <h3 className="font-serif text-xl font-bold text-black">講師申請詳情</h3>
                <p className="text-sm text-ink-muted">審核申請者的完整資料</p>
              </div>
              <button
                onClick={() => setSelectedInstructor(null)}
                className="p-2 border-2 border-black hover:bg-black hover:text-paper transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase tracking-wider text-ink-muted">申請狀態</span>
                {selectedInstructor.is_approved ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-black text-paper border-2 border-black">
                    <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                    已審核通過
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-yellow-50 text-yellow-800 border-2 border-yellow-600">
                    <Clock className="w-4 h-4" strokeWidth={1.5} />
                    待審核
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-serif font-bold text-black border-b-2 border-black pb-2 flex items-center gap-2">
                  <Users className="w-5 h-5" strokeWidth={1.5} />
                  基本資訊
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ink-muted mb-1">姓名</p>
                    <p className="font-medium text-black">{selectedInstructor.full_name || '未填寫'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ink-muted mb-1">電話</p>
                    <p className="font-medium text-black">{selectedInstructor.phone || '未填寫'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase tracking-wider text-ink-muted mb-1">申請時間</p>
                    <p className="font-medium text-black">{formatDateTime(selectedInstructor.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-serif font-bold text-black border-b-2 border-black pb-2 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" strokeWidth={1.5} />
                  專業背景
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ink-muted mb-1">職稱/頭銜</p>
                    <p className="font-medium text-black">{selectedInstructor.title || '未填寫'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ink-muted mb-2">專長領域</p>
                    {selectedInstructor.expertise && selectedInstructor.expertise.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedInstructor.expertise.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-black text-paper text-sm border-2 border-black">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-ink-muted">未填寫</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ink-muted mb-1">簡短自我介紹</p>
                    <p className="text-black leading-relaxed whitespace-pre-wrap">
                      {selectedInstructor.bio || '未填寫'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ink-muted mb-1">申請動機 / 詳細說明</p>
                    <p className="text-black leading-relaxed whitespace-pre-wrap">
                      {selectedInstructor.bio_long || '未填寫'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t-2 border-black bg-paper-dark flex items-center justify-end gap-3 sticky bottom-0">
              <button onClick={() => setSelectedInstructor(null)} className="btn-editorial-outline">
                <span>關閉</span>
              </button>
              {selectedInstructor.is_approved ? (
                <button
                  onClick={() => revokeApproval(selectedInstructor.id)}
                  disabled={processingId === selectedInstructor.id}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-50 text-red-800 border-2 border-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {processingId === selectedInstructor.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <UserX className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  撤銷審核
                </button>
              ) : (
                <button
                  onClick={() => approveInstructor(selectedInstructor.id)}
                  disabled={processingId === selectedInstructor.id}
                  className="btn-editorial"
                >
                  {processingId === selectedInstructor.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <UserCheck className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  <span>核准通過</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 新增內部講師 Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-paper border-2 border-black shadow-hard max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between sticky top-0 bg-paper">
              <div>
                <h3 className="font-serif text-xl font-bold text-black">新增內部講師</h3>
                <p className="text-sm text-ink-muted">建立帳號後將自動審核通過</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setAddError(null)
                }}
                className="p-2 border-2 border-black hover:bg-black hover:text-paper transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <form onSubmit={handleAddInstructor} className="p-6 space-y-6">
              {/* 基本資訊 */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-black border-b-2 border-black pb-2 flex items-center gap-2">
                  <Users className="w-5 h-5" strokeWidth={1.5} />
                  帳號資訊
                </h4>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-2">
                    <span>姓名</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newInstructor.full_name}
                    onChange={(e) => setNewInstructor(prev => ({ ...prev, full_name: e.target.value }))}
                    className="input-editorial"
                    placeholder="講師姓名"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-2">
                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                    <span>Email</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={newInstructor.email}
                    onChange={(e) => setNewInstructor(prev => ({ ...prev, email: e.target.value }))}
                    className="input-editorial"
                    placeholder="lecturer@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-2">
                    <span>🔒</span>
                    <span>密碼</span>
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    value={newInstructor.password}
                    onChange={(e) => setNewInstructor(prev => ({ ...prev, password: e.target.value }))}
                    className="input-editorial"
                    placeholder="至少 6 個字元"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-2">
                    <Phone className="w-4 h-4" strokeWidth={1.5} />
                    <span>電話</span>
                  </label>
                  <input
                    type="tel"
                    value={newInstructor.phone}
                    onChange={(e) => setNewInstructor(prev => ({ ...prev, phone: e.target.value }))}
                    className="input-editorial"
                    placeholder="0912-345-678"
                  />
                </div>
              </div>

              {/* 專業資訊 */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-black border-b-2 border-black pb-2 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" strokeWidth={1.5} />
                  專業資訊
                </h4>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-2">
                    <span>職稱/頭銜</span>
                  </label>
                  <input
                    type="text"
                    value={newInstructor.title}
                    onChange={(e) => setNewInstructor(prev => ({ ...prev, title: e.target.value }))}
                    className="input-editorial"
                    placeholder="例：資深教育顧問"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-2">
                    <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                    <span>專長領域</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addExpertise()
                        }
                      }}
                      className="input-editorial flex-1"
                      placeholder="輸入後按 Enter 新增"
                    />
                    <button
                      type="button"
                      onClick={addExpertise}
                      className="btn-editorial-outline px-3"
                    >
                      <Plus className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                  {newInstructor.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newInstructor.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-black text-paper text-sm border-2 border-black"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeExpertise(skill)}
                            className="hover:text-red-300"
                          >
                            <X className="w-3 h-3" strokeWidth={2} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-black mb-2">
                    <span>簡短介紹</span>
                  </label>
                  <textarea
                    value={newInstructor.bio}
                    onChange={(e) => setNewInstructor(prev => ({ ...prev, bio: e.target.value }))}
                    className="input-editorial resize-none"
                    rows={3}
                    placeholder="講師的簡短自我介紹"
                  />
                </div>
              </div>

              {/* 錯誤訊息 */}
              {addError && (
                <div className="p-4 border-2 border-red-600 bg-red-50 text-red-800">
                  {addError}
                </div>
              )}

              {/* 提交按鈕 */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setAddError(null)
                  }}
                  className="btn-editorial-outline"
                >
                  <span>取消</span>
                </button>
                <button
                  type="submit"
                  disabled={addingInstructor}
                  className="btn-editorial"
                >
                  {addingInstructor ? (
                    <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <UserPlus className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  <span>{addingInstructor ? '建立中...' : '建立並審核通過'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 編輯講師 Modal */}
      {editingInstructor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-paper border-2 border-black shadow-hard max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between sticky top-0 bg-paper z-10">
              <div>
                <h3 className="font-serif text-xl font-bold text-black">編輯講師資料</h3>
                <p className="text-sm text-ink-muted">
                  {editingInstructor.display_name || editingInstructor.full_name || '未命名講師'}
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 border-2 border-black hover:bg-black hover:text-paper transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 頭像上傳 */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-black border-b-2 border-black pb-2 flex items-center gap-2">
                  <Users className="w-5 h-5" strokeWidth={1.5} />
                  講師頭像
                </h4>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 border-2 border-black bg-paper-dark overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="講師頭像"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-muted">
                        <Users className="w-8 h-8" strokeWidth={1} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      className="block w-full text-sm text-ink-muted
                        file:mr-4 file:py-2 file:px-4
                        file:border-2 file:border-black file:bg-paper
                        file:text-sm file:font-medium file:text-black
                        hover:file:bg-black hover:file:text-paper
                        file:transition-colors file:cursor-pointer"
                    />
                    <p className="text-xs text-ink-muted mt-2">
                      建議尺寸：400×400 像素，正方形比例最佳
                    </p>
                  </div>
                </div>
              </div>

              {/* 基本資訊 */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-black border-b-2 border-black pb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" strokeWidth={1.5} />
                  基本資訊
                </h4>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                      顯示名稱
                    </label>
                    <input
                      type="text"
                      value={editForm.display_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                      className="input-editorial"
                      placeholder="對外顯示的名稱"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                      姓名
                    </label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      className="input-editorial"
                      placeholder="真實姓名"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                      職稱/頭銜
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="input-editorial"
                      placeholder="例：資深教育顧問"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                      電話
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-editorial"
                      placeholder="0912-345-678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                    簡短介紹
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="input-editorial resize-none"
                    rows={3}
                    placeholder="50-100 字的簡短介紹"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                    詳細介紹
                  </label>
                  <textarea
                    value={editForm.bio_long}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio_long: e.target.value }))}
                    className="input-editorial resize-none"
                    rows={6}
                    placeholder="完整的個人介紹與背景說明"
                  />
                </div>
              </div>

              {/* 專長領域 */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-black border-b-2 border-black pb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" strokeWidth={1.5} />
                  專長領域
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editExpertise}
                    onChange={(e) => setEditExpertise(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addEditExpertise()
                      }
                    }}
                    className="input-editorial flex-1"
                    placeholder="輸入專長後按 Enter 新增"
                  />
                  <button
                    type="button"
                    onClick={addEditExpertise}
                    className="btn-editorial-outline px-3"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
                {editForm.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {editForm.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-black text-paper text-sm border-2 border-black"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeEditExpertise(skill)}
                          className="hover:text-red-300"
                        >
                          <X className="w-3 h-3" strokeWidth={2} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 經歷 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <h4 className="font-serif font-bold text-black flex items-center gap-2">
                    <Briefcase className="w-5 h-5" strokeWidth={1.5} />
                    經歷
                  </h4>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="btn-editorial-outline text-sm py-1 px-2"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                    <span>新增經歷</span>
                  </button>
                </div>
                
                {editForm.experiences.length === 0 ? (
                  <p className="text-ink-muted text-sm py-4 text-center">
                    尚未新增任何經歷
                  </p>
                ) : (
                  <div className="space-y-4">
                    {editForm.experiences.map((exp, index) => (
                      <div key={index} className="p-4 border-2 border-black/30 space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="absolute top-2 right-2 p-1 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => updateExperience(index, 'title', e.target.value)}
                            className="input-editorial text-sm"
                            placeholder="職稱"
                          />
                          <input
                            type="text"
                            value={exp.organization}
                            onChange={(e) => updateExperience(index, 'organization', e.target.value)}
                            className="input-editorial text-sm"
                            placeholder="組織/公司"
                          />
                        </div>
                        <input
                          type="text"
                          value={exp.date}
                          onChange={(e) => updateExperience(index, 'date', e.target.value)}
                          className="input-editorial text-sm"
                          placeholder="時間（例：2020 - 2024）"
                        />
                        <textarea
                          value={exp.description || ''}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          className="input-editorial text-sm resize-none"
                          rows={2}
                          placeholder="工作描述（選填）"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 公開設定 */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-black border-b-2 border-black pb-2 flex items-center gap-2">
                  <Eye className="w-5 h-5" strokeWidth={1.5} />
                  公開設定
                </h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.is_public}
                    onChange={(e) => setEditForm(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="w-5 h-5 border-2 border-black"
                  />
                  <span className="text-black">
                    公開顯示於講師列表
                  </span>
                </label>
                <p className="text-xs text-ink-muted">
                  開啟後，此講師將顯示在公開的講師列表頁面中
                </p>
              </div>

              {/* 錯誤訊息 */}
              {editError && (
                <div className="p-4 border-2 border-red-600 bg-red-50 text-red-800">
                  {editError}
                </div>
              )}
            </div>

            {/* 底部按鈕 */}
            <div className="px-6 py-4 border-t-2 border-black bg-paper-dark flex items-center justify-between sticky bottom-0">
              <a
                href={`/lecturer/${editingInstructor.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-editorial-outline text-sm"
              >
                <Eye className="w-4 h-4" strokeWidth={1.5} />
                <span>預覽頁面</span>
              </a>
              <div className="flex items-center gap-3">
                <button onClick={closeEditModal} className="btn-editorial-outline">
                  <span>取消</span>
                </button>
                <button
                  onClick={saveInstructorEdit}
                  disabled={savingEdit}
                  className="btn-editorial"
                >
                  {savingEdit ? (
                    <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  <span>{savingEdit ? '儲存中...' : '儲存變更'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
