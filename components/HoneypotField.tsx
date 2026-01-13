/**
 * Honeypot 隱藏欄位組件
 * 用於防止自動化機器人提交表單
 * 
 * 使用方式：
 * 1. 在表單中加入 <HoneypotField value={honeypot} onChange={setHoneypot} />
 * 2. 提交時將 honeypot 值作為 _honeypot 欄位送出
 * 3. 後端檢查如果 _honeypot 有值，則視為機器人
 */

interface HoneypotFieldProps {
  value: string
  onChange: (value: string) => void
}

export default function HoneypotField({ value, onChange }: HoneypotFieldProps) {
  return (
    <div 
      aria-hidden="true" 
      style={{ 
        position: 'absolute',
        left: '-9999px',
        opacity: 0,
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <label htmlFor="website_url">
        請勿填寫此欄位
      </label>
      <input
        type="text"
        id="website_url"
        name="website_url"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
