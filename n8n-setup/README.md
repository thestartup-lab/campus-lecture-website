# Notion 多平台文章發佈系統

自動從 Notion 同步發佈文章到 Facebook、Threads、LINE 社群、Skool

## 📋 系統架構

```
Notion 資料庫（文章狀態改為「已發佈」）
    ↓
n8n Webhook/Polling 觸發
    ↓
├─ Facebook 粉專
├─ Threads
├─ LINE 社群
└─ Skool 社群
    ↓
更新 Notion（記錄發佈狀態和連結）
```

## 🚀 快速開始

### 1. 建立 Notion 資料庫

在 Notion 中建立一個新的資料庫，包含以下欄位：

**基本資訊：**
- 標題（Title）
- 內容（Text）
- 摘要（Text）
- 封面圖片（Files & media）

**發佈控制：**
- 發佈狀態（Select）：草稿、待發佈、已發佈
- 排程時間（Date）
- 發佈平台（Multi-select）：FB、Threads、LINE、Skool

**發佈記錄：**
- FB 發佈狀態（Select）
- FB 貼文連結（URL）
- Threads 發佈狀態（Select）
- Threads 貼文連結（URL）
- LINE 發佈狀態（Select）
- Skool 發佈狀態（Select）
- Skool 貼文連結（URL）

### 2. 取得各平台 API 憑證

#### Facebook

1. 前往 [Facebook for Developers](https://developers.facebook.com/)
2. 建立應用程式
3. 新增「Facebook Login」和「Page Management」權限
4. 取得粉專的 Page Access Token
5. 取得粉專 ID

**所需權限：**
- `pages_manage_posts`
- `pages_read_engagement`
- `pages_show_list`

#### Threads

Threads 目前使用 Instagram Graph API：

1. 確保你的 Instagram 帳號是商業帳號
2. 連結到 Facebook 粉專
3. 使用 Instagram Graph API
4. 取得 User ID 和 Access Token

**API 文件：**
- https://developers.facebook.com/docs/instagram-api/

#### LINE

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 建立 Messaging API channel
3. 取得 Channel Access Token
4. 將 LINE Bot 加入你的社群
5. 取得 Group ID（可透過 Webhook 事件取得）

**所需設定：**
- 開啟「Use webhooks」
- 允許 Bot 加入群組

#### Skool

⚠️ **注意：Skool 目前沒有官方 API**

替代方案：
1. 使用 Zapier + Skool 整合（如果有）
2. 使用瀏覽器自動化（Puppeteer/Playwright）
3. 手動複製貼上（最簡單但不自動）
4. 等待 Skool 官方 API 推出

### 3. 設定環境變數

複製 `.env.example` 為 `.env` 並填入你的憑證：

```bash
cp .env.example .env
```

編輯 `.env` 檔案，填入所有必要的 API 憑證。

### 4. 啟動 n8n

```bash
docker-compose up -d
```

### 5. 訪問 n8n 介面

開啟瀏覽器訪問：
```
http://localhost:5678
```

使用 `.env` 中設定的帳號密碼登入。

### 6. 匯入 Workflow

1. 在 n8n 介面點選「Workflows」
2. 點選「Import from File」
3. 選擇 `workflows/notion-to-social-media.json`
4. 設定好所有連接器的憑證

## 📝 使用方式

### 發佈文章流程

1. **在 Notion 寫文章**
   - 填寫標題、內容、摘要
   - 上傳封面圖片（選填）
   - 選擇要發佈的平台

2. **設定發佈狀態**
   - 將「發佈狀態」改為「已發佈」
   - 或設定「排程時間」

3. **自動發佈**
   - n8n 會自動偵測變更
   - 依序發佈到選定的平台
   - 回寫發佈狀態和連結到 Notion

4. **檢查結果**
   - 在 Notion 查看各平台的發佈狀態
   - 點擊連結查看實際貼文

## 🔧 進階設定

### 排程發佈

n8n workflow 包含排程檢查功能：
- 每 15 分鐘檢查一次 Notion
- 自動發佈到達排程時間的文章

### 圖片處理

workflow 會自動：
- 下載 Notion 的封面圖片
- 轉換為各平台支援的格式
- 上傳到對應平台

### 錯誤處理

如果發佈失敗：
- 在 Notion 標記為「失敗」
- 發送通知（可選）
- 保留錯誤訊息以便除錯

## 🛠️ Workflow 架構

### 主要節點

1. **Trigger Node**
   - Notion Trigger（監聽資料庫變更）
   - Schedule Trigger（每 15 分鐘檢查排程）

2. **Filter Node**
   - 檢查發佈狀態 = "已發佈"
   - 檢查排程時間 <= 現在

3. **Split Node**
   - 根據「發佈平台」分流

4. **Platform Nodes**
   - Facebook HTTP Request
   - Threads HTTP Request
   - LINE HTTP Request
   - Skool（需要自訂處理）

5. **Update Node**
   - 回寫發佈狀態到 Notion
   - 記錄貼文連結

## 📊 各平台 API 說明

### Facebook API

```javascript
// POST https://graph.facebook.com/v18.0/{page-id}/feed
{
  "message": "文章內容",
  "link": "原文連結（選填）",
  "access_token": "你的Token"
}
```

### Threads API

```javascript
// 步驟 1: 建立容器
// POST https://graph.threads.net/v1.0/{user-id}/threads
{
  "media_type": "TEXT",
  "text": "文章內容"
}

// 步驟 2: 發佈
// POST https://graph.threads.net/v1.0/{user-id}/threads_publish
{
  "creation_id": "容器ID"
}
```

### LINE Messaging API

```javascript
// POST https://api.line.me/v2/bot/message/push
{
  "to": "群組ID",
  "messages": [
    {
      "type": "text",
      "text": "文章內容"
    }
  ]
}
```

### Skool（無官方 API）

目前建議方案：
1. 使用瀏覽器自動化
2. 或手動發佈
3. 或透過 Email to Post（如果 Skool 支援）

## 🐛 故障排除

### n8n 無法啟動

```bash
# 查看日誌
docker-compose logs -f n8n

# 重新啟動
docker-compose restart n8n
```

### Notion Trigger 沒有觸發

檢查：
1. Notion API Key 是否正確
2. 資料庫 ID 是否正確
3. Integration 是否有權限存取資料庫

### Facebook 發佈失敗

常見問題：
1. Access Token 過期（定期更新）
2. 缺少權限（檢查 pages_manage_posts）
3. 粉專 ID 錯誤

### LINE 發佈失敗

常見問題：
1. Bot 沒有加入社群
2. Group ID 錯誤
3. Channel Access Token 錯誤

## 📚 參考資源

- [Notion API 文件](https://developers.notion.com/)
- [n8n 文件](https://docs.n8n.io/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
- [Threads API](https://developers.facebook.com/docs/threads)
- [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/)

## 🔐 安全性建議

1. **不要將 `.env` 檔案提交到 Git**
2. **定期更換 Access Token**
3. **使用強密碼保護 n8n**
4. **考慮使用 HTTPS（生產環境）**
5. **限制 IP 存取（如果可能）**

## 📝 授權

MIT License
