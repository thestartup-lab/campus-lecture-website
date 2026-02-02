'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useRef, useEffect } from 'react'
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  console.log('🔍 RichTextEditor 渲染:', { useSimpleEditor, contentLength: content.length })

  // 穩定的 onChange 函數
  const handleChange = useCallback((newContent: string) => {
    console.log('🔍 RichTextEditor handleChange 被調用:', {
      contentLength: newContent.length,
      contentPreview: newContent.substring(0, 50)
    })
    onChange(newContent)
  }, [onChange])

  // 使用原生 JavaScript 監聽事件（終極測試）
  useEffect(() => {
    if (useSimpleEditor && textareaRef.current) {
      const textarea = textareaRef.current
      console.log('🔍 設置原生事件監聽器')
      
      const handleNativeInput = (e: Event) => {
        console.log('🔍 原生 input 事件觸發!', (e.target as HTMLTextAreaElement).value.substring(0, 50))
        handleChange((e.target as HTMLTextAreaElement).value)
      }
      
      textarea.addEventListener('input', handleNativeInput)
      
      return () => {
        console.log('🔍 移除原生事件監聽器')
        textarea.removeEventListener('input', handleNativeInput)
      }
    }
  }, [useSimpleEditor, handleChange])

  // 純文字模式
  if (useSimpleEditor) {
    console.log('✅ 渲染純文字模式')
    return (
      <div className="border-2 border-black">
        <div className="flex items-center justify-between p-2 border-b-2 border-black bg-paper-dark">
          <span className="text-sm text-ink-muted">純文字模式 ✅</span>
          <button
            type="button"
            onClick={() => {
              console.log('🔍 點擊切換按鈕')
              setUseSimpleEditor(false)
            }}
            className="text-xs px-2 py-1 border border-black hover:bg-black hover:text-paper transition-colors"
          >
            切換到富文本編輯器
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={content.replace(/<[^>]*>/g, '')}
          onChange={(e) => {
            const value = e.target.value
            console.log('🔍 純文字編輯器 onChange 觸發:', {
              valueLength: value.length,
              valuePreview: value.substring(0, 50)
            })
            handleChange(value)
          }}
          onInput={(e) => {
            console.log('🔍 純文字編輯器 onInput 觸發 (backup)')
          }}
          onKeyDown={(e) => {
            console.log('🔍 純文字編輯器 onKeyDown 觸發:', e.key)
          }}
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
        onChange={handleChange}
        placeholder={placeholder}
        onSwitchToSimple={() => setUseSimpleEditor(true)}
      />
    </ErrorBoundary>
  )
}
