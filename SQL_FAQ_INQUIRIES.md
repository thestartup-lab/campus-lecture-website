# 常見問題諮詢資料表 SQL

請在 Supabase SQL Editor 執行以下 SQL 語法：

```sql
-- 建立常見問題諮詢表
CREATE TABLE IF NOT EXISTS faq_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 建立索引以加速查詢
CREATE INDEX IF NOT EXISTS faq_inquiries_status_idx ON faq_inquiries(status);
CREATE INDEX IF NOT EXISTS faq_inquiries_created_at_idx ON faq_inquiries(created_at DESC);

-- 建立 updated_at 自動更新觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_faq_inquiries_updated_at
  BEFORE UPDATE ON faq_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 啟用 Row Level Security (RLS)
ALTER TABLE faq_inquiries ENABLE ROW LEVEL SECURITY;

-- 允許所有人插入（提交諮詢）
CREATE POLICY "Allow public insert"
  ON faq_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 允許服務端讀取（用於 API）
CREATE POLICY "Allow service read"
  ON faq_inquiries
  FOR SELECT
  USING (true);

-- 允許認證使用者更新和刪除（後台管理用）
CREATE POLICY "Allow authenticated update"
  ON faq_inquiries
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete"
  ON faq_inquiries
  FOR DELETE
  TO authenticated
  USING (true);
```

## 欄位說明

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| `id` | UUID | 主鍵 |
| `name` | TEXT | 提問者姓名 |
| `email` | TEXT | 提問者 Email |
| `content` | TEXT | 疑問內容 |
| `status` | TEXT | 狀態：pending（待處理）、replied（已回覆） |
| `created_at` | TIMESTAMP | 建立時間 |
| `updated_at` | TIMESTAMP | 更新時間 |
