# Newsletter Subscribers Table Update

在 Supabase SQL Editor 執行以下語句，為 `newsletter_subscribers` 表新增姓名與學校/單位欄位：

```sql
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS organization TEXT;
```
