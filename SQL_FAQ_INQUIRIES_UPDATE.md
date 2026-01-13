# 常見問題諮詢資料表擴充 SQL

請在 Supabase SQL Editor 執行以下 SQL 語法，為 `faq_inquiries` 表新增 `target_lecturer_id` 欄位：

```sql
-- 新增 target_lecturer_id 欄位（關聯到 profiles 表）
ALTER TABLE faq_inquiries
ADD COLUMN IF NOT EXISTS target_lecturer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 建立索引以加速查詢
CREATE INDEX IF NOT EXISTS faq_inquiries_target_lecturer_id_idx ON faq_inquiries(target_lecturer_id);

-- 建立部分索引（僅索引有 target_lecturer_id 的記錄）
CREATE INDEX IF NOT EXISTS faq_inquiries_has_lecturer_idx ON faq_inquiries(target_lecturer_id) WHERE target_lecturer_id IS NOT NULL;
```

## 欄位說明

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| `target_lecturer_id` | UUID | 目標講師 ID（可選，NULL 表示一般網站諮詢） |

## 更新後的完整欄位

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| `id` | UUID | 主鍵 |
| `name` | TEXT | 提問者姓名 |
| `email` | TEXT | 提問者 Email |
| `content` | TEXT | 疑問內容 |
| `target_lecturer_id` | UUID | 目標講師 ID（可選） |
| `status` | TEXT | 狀態：pending（待處理）、replied（已回覆） |
| `created_at` | TIMESTAMP | 建立時間 |
| `updated_at` | TIMESTAMP | 更新時間 |
