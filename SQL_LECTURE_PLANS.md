# 講座規劃需求資料表 SQL

請在 Supabase SQL Editor 執行以下 SQL 語法：

```sql
-- 建立講座規劃需求表
CREATE TABLE IF NOT EXISTS lecture_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audience TEXT NOT NULL,
  pain_points TEXT NOT NULL,
  budget TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 建立索引以加速查詢
CREATE INDEX IF NOT EXISTS lecture_plans_status_idx ON lecture_plans(status);
CREATE INDEX IF NOT EXISTS lecture_plans_created_at_idx ON lecture_plans(created_at DESC);

-- 建立 updated_at 自動更新觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lecture_plans_updated_at
  BEFORE UPDATE ON lecture_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 啟用 Row Level Security (RLS)
ALTER TABLE lecture_plans ENABLE ROW LEVEL SECURITY;

-- 允許所有人插入（提交需求）
CREATE POLICY "Allow public insert"
  ON lecture_plans
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 允許認證使用者讀取所有記錄（後台管理用）
CREATE POLICY "Allow authenticated read"
  ON lecture_plans
  FOR SELECT
  TO authenticated
  USING (true);
```

## 欄位說明

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| `id` | UUID | 主鍵 |
| `audience` | TEXT | 對象與人數 |
| `pain_points` | TEXT | 核心痛點或需求 |
| `budget` | TEXT | 經費預算與時數限制 |
| `contact_email` | TEXT | 聯絡 Email |
| `status` | TEXT | 狀態：pending（待處理）、in_progress（處理中）、completed（已完成）、cancelled（已取消） |
| `created_at` | TIMESTAMP | 建立時間 |
| `updated_at` | TIMESTAMP | 更新時間 |
