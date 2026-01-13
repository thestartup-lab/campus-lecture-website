# 講座規劃需求資料表 SQL（修正版）

如果後台無法顯示資料，請執行以下修正 SQL：

## 問題診斷

1. **檢查資料表是否存在**：
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'lecture_plans'
);
```

2. **檢查是否有資料**：
```sql
SELECT COUNT(*) FROM lecture_plans;
```

3. **檢查 RLS 政策**：
```sql
SELECT * FROM pg_policies WHERE tablename = 'lecture_plans';
```

## 修正 RLS 政策

如果資料表已存在但無法讀取，請執行以下 SQL 來修正 RLS 政策：

```sql
-- 刪除現有的 SELECT 政策（如果存在）
DROP POLICY IF EXISTS "Allow authenticated read" ON lecture_plans;

-- 建立新的 SELECT 政策（允許服務端讀取）
CREATE POLICY "Allow service read"
  ON lecture_plans
  FOR SELECT
  USING (true);
```

**注意**：這個政策會允許所有人讀取。如果只希望管理員看到，可以改為：

```sql
-- 刪除現有的 SELECT 政策
DROP POLICY IF EXISTS "Allow authenticated read" ON lecture_plans;

-- 只允許認證使用者讀取（但在服務端 API 中可能仍然無法工作）
-- 建議使用上面的 "Allow service read" 政策
CREATE POLICY "Allow authenticated read"
  ON lecture_plans
  FOR SELECT
  TO authenticated
  USING (true);
```

## 完整的資料表建立 SQL（如果資料表不存在）

如果資料表不存在，請執行完整的建立 SQL：

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
DROP POLICY IF EXISTS "Allow public insert" ON lecture_plans;
CREATE POLICY "Allow public insert"
  ON lecture_plans
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 允許服務端讀取（用於 API）
DROP POLICY IF EXISTS "Allow service read" ON lecture_plans;
CREATE POLICY "Allow service read"
  ON lecture_plans
  FOR SELECT
  USING (true);
```
