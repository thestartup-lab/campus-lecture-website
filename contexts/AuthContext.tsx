'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  full_name: string | null
  display_name: string | null
  avatar_url: string | null
  role: 'admin' | 'instructor'
  is_approved: boolean
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  isApproved: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null; needsApproval?: boolean }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// localStorage 快取 key
const PROFILE_CACHE_KEY = 'auth_profile_cache'
const CACHE_EXPIRY_KEY = 'auth_profile_cache_expiry'
const CACHE_DURATION = 1000 * 60 * 60 // 1 小時

// 從 localStorage 讀取快取
const getCachedProfile = (): Profile | null => {
  if (typeof window === 'undefined') return null
  try {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
    if (expiry && Date.now() > parseInt(expiry)) {
      // 快取已過期
      localStorage.removeItem(PROFILE_CACHE_KEY)
      localStorage.removeItem(CACHE_EXPIRY_KEY)
      return null
    }
    const cached = localStorage.getItem(PROFILE_CACHE_KEY)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

// 儲存快取到 localStorage
const setCachedProfile = (profile: Profile | null) => {
  if (typeof window === 'undefined') return
  try {
    if (profile) {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile))
      localStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_DURATION))
    } else {
      localStorage.removeItem(PROFILE_CACHE_KEY)
      localStorage.removeItem(CACHE_EXPIRY_KEY)
    }
  } catch {
    // localStorage 可能被禁用
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // 嘗試從快取初始化 profile
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // 獲取用戶 profile（含 AbortError 自動重試）
  const fetchProfile = async (userId: string, retries = 3): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, avatar_url, role, is_approved')
        .eq('id', userId)
        .single()

      if (error) {
        // AbortError：auth session 切換時 Supabase SDK 會中止請求，等待後重試
        const isAbort = error.message?.toLowerCase().includes('abort')
        if (isAbort && retries > 0) {
          // #region agent log
          fetch('http://127.0.0.1:7600/ingest/f4f4411e-82a1-47a2-9ba9-1782637baec9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'86a0cc'},body:JSON.stringify({sessionId:'86a0cc',location:'AuthContext.tsx:fetchProfile-retry',message:'AbortError retry',data:{userId,retriesLeft:retries-1},timestamp:Date.now(),hypothesisId:'C-fix'})}).catch(()=>{});
          // #endregion
          await new Promise(r => setTimeout(r, 400))
          return fetchProfile(userId, retries - 1)
        }
        if (error.code !== 'PGRST116') {
          console.warn('獲取 profile 警告:', error.message)
        }
        // #region agent log
        fetch('http://127.0.0.1:7600/ingest/f4f4411e-82a1-47a2-9ba9-1782637baec9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'86a0cc'},body:JSON.stringify({sessionId:'86a0cc',location:'AuthContext.tsx:fetchProfile-error',message:'fetchProfile DB error (no retry)',data:{code:error.code,msg:error.message,userId},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return null
      }
      // #region agent log
      fetch('http://127.0.0.1:7600/ingest/f4f4411e-82a1-47a2-9ba9-1782637baec9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'86a0cc'},body:JSON.stringify({sessionId:'86a0cc',location:'AuthContext.tsx:fetchProfile-ok',message:'fetchProfile result',data:{userId,role:data?.role,is_approved:data?.is_approved},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return data as Profile
    } catch (err) {
      console.warn('獲取 profile 時發生錯誤')
      return null
    }
  }

  // 重新獲取 profile
  const refreshProfile = async () => {
    if (user) {
      const newProfile = await fetchProfile(user.id)
      setProfile(newProfile)
      setCachedProfile(newProfile)
    }
  }

  // 初始化：先從快取讀取
  useEffect(() => {
    const cachedProfile = getCachedProfile()
    // #region agent log
    fetch('http://127.0.0.1:7600/ingest/f4f4411e-82a1-47a2-9ba9-1782637baec9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'86a0cc'},body:JSON.stringify({sessionId:'86a0cc',location:'AuthContext.tsx:cache-init',message:'localStorage cache read',data:{hasCachedProfile:!!cachedProfile,cachedRole:cachedProfile?.role,cachedId:cachedProfile?.id},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (cachedProfile) {
      setProfile(cachedProfile)
      // 如果有快取，先結束 loading 狀態
      setLoading(false)
    }
    setInitialLoadDone(true)
  }, [])

  useEffect(() => {
    if (!initialLoadDone) return

    // 獲取當前 session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const fetchedProfile = await fetchProfile(session.user.id)
          setProfile(fetchedProfile)
          setCachedProfile(fetchedProfile)
        } else {
          // 沒有登入，清除快取
          setProfile(null)
          setCachedProfile(null)
        }
      } catch (err) {
        console.warn('獲取 session 時發生錯誤')
        setUser(null)
        setProfile(null)
        setSession(null)
        setCachedProfile(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // 超時機制：確保 loading 最終會結束
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 3000)

    // 監聽 auth 狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const fetchedProfile = await fetchProfile(session.user.id)
          // #region agent log
          fetch('http://127.0.0.1:7600/ingest/f4f4411e-82a1-47a2-9ba9-1782637baec9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'86a0cc'},body:JSON.stringify({sessionId:'86a0cc',location:'AuthContext.tsx:onAuthStateChange',message:'onAuthStateChange profile fetch',data:{event,userId:session.user.id,role:fetchedProfile?.role,isNull:fetchedProfile===null},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          setProfile(fetchedProfile)
          setCachedProfile(fetchedProfile)
        } else {
          setProfile(null)
          setCachedProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [initialLoadDone])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return { error: error as Error }
    }

    // 檢查用戶是否已被審核
    if (data.user) {
      const profile = await fetchProfile(data.user.id)
      
      // 管理員不需要審核
      if (profile && profile.role !== 'admin' && !profile.is_approved) {
        // 登出未審核的用戶
        await supabase.auth.signOut()
        return { 
          error: new Error('您的帳號尚未通過審核，請等待管理員核准。'),
          needsApproval: true
        }
      }
      
      setProfile(profile)
      setCachedProfile(profile)
    }
    
    return { error: null }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      return { error: error as Error }
    }

    // 註冊成功後，確保創建/更新 profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: fullName,
          display_name: fullName,
          role: 'instructor',
          is_approved: false,
          is_public: false,
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('創建 profile 錯誤:', profileError)
        // 不返回錯誤，因為帳號已創建成功
      }
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
    setCachedProfile(null)
  }

  // 計算權限
  const isAdmin = profile?.role === 'admin'
  const isApproved = profile?.is_approved ?? false

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      isAdmin,
      isApproved,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
