'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
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
  signIn: (email: string, password: string) => Promise<{ error: Error | null; needsApproval?: boolean; profile?: Profile | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PROFILE_CACHE_KEY = 'auth_profile_cache'
const CACHE_EXPIRY_KEY = 'auth_profile_cache_expiry'
const CACHE_DURATION = 1000 * 60 * 60 // 1 小時

const getCachedProfile = (): Profile | null => {
  if (typeof window === 'undefined') return null
  try {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
    if (expiry && Date.now() > parseInt(expiry)) {
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
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // 追蹤最新 profile 供 onAuthStateChange 閉包使用
  const profileRef = useRef<Profile | null>(null)
  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  const fetchProfile = async (userId: string, retries = 3): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, avatar_url, role, is_approved')
        .eq('id', userId)
        .single()

      if (error) {
        const isAbort = error.message?.toLowerCase().includes('abort')
        if (isAbort && retries > 0) {
          await new Promise(r => setTimeout(r, 400))
          return fetchProfile(userId, retries - 1)
        }
        if (error.code !== 'PGRST116') {
          console.warn('獲取 profile 警告:', error.message)
        }
        return null
      }
      if (data) {
        // #region agent log
        fetch('http://127.0.0.1:7600/ingest/f4f4411e-82a1-47a2-9ba9-1782637baec9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c430c2'},body:JSON.stringify({sessionId:'c430c2',location:'AuthContext.tsx:fetchProfile',message:'profile fetched',data:{userId,role:data?.role,is_approved:data?.is_approved,profileId:data?.id},timestamp:Date.now()})}).catch(()=>{})
        // #endregion
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7600/ingest/f4f4411e-82a1-47a2-9ba9-1782637baec9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c430c2'},body:JSON.stringify({sessionId:'c430c2',location:'AuthContext.tsx:fetchProfile',message:'profile fetch returned null',data:{userId,errorCode:error?.code,errorMsg:error?.message},timestamp:Date.now()})}).catch(()=>{})
        // #endregion
      }
      return data as Profile
    } catch {
      console.warn('獲取 profile 時發生錯誤')
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const newProfile = await fetchProfile(user.id)
      setProfile(newProfile)
      profileRef.current = newProfile
      setCachedProfile(newProfile)
    }
  }

  useEffect(() => {
    // 從快取預先載入 profile，讓頁面不用等網路就能判斷權限
    const cachedProfile = getCachedProfile()
    if (cachedProfile) {
      setProfile(cachedProfile)
      profileRef.current = cachedProfile
    }

    // 只使用 onAuthStateChange 作為唯一的 auth 狀態來源
    // Supabase 在掛載後會立刻觸發 INITIAL_SESSION，帶入當前 session
    // 避免同時跑 getSession() + onAuthStateChange 造成 race condition
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // SIGNED_IN 且 signIn() 已設好 profile 時，跳過重複 fetch
          // 防止 onAuthStateChange 用失敗的 fetch 覆蓋剛設好的 admin profile
          if (event === 'SIGNED_IN' && profileRef.current?.id === session.user.id) {
            setLoading(false)
            return
          }
          const fetchedProfile = await fetchProfile(session.user.id)
          setProfile(fetchedProfile)
          profileRef.current = fetchedProfile
          setCachedProfile(fetchedProfile)
        } else {
          setProfile(null)
          profileRef.current = null
          setCachedProfile(null)
        }

        setLoading(false)
      }
    )

    // 保底：3 秒後強制結束 loading，防止卡住
    const timeout = setTimeout(() => setLoading(false), 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error as Error }
    }

    if (data.user) {
      const fetchedProfile = await fetchProfile(data.user.id)

      if (fetchedProfile && fetchedProfile.role !== 'admin' && !fetchedProfile.is_approved) {
        await supabase.auth.signOut()
        return {
          error: new Error('您的帳號尚未通過審核，請等待管理員核准。'),
          needsApproval: true,
        }
      }

      setProfile(fetchedProfile)
      profileRef.current = fetchedProfile
      setCachedProfile(fetchedProfile)
      return { error: null, profile: fetchedProfile }
    }

    return { error: null, profile: null }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (error) {
      return { error: error as Error }
    }

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
        }, { onConflict: 'id' })

      if (profileError) {
        console.error('創建 profile 錯誤:', profileError)
      }
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    profileRef.current = null
    setSession(null)
    setCachedProfile(null)
  }

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
