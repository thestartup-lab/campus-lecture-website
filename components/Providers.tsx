'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { ReactNode, useEffect } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  // 隱藏 TipTap 編輯器的 AbortError（這是一個無害的內部錯誤）
  useEffect(() => {
    // 過濾 console.error
    const originalError = console.error
    console.error = (...args) => {
      const message = args[0]?.toString() || ''
      if (
        message.includes('signal is aborted') ||
        message.includes('AbortError') ||
        args[0]?.name === 'AbortError'
      ) {
        return
      }
      originalError.apply(console, args)
    }

    // 過濾未處理的 Promise rejection
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.name === 'AbortError' ||
        event.reason?.message?.includes('signal is aborted') ||
        String(event.reason).includes('signal is aborted')
      ) {
        event.preventDefault()
        return
      }
    }

    // 過濾全域錯誤
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes('signal is aborted') ||
        event.message?.includes('AbortError')
      ) {
        event.preventDefault()
        return
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      console.error = originalError
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
