import Link from 'next/link'
import { Search, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* 404 數字 */}
        <div className="mb-8">
          <span className="font-serif text-[10rem] sm:text-[12rem] font-black text-black/10 leading-none select-none">
            404
          </span>
        </div>

        {/* 錯誤圖示 */}
        <div className="mb-8 flex justify-center -mt-20">
          <div className="w-20 h-20 border-2 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Search className="w-10 h-10 text-black" strokeWidth={1.5} />
          </div>
        </div>

        {/* 錯誤訊息 */}
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-black mb-4">
          找不到頁面
        </h1>
        <p className="text-lg text-ink-muted mb-8 leading-relaxed">
          抱歉，您要尋找的頁面不存在或已被移除。<br />
          請確認網址是否正確，或返回首頁瀏覽。
        </p>

        {/* 操作按鈕 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-editorial inline-flex justify-center">
            <Home className="w-4 h-4" strokeWidth={1.5} />
            <span>返回首頁</span>
          </Link>
          <Link href="/blog" className="btn-editorial-outline inline-flex justify-center">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>瀏覽專欄</span>
          </Link>
        </div>

        {/* 裝飾線 */}
        <div className="mt-12 flex justify-center">
          <div className="w-32 h-1 bg-black" />
        </div>

        {/* 底部提示 */}
        <p className="mt-8 text-sm text-ink-muted">
          如果您認為這是一個錯誤，請
          <Link href="/faq" className="underline hover:text-black transition-colors">
            聯繫我們
          </Link>
        </p>
      </div>
    </div>
  )
}
