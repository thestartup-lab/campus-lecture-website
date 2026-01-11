# Notion API 設定指南

本專案使用 Notion 作為講座申請單的資料庫，以下是完整的設定步驟。

> **注意**: 本專案使用 `@notionhq/client` v5+，支援 Notion API 2025-09-03 版本。

---

## 目錄

1. [建立 Notion Integration](#1-建立-notion-integration)
2. [建立講座申請資料庫](#2-建立講座申請資料庫)
3. [連接資料庫與 Integration](#3-連接資料庫與-integration)
4. [設定環境變數](#4-設定環境變數)
5. [測試連線](#5-測試連線)

---

## 1. 建立 Notion Integration

1. 前往 [Notion Integrations](https://www.notion.so/my-integrations)
2. 點擊 **「+ New integration」**
3. 填寫設定：
   - **Name**: `校園講座系統` (或您喜歡的名稱)
   - **Associated workspace**: 選擇您的工作區
   - **Type**: `Internal integration`
4. 點擊 **「Submit」** 建立
5. 複製 **Internal Integration Token** (以 `secret_` 開頭)

> ⚠️ **安全提醒**: 請妥善保管此 Token，不要將其提交到 Git 儲存庫！

---

## 2. 建立講座申請資料庫

在 Notion 中建立一個新的資料庫，並設定以下欄位：

### 必要欄位

| 欄位名稱 | 欄位類型 | 說明 |
|---------|---------|------|
| `學校名稱` | Title | 主標題欄位 |
| `聯絡人` | Rich text | 聯絡人姓名 |
| `電子郵件` | Email | 聯絡人電子郵件 |
| `聯絡電話` | Phone number | 聯絡電話 |
| `職稱` | Rich text | 聯絡人職稱 |
| `希望講師` | Rich text | 希望邀請的講師 |
| `講座類型` | Multi-select | 講座類型（可多選） |
| `聽眾類型` | Rich text | 聽眾類型描述 |
| `預估人數` | Number | 預估聽眾人數 |
| `講座日期（期待）` | Rich text | 希望的講座日期 |
| `講座形式` | Select | 選項：`實體`、`線上`、`皆可` |
| `講座內容` | Rich text | 講座內容/備註 |
| `得知管道` | Multi-select | 選項：`網站搜尋`、`社群媒體`、`朋友推薦`、`其他` |
| `狀態` | Select | 選項：`待處理`、`處理中`、`已確認`、`已完成`、`已取消` |
| `申請時間` | Created time | 自動記錄建立時間 |

### 快速建立範本

您可以在 Notion 中手動建立欄位，建議選項如下：

```
講座類型 Multi-select 建議選項:
- 生涯規劃
- 職涯發展
- 創業經驗
- 科技趨勢
- 心理健康
- 學習方法
- 溝通技巧
- 領導力培養

講座形式 Select 選項:
- 實體
- 線上
- 皆可

得知管道 Multi-select 選項:
- 網站搜尋
- 社群媒體
- 朋友推薦
- 學校推薦
- 其他

狀態 Select 選項:
- 待處理
- 處理中
- 已確認
- 已完成
- 已取消
```

---

## 3. 連接資料庫與 Integration

**這是最重要的步驟！** Integration 必須被授權存取資料庫才能運作。

1. 開啟您建立的資料庫頁面
2. 點擊右上角的 **「...」** 選單
3. 選擇 **「Add connections」** 或 **「連線」**
4. 搜尋並選擇您建立的 Integration（如 `校園講座系統`）
5. 點擊 **「Confirm」** 確認連接

> 💡 **提示**: 如果找不到您的 Integration，請確認它已經正確建立且選擇了正確的工作區。

---

## 4. 設定環境變數

### 取得資料庫 ID

1. 在瀏覽器中開啟您的資料庫
2. 查看網址列，格式類似：
   ```
   https://www.notion.so/your-workspace/abc123def456789...?v=xxx
   ```
3. 複製 `abc123def456789...` 這段（32 碼，在 `?v=` 之前）

### 設定 .env.local

在專案根目錄建立或編輯 `.env.local` 檔案：

```bash
# Notion API Configuration
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_LECTURE_APPLICATIONS_DB_ID=abc123def456789012345678901234567
```

---

## 5. 測試連線

### 使用 API 測試

啟動開發伺服器後，可以透過以下方式測試：

```bash
# 測試 GET 請求（查詢申請列表）
curl http://localhost:3000/api/lecture-applications

# 測試 POST 請求（建立新申請）
curl -X POST http://localhost:3000/api/lecture-applications \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName": "測試學校",
    "contactName": "測試聯絡人",
    "contactEmail": "test@example.com",
    "lectureTopics": ["生涯規劃"],
    "audienceType": "學生",
    "preferredDates": ["2026-02-01"],
    "lectureFormat": "實體"
  }'
```

### 預期回應

成功時：
```json
{
  "success": true,
  "message": "講座申請已成功送出！我們將盡快與您聯繫。",
  "data": {
    "notionPageId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "supabaseId": null
  }
}
```

---

## 常見問題

### Q: 出現 "NOTION_API_KEY 環境變數未設定" 錯誤
**A:** 請確認 `.env.local` 檔案已正確建立，且 `NOTION_API_KEY` 的值正確。開發伺服器需要重啟才能讀取新的環境變數。

### Q: 出現 "Could not find database" 錯誤
**A:** 請確認：
1. 資料庫 ID 正確（32 碼）
2. Integration 已經被連接到該資料庫（步驟 3）
3. 資料庫不是 inline database（需要是 full-page database）

### Q: 出現 "property does not exist" 錯誤
**A:** 請確認資料庫中的欄位名稱與程式碼中設定的完全一致（包括空格）。

### Q: 資料成功送出但 Notion 沒有顯示
**A:** 
1. 確認您查看的是正確的資料庫
2. 檢查資料庫的 View filter，可能被篩選掉了
3. 嘗試重新整理 Notion 頁面

---

## 進階設定

### 雙重儲存（Notion + Supabase）

本專案預設會同時將申請單儲存到 Notion 和 Supabase（如果 `applications` 表存在的話）。這提供了資料備份的安全性。

若要建立 Supabase 的 `applications` 表，請執行以下 SQL：

```sql
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  contact_title TEXT,
  preferred_lecturer TEXT,
  lecture_topics TEXT[] DEFAULT '{}',
  audience_type TEXT NOT NULL,
  audience_count INTEGER,
  preferred_dates TEXT[] DEFAULT '{}',
  lecture_format TEXT NOT NULL,
  venue TEXT,
  additional_notes TEXT,
  how_did_you_hear TEXT,
  status TEXT DEFAULT 'pending',
  notion_page_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 建立政策
CREATE POLICY "Anyone can insert applications" ON applications
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Authenticated users can read applications" ON applications
  FOR SELECT TO authenticated USING (true);
```

---

## 需要協助？

如果您在設定過程中遇到問題，請參考：
- [Notion API 官方文件](https://developers.notion.com/)
- [Notion Integration 指南](https://developers.notion.com/docs/create-a-notion-integration)
