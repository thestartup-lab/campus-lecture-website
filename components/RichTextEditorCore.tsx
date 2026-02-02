'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useCallback, useRef } from 'react'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Minus
} from 'lucide-react'

interface RichTextEditorCoreProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  onSwitchToSimple: () => void
}

export default function RichTextEditorCore({ content, onChange, placeholder = '開始撰寫您的文章...', onSwitchToSimple }: RichTextEditorCoreProps) {
  const isDestroying = useRef(false)

  useEffect(() => {
    return () => {
      isDestroying.current = true
    }
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // 保留 StarterKit 的所有預設 extensions
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    // 🔧 修復：允許重新渲染以觸發 onUpdate
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor }) => {
      if (!isDestroying.current) {
        const html = editor.getHTML()
        console.log('🔍 編輯器 onUpdate 觸發:', {
          htmlLength: html.length,
          htmlPreview: html.substring(0, 100)
        })
        onChange(html)
      }
    },
    // 🆕 添加 onBlur 回調作為備用
    onBlur: ({ editor }) => {
      if (!isDestroying.current) {
        const html = editor.getHTML()
        console.log('🔍 編輯器 onBlur 觸發 (失去焦點):', {
          htmlLength: html.length
        })
        onChange(html)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none min-h-[300px] focus:outline-none p-4',
      },
      handlePaste: () => false,
      handleDrop: () => false,
    },
  })

  // 當外部 content 變化時同步到編輯器
  useEffect(() => {
    if (editor && !isDestroying.current && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  const addLink = useCallback(() => {
    if (!editor || isDestroying.current) return
    const url = window.prompt('輸入連結網址：')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor || isDestroying.current) return
    const url = window.prompt('輸入圖片網址：')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) {
    return (
      <div className="border-2 border-black p-4 min-h-[300px] flex items-center justify-center bg-paper-dark">
        <p className="text-ink-muted">載入編輯器中...</p>
      </div>
    )
  }

  const ToolbarButton = ({ onClick, isActive, children, title }: { onClick: () => void, isActive?: boolean, children: React.ReactNode, title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 border-2 border-black transition-colors ${
        isActive ? 'bg-black text-paper' : 'bg-paper text-black hover:bg-black/10'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="border-2 border-black">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b-2 border-black bg-paper-dark">
        <button
          type="button"
          onClick={onSwitchToSimple}
          className="text-xs px-2 py-1 border border-black hover:bg-black hover:text-paper transition-colors mr-2"
          title="切換到純文字模式"
        >
          純文字
        </button>
        <div className="w-px bg-black/20 mx-1 h-6" />
        
        {/* 標題 */}
        <div className="flex">
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="標題 1">
            <Heading1 className="w-4 h-4" strokeWidth={1.5} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="標題 2">
            <Heading2 className="w-4 h-4" strokeWidth={1.5} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="標題 3">
            <Heading3 className="w-4 h-4" strokeWidth={1.5} />
          </ToolbarButton>
        </div>

        <div className="w-px bg-black/20 mx-1" />

        {/* 文字格式 */}
        <div className="flex">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="粗體">
            <Bold className="w-4 h-4" strokeWidth={1.5} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="斜體">
            <Italic className="w-4 h-4" strokeWidth={1.5} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="刪除線">
            <Strikethrough className="w-4 h-4" strokeWidth={1.5} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="程式碼">
            <Code className="w-4 h-4" strokeWidth={1.5} />
          </ToolbarButton>
        </div>

        <div className="w-px bg-black/20 mx-1" />

        {/* 列表 */}
        <div className="flex">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="項目符號列表">
            <List className="w-4 h-4" strokeWidth={1.5} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="編號列表">
            <ListOrdered className="w-4 h-4" strokeWidth={1.5} />
          </ToolbarButton>
        </div>

        <div className="w-px bg-black/20 mx-1" />

        {/* 區塊 */}
        <div className="flex">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="引用">
            <Quote className="w-4 h-4" strokeWidth={1.5} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="分隔線">
            <Minus className="w-4 h-4" strokeWidth={1.5} />
          </ToolbarButton>
        </div>

        <div className="w-px bg-black/20 mx-1" />

        {/* 連結與圖片 */}
        <div className="flex">
          <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="插入連結">
            <LinkIcon className="w-4 h-4" strokeWidth={1.5} />
          </ToolbarButton>
          <ToolbarButton onClick={addImage} title="插入圖片">
            <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
          </ToolbarButton>
        </div>

        <div className="w-px bg-black/20 mx-1" />

        {/* 復原/重做 */}
        <div className="flex">
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="復原">
            <Undo className="w-4 h-4" strokeWidth={1.5} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="重做">
            <Redo className="w-4 h-4" strokeWidth={1.5} />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="bg-white" />

      {/* 樣式 */}
      <style jsx global>{`
        .ProseMirror {
          min-height: 300px;
          padding: 1rem;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #999;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
          font-family: var(--font-serif);
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0;
          font-family: var(--font-serif);
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0;
          font-family: var(--font-serif);
        }
        .ProseMirror p {
          margin: 0.5rem 0;
          line-height: 1.75;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #000;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #666;
        }
        .ProseMirror code {
          background: #f0f0f0;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #000;
          margin: 1.5rem 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
        }
        .ProseMirror a {
          color: #0066cc;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
