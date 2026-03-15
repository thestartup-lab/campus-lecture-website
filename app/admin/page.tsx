'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  CheckCircle, 
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
  Key
} from 'lucide-react'

interface Experience {
  title: string
  organization: string
  date: string
  description?: string
}

interface Instructor {
  id: string
  instructor_code: string | null  // 講師編號
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

export default function AdminPage() {
  const { user, profile, loading, isAdmin, signingOut } = useAuth()
  const router = useRouter()
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
  const [deletingInstructorId, setDeletingInstructorId] = useState<string | null>(null)
  
  // 新增講師 Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [addingInstructor, setAddingInstructor] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [newInstructor, setNewInstructor] = useState({
    instructor_code: '',  // 講師編號
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
    instructor_code: '',  // 講師編號
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

  // 帳號密碼管理 Modal
  const [resetPasswordInstructor, setResetPasswordInstructor] = useState<Instructor | null>(null)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)

  // 電子報模板
  const [emailTemplates, setEmailTemplates] = useState<{
    id: string
    name: string
    subject: string
    html: string
    sort_order: number
  }[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [templateForm, setTemplateForm] = useState({ name: '', subject: '', html: '', sort_order: 0 })
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [savingTemplate, setSavingTemplate] = useState(false)

  // 電子報群發
  const [newsletterSubject, setNewsletterSubject] = useState('')
  const [newsletterHtml, setNewsletterHtml] = useState('')
  const [newsletterPreview, setNewsletterPreview] = useState(false)
  const [broadcastLoading, setBroadcastLoading] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null)
  const [broadcastResult, setBroadcastResult] = useState<{ sentCount: number; failCount: number } | null>(null)
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set())

  // 電子報寄送歷史
  const [newsletterHistory, setNewsletterHistory] = useState<{
    id: string
    subject: string
    html_content: string
    recipient_count: number
    sent_count: number
    fail_count: number
    sent_at: string
  }[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [previewHistoryItem, setPreviewHistoryItem] = useState<{
    subject: string
    html_content: string
    sent_at: string
  } | null>(null)

  // 訂閱者管理
  const [subscribers, setSubscribers] = useState<{
    id: string
    email: string
    name: string | null
    organization: string | null
    created_at: string
  }[]>([])
  const [loadingSubscribers, setLoadingSubscribers] = useState(false)
  const [manualEmail, setManualEmail] = useState('')
  const [manualName, setManualName] = useState('')
  const [manualOrganization, setManualOrganization] = useState('')
  const [addingEmail, setAddingEmail] = useState(false)
  // inline 編輯訂閱者
  const [inlineEdit, setInlineEdit] = useState<Record<string, { name: string; organization: string }>>({})
  const [savingSubscriberId, setSavingSubscriberId] = useState<string | null>(null)
  const [csvEmails, setCsvEmails] = useState<string[]>([])
  const [csvFilename, setCsvFilename] = useState('')
  const [importingCsv, setImportingCsv] = useState(false)
  const [importResult, setImportResult] = useState<{ inserted: number; skipped: number } | null>(null)
  const [deletingSubscriberId, setDeletingSubscriberId] = useState<string | null>(null)

  // 設定角色函數
  const setUserRole = async (userId: string, newRole: 'admin' | 'instructor', userName: string) => {
    const action = newRole === 'admin' ? '設為管理員' : '取消管理員'
    if (!confirm(`確定要將「${userName}」${action}嗎？`)) return

    try {
      const response = await fetch('/api/instructors/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })

      const result = await response.json()

      if (result.success) {
        alert(result.message)
        fetchInstructors()
      } else {
        alert(`操作失敗：${result.error}`)
      }
    } catch (err) {
      console.error('設定角色錯誤:', err)
      alert('設定角色時發生錯誤')
    }
  }

  // 更新帳號密碼函數
  const updateCredentials = async () => {
    if (!resetPasswordInstructor) return
    
    if (!newEmail && !newPassword) {
      alert('請輸入新帳號或新密碼')
      return
    }

    if (newPassword && newPassword.length < 6) {
      alert('密碼至少需要 6 個字元')
      return
    }

    if (newEmail && !newEmail.includes('@')) {
      alert('請輸入有效的 Email 地址')
      return
    }

    setResettingPassword(true)
    try {
      const response = await fetch('/api/instructors/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: resetPasswordInstructor.id,
          newEmail: newEmail || undefined,
          newPassword: newPassword || undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        const finalEmail = newEmail || resetPasswordInstructor.email
        let message = `更新成功！\n\n帳號：${finalEmail}`
        if (newPassword) {
          message += `\n新密碼：${newPassword}`
        }
        alert(message)
        setResetPasswordInstructor(null)
        setNewEmail('')
        setNewPassword('')
        fetchInstructors() // 重新載入講師列表
      } else {
        alert(`更新失敗：${result.error}`)
      }
    } catch (err) {
      console.error('更新帳號密碼錯誤:', err)
      alert('更新時發生錯誤')
    }
    setResettingPassword(false)
  }

  // 檢查權限
  useEffect(() => {
    if (!loading && !signingOut) {
      if (!user) {
        router.push('/login')
      } else if (!isAdmin) {
        router.push('/dashboard')
      }
    }
  }, [user, loading, signingOut, isAdmin, router])

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

  const fetchNewsletterHistory = async () => {
    setLoadingHistory(true)
    try {
      const res = await fetch('/api/newsletter/history')
      const data = await res.json()
      if (data.success) setNewsletterHistory(data.history)
    } catch {}
    setLoadingHistory(false)
  }

  const fetchEmailTemplates = async () => {
    try {
      const res = await fetch('/api/email-templates')
      const data = await res.json()
      if (data.success) setEmailTemplates(data.data)
    } catch {}
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    if (!templateId) return
    const tmpl = emailTemplates.find(t => t.id === templateId)
    if (tmpl) {
      setNewsletterSubject(tmpl.subject)
      setNewsletterHtml(tmpl.html)
    }
  }

  const handleTemplateSave = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.html) {
      alert('請填寫所有必填欄位')
      return
    }
    setSavingTemplate(true)
    try {
      const method = editingTemplate ? 'PATCH' : 'POST'
      const body = editingTemplate
        ? { id: editingTemplate, ...templateForm }
        : templateForm

      const res = await fetch('/api/email-templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setTemplateForm({ name: '', subject: '', html: '', sort_order: 0 })
        setEditingTemplate(null)
        fetchEmailTemplates()
      } else {
        alert(data.error ?? '儲存失敗')
      }
    } finally {
      setSavingTemplate(false)
    }
  }

  const handleTemplateDelete = async (id: string) => {
    if (!confirm('確定要刪除此模板嗎？')) return
    await fetch(`/api/email-templates?id=${id}`, { method: 'DELETE' })
    fetchEmailTemplates()
  }

  const fetchSubscribers = async () => {
    setLoadingSubscribers(true)
    try {
      const res = await fetch('/api/subscribers')
      const data = await res.json()
      if (data.success) {
        setSubscribers(data.subscribers)
        setSubscriberCount(data.count)
        // 預設全選
        setSelectedRecipients(new Set(data.subscribers.map((s: { email: string }) => s.email)))
      }
    } catch {}
    setLoadingSubscribers(false)
  }

  useEffect(() => {
    if (user && isAdmin) {
      fetchInstructors()
      fetchSubscribers()
      fetchNewsletterHistory()
      fetchEmailTemplates()
    }
  }, [user, isAdmin])

  // 手動新增單筆訂閱者
  const handleAddEmail = async () => {
    if (!manualEmail.trim()) return
    setAddingEmail(true)
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: [manualEmail.trim()],
          name: manualName.trim() || undefined,
          organization: manualOrganization.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        if (data.inserted > 0) {
          alert('已新增訂閱者')
          setManualEmail('')
          setManualName('')
          setManualOrganization('')
          fetchSubscribers()
        } else {
          alert('此 Email 已在訂閱名單中')
        }
      } else {
        alert(`新增失敗：${data.error}`)
      }
    } catch {
      alert('新增時發生錯誤')
    }
    setAddingEmail(false)
  }

  // 更新訂閱者姓名與學校/單位
  const handleUpdateSubscriber = async (id: string) => {
    const edit = inlineEdit[id]
    if (!edit) return
    setSavingSubscriberId(id)
    try {
      const res = await fetch('/api/subscribers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: edit.name || undefined,
          organization: edit.organization || undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        alert(`更新失敗：${data.error}`)
      } else {
        fetchSubscribers()
      }
    } catch {
      alert('更新時發生錯誤')
    }
    setSavingSubscriberId(null)
  }

  // 解析 CSV 檔案
  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvFilename(file.name)
    setImportResult(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const emailRegex = /[^\s@,;"'<>]+@[^\s@,;"'<>]+\.[^\s@,;"'<>]+/g
      const found = Array.from(new Set(text.match(emailRegex) || []))
      setCsvEmails(found)
    }
    reader.readAsText(file)
  }

  // 匯入 CSV 訂閱者
  const handleCsvImport = async () => {
    if (!csvEmails.length) return
    setImportingCsv(true)
    setImportResult(null)
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: csvEmails }),
      })
      const data = await res.json()
      if (data.success) {
        setImportResult({ inserted: data.inserted, skipped: data.skipped })
        setCsvEmails([])
        setCsvFilename('')
        fetchSubscribers()
      } else {
        alert(`匯入失敗：${data.error}`)
      }
    } catch {
      alert('匯入時發生錯誤')
    }
    setImportingCsv(false)
  }

  // 刪除訂閱者
  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!confirm(`確定要移除「${email}」的訂閱嗎？`)) return
    setDeletingSubscriberId(id)
    try {
      const res = await fetch(`/api/subscribers?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchSubscribers()
      } else {
        alert(`刪除失敗：${data.error}`)
      }
    } catch {
      alert('刪除時發生錯誤')
    }
    setDeletingSubscriberId(null)
  }

  // 電子報群發
  const handleBroadcast = async () => {
    if (!newsletterSubject.trim()) { alert('請填寫主旨'); return }
    if (!newsletterHtml.trim()) { alert('請填寫郵件內容'); return }
    const recipientList = Array.from(selectedRecipients)
    if (recipientList.length === 0) { alert('請至少選取一位收件人'); return }
    if (!confirm(`確定要發送給已選取的 ${recipientList.length} 位訂閱者嗎？`)) return

    setBroadcastLoading(true)
    setBroadcastResult(null)
    try {
      const res = await fetch('/api/newsletter/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: newsletterSubject, htmlContent: newsletterHtml, emails: recipientList }),
      })
      const data = await res.json()
      if (data.success) {
        setBroadcastResult({ sentCount: data.sentCount, failCount: data.failCount })
        fetchNewsletterHistory()
        if (data.failCount === 0) {
          alert(`成功寄出 ${data.sentCount} 封！`)
        } else {
          alert(`寄出 ${data.sentCount} 封，失敗 ${data.failCount} 封`)
        }
      } else {
        alert(`發送失敗：${data.error}`)
      }
    } catch {
      alert('發送時發生錯誤')
    } finally {
      setBroadcastLoading(false)
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

  // 刪除講師
  const deleteInstructor = async (instructorId: string, instructorName: string) => {
    if (!confirm(`確定要刪除講師「${instructorName}」嗎？\n\n此操作會完全刪除該帳號，無法復原！`)) {
      return
    }

    // 二次確認
    if (!confirm(`再次確認：刪除「${instructorName}」？`)) {
      return
    }

    setDeletingInstructorId(instructorId)

    try {
      const response = await fetch(`/api/instructors?id=${instructorId}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        await fetchInstructors()
        setSelectedInstructor(null)
        alert(result.message || '講師已刪除')
      } else {
        console.error('刪除講師錯誤:', result.error)
        alert(`刪除失敗：${result.error}`)
      }
    } catch (error) {
      console.error('刪除講師錯誤:', error)
      alert('刪除時發生錯誤')
    }

    setDeletingInstructorId(null)
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
      // 使用 Admin API 創建講師帳號（不需要 email 驗證）
      const response = await fetch('/api/instructors/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newInstructor.email,
          password: newInstructor.password,
          full_name: newInstructor.full_name,
          instructor_code: newInstructor.instructor_code,
          phone: newInstructor.phone,
          title: newInstructor.title,
          bio: newInstructor.bio,
          expertise: newInstructor.expertise,
          approved_by: user?.id,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        setAddError(result.error || '新增失敗')
        setAddingInstructor(false)
        return
      }

      if (result.warning) {
        setAddError(result.warning)
      }

      // 成功
      setShowAddModal(false)
      setNewInstructor({
        instructor_code: '',
        full_name: '',
        email: '',
        password: '',
        phone: '',
        title: '',
        bio: '',
        expertise: [],
      })
      await fetchInstructors()
      alert('內部講師已成功新增！講師可以直接使用 Email 和密碼登入。')

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
      instructor_code: instructor.instructor_code || '',
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
          instructor_code: editForm.instructor_code || null,
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
  }

  // 載入中
  if (loading && !signingOut) {
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
        {stats.pending > 0 && (
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

        {/* Instructors Table */}
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
                          <div className="flex items-center gap-2">
                            {instructor.instructor_code && (
                              <span className="px-2 py-0.5 text-xs font-mono bg-black text-paper">
                                {instructor.instructor_code}
                              </span>
                            )}
                            <p className="font-serif font-bold text-black text-lg truncate">
                              {instructor.full_name || instructor.display_name || '未命名'}
                            </p>
                          </div>
                          <p className="text-sm text-ink-muted truncate">
                            {instructor.title || (instructor.role === 'admin' ? '系統管理員' : '講師申請者')}
                          </p>
                          <p className="text-xs text-ink-muted font-mono mt-1">
                            📧 {instructor.email}
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
                        <button
                          onClick={() => setResetPasswordInstructor(instructor)}
                          className="btn-editorial-outline text-sm py-2 px-3"
                          title="重設密碼"
                        >
                          <Key className="w-4 h-4" strokeWidth={1.5} />
                          <span className="hidden sm:inline">密碼</span>
                        </button>
                        {instructor.role !== 'admin' ? (
                          <>
                            <button
                              onClick={() => setSelectedInstructor(instructor)}
                              className="btn-editorial-outline text-sm py-2 px-3"
                            >
                              <FileText className="w-4 h-4" strokeWidth={1.5} />
                              <span className="hidden sm:inline">審核</span>
                            </button>
                            <button
                              onClick={() => setUserRole(instructor.id, 'admin', instructor.full_name || instructor.display_name || '未命名')}
                              className="btn-editorial-outline text-sm py-2 px-3"
                              title="設為管理員"
                            >
                              <Shield className="w-4 h-4" strokeWidth={1.5} />
                              <span className="hidden sm:inline">設為管理員</span>
                            </button>
                            <button
                              onClick={() => deleteInstructor(instructor.id, instructor.full_name || instructor.display_name || '未命名')}
                              disabled={deletingInstructorId === instructor.id}
                              className="p-2 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                              title="刪除講師"
                            >
                              {deletingInstructorId === instructor.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                              ) : (
                                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                              )}
                            </button>
                          </>
                        ) : (
                          // 管理員可以被取消管理員身份（但不能取消自己）
                          instructor.id !== user?.id && (
                            <button
                              onClick={() => setUserRole(instructor.id, 'instructor', instructor.full_name || instructor.display_name || '未命名')}
                              className="btn-editorial-outline text-sm py-2 px-3 text-yellow-700 border-yellow-600 hover:bg-yellow-600 hover:text-white"
                              title="取消管理員"
                            >
                              <UserX className="w-4 h-4" strokeWidth={1.5} />
                              <span className="hidden sm:inline">取消管理員</span>
                            </button>
                          )
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
      </div>

      {/* 訂閱者管理 */}
      <div className="card-editorial overflow-hidden mt-8">
        <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between">
          <h2 className="font-bold text-xl tracking-tight flex items-center gap-2">
            📋 訂閱者管理
          </h2>
          <span className="text-sm text-gray-500">
            共 {subscriberCount ?? '...'} 位訂閱者
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* 手動新增 */}
          <div>
            <h3 className="font-semibold mb-2">手動新增訂閱者</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              <input
                type="email"
                className="border-2 border-black px-3 py-2 text-sm focus:outline-none"
                placeholder="Email *"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
              />
              <input
                type="text"
                className="border-2 border-black px-3 py-2 text-sm focus:outline-none"
                placeholder="姓名（選填）"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
              />
              <input
                type="text"
                className="border-2 border-black px-3 py-2 text-sm focus:outline-none"
                placeholder="學校/單位（選填）"
                value={manualOrganization}
                onChange={(e) => setManualOrganization(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
              />
            </div>
            <button
              onClick={handleAddEmail}
              disabled={addingEmail || !manualEmail.trim()}
              className="btn-editorial px-4 py-2 text-sm disabled:opacity-50"
            >
              {addingEmail ? '新增中...' : '新增'}
            </button>
          </div>

          {/* CSV 匯入 */}
          <div>
            <h3 className="font-semibold mb-2">CSV 批次匯入</h3>
            <p className="text-xs text-gray-500 mb-2">支援任意 CSV 格式，自動偵測 Email 欄位，無需指定欄位名稱</p>
            <div className="flex items-center gap-2 mb-2">
              <label className="btn-editorial px-4 py-2 text-sm cursor-pointer">
                選擇 CSV 檔案
                <input type="file" accept=".csv,.txt" className="hidden" onChange={handleCsvFile} />
              </label>
              {csvFilename && (
                <span className="text-sm text-gray-600">{csvFilename}</span>
              )}
            </div>
            {csvEmails.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
                <p className="text-sm font-medium mb-1">偵測到 {csvEmails.length} 個 Email：</p>
                <p className="text-xs text-gray-500 break-all">{csvEmails.slice(0, 5).join(', ')}{csvEmails.length > 5 ? ` ... 等共 ${csvEmails.length} 個` : ''}</p>
                <button
                  onClick={handleCsvImport}
                  disabled={importingCsv}
                  className="btn-editorial px-4 py-2 text-sm mt-3 disabled:opacity-50"
                >
                  {importingCsv ? '匯入中...' : `確認匯入 ${csvEmails.length} 個 Email`}
                </button>
              </div>
            )}
            {importResult && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                ✅ 匯入完成：新增 {importResult.inserted} 筆，略過重複 {importResult.skipped} 筆
              </div>
            )}
          </div>

          {/* 訂閱者列表 */}
          <div>
            <h3 className="font-semibold mb-2">訂閱者列表</h3>
            <p className="text-xs text-gray-500 mb-2">點擊姓名或學校/單位欄位可直接編輯，離開欄位後自動儲存</p>
            {loadingSubscribers ? (
              <p className="text-sm text-gray-500">載入中...</p>
            ) : subscribers.length === 0 ? (
              <p className="text-sm text-gray-500">尚無訂閱者</p>
            ) : (
              <div className="border-2 border-black overflow-hidden">
                <div className="overflow-y-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-black text-white">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium">Email</th>
                        <th className="text-left px-4 py-2 font-medium">姓名</th>
                        <th className="text-left px-4 py-2 font-medium">學校/單位</th>
                        <th className="text-left px-4 py-2 font-medium">訂閱日期</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub, idx) => {
                        const edit = inlineEdit[sub.id] ?? {
                          name: sub.name ?? '',
                          organization: sub.organization ?? '',
                        }
                        const isSaving = savingSubscriberId === sub.id
                        return (
                          <tr key={sub.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 font-mono text-xs">{sub.email}</td>
                            <td className="px-2 py-1">
                              <input
                                type="text"
                                className="w-full min-w-[80px] border border-transparent hover:border-gray-300 focus:border-black px-2 py-1 text-sm bg-transparent focus:outline-none focus:bg-white rounded"
                                placeholder="未填寫"
                                value={edit.name}
                                disabled={isSaving}
                                onChange={(e) =>
                                  setInlineEdit((prev) => ({
                                    ...prev,
                                    [sub.id]: { ...edit, name: e.target.value },
                                  }))
                                }
                                onBlur={() => handleUpdateSubscriber(sub.id)}
                              />
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="text"
                                className="w-full min-w-[100px] border border-transparent hover:border-gray-300 focus:border-black px-2 py-1 text-sm bg-transparent focus:outline-none focus:bg-white rounded"
                                placeholder="未填寫"
                                value={edit.organization}
                                disabled={isSaving}
                                onChange={(e) =>
                                  setInlineEdit((prev) => ({
                                    ...prev,
                                    [sub.id]: { ...edit, organization: e.target.value },
                                  }))
                                }
                                onBlur={() => handleUpdateSubscriber(sub.id)}
                              />
                            </td>
                            <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                              {new Date(sub.created_at).toLocaleDateString('zh-TW')}
                            </td>
                            <td className="px-4 py-2 text-right whitespace-nowrap">
                              {isSaving ? (
                                <span className="text-xs text-gray-400">儲存中...</span>
                              ) : (
                                <button
                                  onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                                  disabled={deletingSubscriberId === sub.id}
                                  className="text-red-500 hover:text-red-700 text-xs disabled:opacity-40"
                                >
                                  {deletingSubscriberId === sub.id ? '刪除中...' : '移除'}
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 電子報群發 */}
      <div className="card-editorial overflow-hidden mt-8">
        <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-black flex items-center gap-2">
              <Mail className="w-5 h-5" strokeWidth={1.5} />
              電子報群發
            </h2>
            <p className="text-sm text-ink-muted">
              寄送給全部訂閱者
              {subscriberCount !== null && (
                <span className="ml-1 font-medium text-black">（{subscriberCount} 人）</span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplateManager(!showTemplateManager)}
              className={`px-3 py-1.5 text-xs font-medium border-2 border-black transition-colors ${showTemplateManager ? 'bg-black text-paper' : 'bg-paper text-black hover:bg-paper-dark'}`}
            >
              模板管理
            </button>
            <button
              onClick={() => setNewsletterPreview(false)}
              className={`px-3 py-1.5 text-xs font-medium border-2 border-black transition-colors ${!newsletterPreview && !showTemplateManager ? 'bg-black text-paper' : 'bg-paper text-black hover:bg-paper-dark'}`}
            >
              編輯
            </button>
            <button
              onClick={() => setNewsletterPreview(true)}
              className={`px-3 py-1.5 text-xs font-medium border-2 border-black transition-colors ${newsletterPreview ? 'bg-black text-paper' : 'bg-paper text-black hover:bg-paper-dark'}`}
            >
              預覽
            </button>
          </div>
        </div>

        {/* 模板管理區塊 */}
        {showTemplateManager && (
          <div className="p-6 border-b-2 border-black bg-gray-50">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">公版模板管理</h3>

            {/* 模板列表 */}
            <div className="space-y-2 mb-6">
              {emailTemplates.length === 0 ? (
                <p className="text-sm text-ink-muted">尚無模板</p>
              ) : (
                emailTemplates.map(t => (
                  <div key={t.id} className="flex items-center justify-between bg-white border-2 border-black px-4 py-2">
                    <div>
                      <span className="font-medium text-sm">{t.name}</span>
                      <span className="ml-2 text-xs text-ink-muted">主旨：{t.subject}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTemplate(t.id)
                          setTemplateForm({ name: t.name, subject: t.subject, html: t.html, sort_order: t.sort_order })
                        }}
                        className="text-xs underline text-black hover:opacity-60"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleTemplateDelete(t.id)}
                        className="text-xs underline text-red-600 hover:opacity-60"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 新增/編輯表單 */}
            <div className="border-2 border-black bg-white p-4 space-y-3">
              <h4 className="font-bold text-sm">{editingTemplate ? '編輯模板' : '新增模板'}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-1">模板名稱 *</label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={e => setTemplateForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="例：合作邀請函"
                    className="input-editorial w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-1">排序</label>
                  <input
                    type="number"
                    value={templateForm.sort_order}
                    onChange={e => setTemplateForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                    className="input-editorial w-full text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-1">主旨 *</label>
                <input
                  type="text"
                  value={templateForm.subject}
                  onChange={e => setTemplateForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="信件主旨"
                  className="input-editorial w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-1">HTML 內容 *</label>
                <textarea
                  value={templateForm.html}
                  onChange={e => setTemplateForm(f => ({ ...f, html: e.target.value }))}
                  placeholder="<p>親愛的承辦人您好，...</p>"
                  rows={8}
                  className="input-editorial w-full font-mono text-xs resize-y"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleTemplateSave}
                  disabled={savingTemplate}
                  className="btn-editorial disabled:opacity-50"
                >
                  {savingTemplate ? '儲存中...' : editingTemplate ? '更新模板' : '新增模板'}
                </button>
                {editingTemplate && (
                  <button
                    onClick={() => { setEditingTemplate(null); setTemplateForm({ name: '', subject: '', html: '', sort_order: 0 }) }}
                    className="px-4 py-2 border-2 border-black text-sm font-medium hover:bg-gray-50"
                  >
                    取消
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* 選擇模板 */}
          {emailTemplates.length > 0 && (
            <div>
              <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">套用公版模板</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => { setSelectedTemplateId(''); setNewsletterSubject(''); setNewsletterHtml('') }}
                  className={`px-3 py-1.5 text-xs font-medium border-2 border-black transition-colors ${!selectedTemplateId ? 'bg-black text-paper' : 'bg-paper text-black hover:bg-paper-dark'}`}
                >
                  自訂
                </button>
                {emailTemplates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t.id)}
                    className={`px-3 py-1.5 text-xs font-medium border-2 border-black transition-colors ${selectedTemplateId === t.id ? 'bg-black text-paper' : 'bg-paper text-black hover:bg-paper-dark'}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">主旨</label>
            <input
              type="text"
              value={newsletterSubject}
              onChange={(e) => setNewsletterSubject(e.target.value)}
              placeholder="請輸入電子報主旨"
              className="input-editorial w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
              郵件內容（HTML）
            </label>
            {newsletterPreview ? (
              <div
                className="border-2 border-black bg-white min-h-[320px] p-4 overflow-auto"
                dangerouslySetInnerHTML={{ __html: newsletterHtml || '<p style="color:#888;text-align:center;padding:40px">（尚無內容）</p>' }}
              />
            ) : (
              <textarea
                value={newsletterHtml}
                onChange={(e) => setNewsletterHtml(e.target.value)}
                placeholder={'<h1>標題</h1>\n<p>親愛的訂閱者，您好！...</p>'}
                rows={14}
                className="input-editorial w-full font-mono text-xs resize-y"
              />
            )}
          </div>

          {/* 收件人勾選 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium uppercase tracking-wider text-black">
                收件人（已選 {selectedRecipients.size} / {subscribers.length} 人）
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setSelectedRecipients(new Set(subscribers.map(s => s.email)))}
                  className="underline text-black hover:opacity-70"
                >
                  全選
                </button>
                <span className="text-ink-muted">|</span>
                <button
                  onClick={() => setSelectedRecipients(new Set())}
                  className="underline text-black hover:opacity-70"
                >
                  取消全選
                </button>
              </div>
            </div>
            {subscribers.length === 0 ? (
              <p className="text-sm text-ink-muted">尚無訂閱者，請先在上方「訂閱者管理」新增</p>
            ) : (
              <div className="border-2 border-black overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {subscribers.map((sub, idx) => (
                      <tr
                        key={sub.id}
                        className={`cursor-pointer hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        onClick={() => {
                          setSelectedRecipients(prev => {
                            const next = new Set(prev)
                            if (next.has(sub.email)) next.delete(sub.email)
                            else next.add(sub.email)
                            return next
                          })
                        }}
                      >
                        <td className="px-3 py-2 w-8">
                          <input
                            type="checkbox"
                            readOnly
                            checked={selectedRecipients.has(sub.email)}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <span>{sub.email}</span>
                          {(sub.name || sub.organization) && (
                            <span className="ml-2 text-xs text-gray-400">
                              {[sub.name, sub.organization].filter(Boolean).join(' · ')}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right text-xs text-gray-400">
                          {new Date(sub.created_at).toLocaleDateString('zh-TW')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {broadcastResult && (
            <div className={`p-3 border-2 text-sm ${broadcastResult.failCount === 0 ? 'border-green-600 bg-green-50 text-green-800' : 'border-amber-500 bg-amber-50 text-amber-800'}`}>
              成功寄出 {broadcastResult.sentCount} 封
              {broadcastResult.failCount > 0 && `，失敗 ${broadcastResult.failCount} 封`}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t-2 border-black">
            <p className="text-xs text-ink-muted">寄件人：send@cjlead.com.tw</p>
            <button
              onClick={handleBroadcast}
              disabled={broadcastLoading || !newsletterSubject.trim() || !newsletterHtml.trim() || selectedRecipients.size === 0}
              className="btn-editorial disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {broadcastLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Mail className="w-4 h-4" strokeWidth={1.5} />
              )}
              <span>{broadcastLoading ? '寄送中...' : `發送給 ${selectedRecipients.size} 人`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 電子報寄送歷史 */}
      <div className="card-editorial overflow-hidden mt-8">
        <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between">
          <h2 className="font-bold text-xl tracking-tight">寄送紀錄</h2>
          <button onClick={fetchNewsletterHistory} className="text-xs underline text-ink-muted hover:text-black">
            重新整理
          </button>
        </div>
        <div className="p-6">
          {loadingHistory ? (
            <p className="text-sm text-gray-500">載入中...</p>
          ) : newsletterHistory.length === 0 ? (
            <p className="text-sm text-gray-500">尚無寄送紀錄</p>
          ) : (
            <div className="border-2 border-black overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">主旨</th>
                    <th className="text-center px-4 py-2 font-medium">收件人</th>
                    <th className="text-center px-4 py-2 font-medium">成功</th>
                    <th className="text-center px-4 py-2 font-medium">失敗</th>
                    <th className="text-right px-4 py-2 font-medium">寄送時間</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {newsletterHistory.map((record, idx) => (
                    <tr key={record.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 font-medium">{record.subject}</td>
                      <td className="px-4 py-2 text-center text-gray-600">{record.recipient_count}</td>
                      <td className="px-4 py-2 text-center text-green-700 font-medium">{record.sent_count}</td>
                      <td className="px-4 py-2 text-center">
                        {record.fail_count > 0 ? (
                          <span className="text-red-600 font-medium">{record.fail_count}</span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-500 text-xs">
                        {new Date(record.sent_at).toLocaleString('zh-TW')}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => setPreviewHistoryItem({ subject: record.subject, html_content: record.html_content, sent_at: record.sent_at })}
                          className="text-xs underline text-black hover:opacity-60"
                        >
                          查看內容
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 電子報歷史預覽 Modal */}
      {previewHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-paper border-2 border-black shadow-hard max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between sticky top-0 bg-paper">
              <div>
                <h3 className="font-serif text-xl font-bold text-black">{previewHistoryItem.subject}</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  寄送時間：{new Date(previewHistoryItem.sent_at).toLocaleString('zh-TW')}
                </p>
              </div>
              <button
                onClick={() => setPreviewHistoryItem(null)}
                className="p-2 border-2 border-black hover:bg-black hover:text-paper transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto p-6 bg-white"
              dangerouslySetInnerHTML={{ __html: previewHistoryItem.html_content }}
            />
          </div>
        </div>
      )}

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
                    <span>講師編號</span>
                  </label>
                  <input
                    type="text"
                    value={newInstructor.instructor_code}
                    onChange={(e) => setNewInstructor(prev => ({ ...prev, instructor_code: e.target.value }))}
                    className="input-editorial"
                    placeholder="例如：001、A001"
                  />
                </div>

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

      {/* 帳號密碼管理 Modal */}
      {resetPasswordInstructor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-paper border-2 border-black shadow-hard max-w-md w-full">
            <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-black">帳號密碼管理</h3>
                <p className="text-sm text-ink-muted">
                  {resetPasswordInstructor.full_name || resetPasswordInstructor.display_name}
                </p>
              </div>
              <button
                onClick={() => {
                  setResetPasswordInstructor(null)
                  setNewEmail('')
                  setNewPassword('')
                }}
                className="p-2 border-2 border-black hover:bg-black hover:text-paper transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                  目前帳號
                </label>
                <div className="input-editorial bg-paper-dark font-mono text-sm">
                  {resetPasswordInstructor.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                  新帳號（Email）
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="input-editorial font-mono"
                  placeholder="留空則不更改"
                />
              </div>

              <div>
                <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                  新密碼
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-editorial font-mono"
                  placeholder="留空則不更改（至少 6 字元）"
                  minLength={6}
                />
              </div>

              <p className="text-xs text-ink-muted">
                💡 只需填寫要更改的欄位，不需更改的留空即可
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setResetPasswordInstructor(null)
                    setNewEmail('')
                    setNewPassword('')
                  }}
                  className="btn-editorial-outline flex-1"
                >
                  取消
                </button>
                <button
                  onClick={updateCredentials}
                  disabled={resettingPassword || (!newEmail && !newPassword) || (newPassword.length > 0 && newPassword.length < 6)}
                  className="btn-editorial flex-1 disabled:opacity-50"
                >
                  {resettingPassword ? '更新中...' : '確認更新'}
                </button>
              </div>
            </div>
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
                      建議尺寸：1200×900 像素（4:3 比例），支援 JPG、PNG 格式
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

                <div>
                  <label className="block text-sm font-medium uppercase tracking-wider text-black mb-2">
                    講師編號
                  </label>
                  <input
                    type="text"
                    value={editForm.instructor_code}
                    onChange={(e) => setEditForm(prev => ({ ...prev, instructor_code: e.target.value }))}
                    className="input-editorial max-w-xs"
                    placeholder="例如：001、A001"
                  />
                </div>
                
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
