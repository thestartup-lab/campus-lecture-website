'use client'

import Link from 'next/link'
import { Menu, X, BookOpen, LogIn, LogOut, LayoutDashboard, User, Shield } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { user, profile, loading, isAdmin, signOut } = useAuth()
  const router = useRouter()

  const navItems = [
    { name: '首頁', href: '/' },
    { name: '緣起', href: '/about' },
    { name: '專欄', href: '/blog' },
    { name: '講師', href: '/lecturers' },
    { name: '邀約', href: '/lecture-request' },
  ]

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    setIsOpen(false)
    setIsSigningOut(false)
    router.push('/')
  }

  // 取得顯示名稱
  const displayName = profile?.display_name || profile?.full_name || user?.email?.split('@')[0] || '講師'

  return (
    <nav className="bg-paper border-b-2 border-black sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-black text-paper flex items-center justify-center">
              <BookOpen className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <span className="hidden sm:block font-serif text-base font-bold tracking-tight whitespace-nowrap">
              生命應該是這樣的
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm uppercase tracking-wider font-medium text-black hover:opacity-60 transition-opacity"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            {/* 登入狀態 */}
            {loading ? (
              <div className="w-20 h-8 bg-black/5 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* 用戶名稱 */}
                <div className="flex items-center gap-2 px-3 py-1.5 border-2 border-black" title={isAdmin ? '管理員' : '講師'}>
                  {isAdmin ? (
                    <Shield className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <User className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  <span className="text-sm font-medium">{displayName}</span>
                </div>
                
                {/* 管理員後台 */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="relative group p-2 border-2 border-black hover:bg-black hover:text-paper transition-colors"
                  >
                    <Shield className="w-4 h-4" strokeWidth={1.5} />
                    <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-paper text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      管理後台
                    </span>
                  </Link>
                )}
                
                {/* 講師後台 - 管理員已有管理後台，不需重複顯示 */}
                {!isAdmin && (
                  <Link
                    href="/dashboard"
                    className="relative group p-2 border-2 border-black hover:bg-black hover:text-paper transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
                    <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-paper text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      講師後台
                    </span>
                  </Link>
                )}
                
                {/* 登出 */}
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="relative group p-2 border-2 border-black hover:bg-black hover:text-paper transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSigningOut ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-paper text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    登出
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/apply" className="btn-editorial-outline text-xs py-2 px-4">
                  <span>申請講師</span>
                </Link>
                <Link href="/login" className="btn-editorial text-xs py-2 px-4">
                  <LogIn className="w-4 h-4" strokeWidth={1.5} />
                  <span>登入</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            {!loading && (
              user ? (
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className="p-2 border-2 border-black"
                  title={isAdmin ? "管理後台" : "講師後台"}
                >
                  {isAdmin ? (
                    <Shield className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </Link>
              ) : (
                <Link href="/login" className="p-2 border-2 border-black bg-black text-paper" title="登入">
                  <LogIn className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              )
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 border-2 border-black hover:bg-black hover:text-paper transition-colors"
              title={isOpen ? "關閉選單" : "開啟選單"}
            >
              {isOpen ? (
                <X className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t-2 border-black bg-paper">
          <div className="px-6 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 text-sm uppercase tracking-wider font-medium border-2 border-black hover:bg-black hover:text-paper transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile: 用戶資訊和登出 */}
            {user && (
              <>
                <div className="my-4 h-0.5 bg-black" />
                <div className="px-4 py-3 border-2 border-black flex items-center gap-2">
                  {isAdmin ? (
                    <Shield className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <User className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  <span className="font-medium">{displayName}</span>
                  {isAdmin && (
                    <span className="ml-auto text-xs uppercase tracking-wider">Admin</span>
                  )}
                </div>
                
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-3 text-sm uppercase tracking-wider font-medium border-2 border-black hover:bg-black hover:text-paper transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="w-4 h-4" strokeWidth={1.5} />
                    管理後台
                  </Link>
                )}
                
                {!isAdmin && (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-3 text-sm uppercase tracking-wider font-medium border-2 border-black hover:bg-black hover:text-paper transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
                    講師後台
                  </Link>
                )}
                
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm uppercase tracking-wider font-medium border-2 border-black hover:bg-black hover:text-paper transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSigningOut ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  {isSigningOut ? '登出中...' : '登出'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
