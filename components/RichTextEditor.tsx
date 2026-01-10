'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import ErrorBoundary from './ErrorBoundary'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

// 動態載入編輯器核心，完全禁用 SSR
const EditorCore = dynamic(() => import('./RichTextEditorCore'), {
  ssr: false,
  loading: () => (
    <div className="border-2 border-black p-4 min-h-[300px] flex items-center justify-center bg-paper-dark">
      <p className="text-ink-muted">載入編輯器中...</p>
    </div>
  ),
})

export default function RichTextEditor({ content, onChange, placeholder = '開始撰寫您的文章...' }: RichTextEditorProps) {
  const [useSimpleEditor, setUseSimpleEditor] = useState(false)

  // 純文字模式
  if (useSimpleEditor) {
    return (
      <div className="border-2 border-black">
        <div className="flex items-center justify-between p-2 border-b-2 border-black bg-paper-dark">
          <span className="text-sm text-ink-muted">純文字模式</span>
          <button
            type="button"
            onClick={() => setUseSimpleEditor(false)}
            className="text-xs px-2 py-1 border border-black hover:bg-black hover:text-paper transition-colors"
          >
            切換到富文本編輯器
          </button>
        </div>
        <textarea
          value={content.replace(/<[^>]*>/g, '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[300px] p-4 resize-none focus:outline-none bg-white text-black"
        />
      </div>
    )
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="border-2 border-black">
          <div className="flex items-center justify-between p-2 border-b-2 border-black bg-paper-dark">
            <span className="text-sm text-ink-muted">純文字模式（編輯器載入失敗）</span>
          </div>
          <textarea
            value={content.replace(/<[^>]*>/g, '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[300px] p-4 resize-none focus:outline-none bg-white text-black"
          />
        </div>
      }
    >
      <EditorCore
        content={content}
        onChange={onChange}
        placeholder={placeholder}
        onSwitchToSimple={() => setUseSimpleEditor(true)}
      />
    </ErrorBoundary>
  )
}
