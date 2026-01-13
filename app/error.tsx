'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('頁面錯誤:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* 錯誤圖示 */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 border-2 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <AlertTriangle className="w-12 h-12 text-black" strokeWidth={1.5} />
          </div>
        </div>

        {/* 錯誤訊息 */}
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-black mb-4">
          發生錯誤
        </h1>
        <p className="text-lg text-ink-muted mb-8 leading-relaxed">
          抱歉，頁面載入時發生了問題。<br />
          請嘗試重新整理頁面，或稍後再試。
        </p>

        {/* 錯誤代碼 */}
        {error.digest && (
          <p className="text-xs text-ink-muted mb-8 font-mono">
            錯誤代碼：{error.digest}
          </p>
        )}

        {/* 操作按鈕 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-editorial inline-flex justify-center"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
            <span>重新整理</span>
          </button>
          <Link href="/" className="btn-editorial-outline inline-flex justify-center">
            <Home className="w-4 h-4" strokeWidth={1.5} />
            <span>返回首頁</span>
          </Link>
        </div>

        {/* 裝飾線 */}
        <div className="mt-12 flex justify-center">
          <div className="w-32 h-1 bg-black" />
        </div>
      </div>
    </div>
  )
}
