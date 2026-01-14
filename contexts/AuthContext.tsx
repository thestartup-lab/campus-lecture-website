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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // 獲取用戶 profile
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, avatar_url, role, is_approved')
        .eq('id', userId)
        .single()

      if (error) {
        // 如果是 RLS 錯誤或找不到資料，不顯示錯誤
        if (error.code !== 'PGRST116') {
          console.warn('獲取 profile 警告:', error.message)
        }
        return null
      }
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
    }
  }

  useEffect(() => {
    // 獲取當前 session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setProfile(profile)
        }
      } catch (err) {
        console.warn('獲取 session 時發生錯誤')
        setUser(null)
        setProfile(null)
        setSession(null)
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
          const profile = await fetchProfile(session.user.id)
          setProfile(profile)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

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
