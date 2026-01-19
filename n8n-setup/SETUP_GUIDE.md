# 🚀 完整設定教學

## 步驟 1：建立 Notion 資料庫

### 1.1 在 Notion 建立新頁面

1. 開啟 Notion
2. 建立新頁面，命名為「文章發佈系統」
3. 選擇「Table」模板

### 1.2 設定資料庫欄位

按照以下順序建立欄位：

| 欄位名稱 | 類型 | 選項 | 說明 |
|---------|------|------|------|
| 標題 | Title | - | 自動建立 |
| 內容 | Text | - | 文章完整內容 |
| 摘要 | Text | - | 簡短摘要（選填） |
| 封面圖片 | Files & media | - | 選填 |
| 發佈狀態 | Select | 草稿、待發佈、已發佈 | **必要** |
| 排程時間 | Date | 包含時間 | 選填 |
| 發佈平台 | Multi-select | FB、Threads、LINE、Skool | **必要** |
| 標籤 | Multi-select | 自訂 | 選填 |
| FB 發佈狀態 | Select | 待處理、成功、失敗 | 自動更新 |
| FB 貼文連結 | URL | - | 自動更新 |
| Threads 發佈狀態 | Select | 待處理、成功、失敗 | 自動更新 |
| Threads 貼文連結 | URL | - | 自動更新 |
| LINE 發佈狀態 | Select | 待處理、成功、失敗 | 自動更新 |
| Skool 發佈狀態 | Select | 待處理、成功、失敗 | 手動或自動 |
| Skool 貼文連結 | URL | - | 手動輸入 |
| 建立時間 | Created time | - | 自動 |
| 作者 | Person | - | 選填 |

### 1.3 建立 Notion Integration

1. 前往 https://www.notion.so/my-integrations
2. 點擊「New integration」
3. 命名為「文章發佈系統」
4. 選擇你的 Workspace
5. 設定權限：
   - ✅ Read content
   - ✅ Update content
   - ✅ Insert content
6. 複製「Internal Integration Token」（稍後使用）

### 1.4 連接 Integration 到資料庫

1. 開啟你剛建立的資料庫頁面
2. 點擊右上角「...」選單
3. 選擇「Add connections」
4. 選擇「文章發佈系統」Integration
5. 點擊「Confirm」

### 1.5 取得資料庫 ID

資料庫 ID 在頁面 URL 中：

```
https://www.notion.so/workspace/[DATABASE_ID]?v=...
                              ^^^^^^^^^^^^^^^^
                              這就是資料庫 ID
```

或使用完整 URL 格式：
```
https://notion.so/[DATABASE_ID]
```

---

## 步驟 2：設定各平台 API

### 2.1 Facebook 設定

#### A. 建立 Facebook App

1. 前往 https://developers.facebook.com/
2. 點擊「My Apps」→「Create App」
3. 選擇「Business」類型
4. 填寫 App 名稱
5. 建立 App

#### B. 設定權限

1. 在左側選單選擇「App Settings」→「Basic」
2. 記下「App ID」和「App Secret」
3. 在左側選單新增「Facebook Login」產品
4. 設定「Valid OAuth Redirect URIs」

#### C. 取得 Page Access Token

1. 前往 https://developers.facebook.com/tools/explorer/
2. 選擇你的 App
3. 選擇「User or Page」→ 選擇你的粉專
4. 新增權限：
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`
5. 點擊「Generate Access Token」
6. 將 Token 延長有效期限：

```bash
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}"
```

#### D. 取得 Page ID

1. 前往你的粉專
2. 點擊「About」
3. 找到「Page ID」
4. 或使用 Graph API：

```bash
curl -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token={user-access-token}"
```

### 2.2 Threads 設定

⚠️ **注意：Threads API 目前仍在測試階段**

#### A. 確認帳號類型

1. 你的 Instagram 帳號必須是「專業帳號」（Professional Account）
2. 必須連結到 Facebook 粉專

#### B. 轉換為專業帳號

1. 開啟 Instagram App
2. 前往「設定」→「帳號」
3. 選擇「切換至專業帳號」
4. 選擇類別並完成設定

#### C. 連結到 Facebook

1. 在 Instagram 設定中
2. 選擇「連結的帳號」
3. 連結你的 Facebook 粉專

#### D. 使用 Instagram Graph API

Threads 使用與 Instagram 相同的 API：

1. 使用與 Facebook 相同的 App
2. 新增「Instagram Graph API」產品
3. 取得權限：
   - `instagram_basic`
   - `instagram_content_publish`
4. 取得 Instagram Business Account ID

**取得 Instagram Business Account ID：**

```bash
curl -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token={access-token}"
# 從回應中找到 instagram_business_account.id
```

### 2.3 LINE 設定

#### A. 建立 LINE Provider

1. 前往 https://developers.line.biz/console/
2. 如果還沒有 Provider，點擊「Create」
3. 填寫 Provider 名稱
4. 點擊「Create」

#### B. 建立 Messaging API Channel

1. 點擊「Create a new channel」
2. 選擇「Messaging API」
3. 填寫資訊：
   - Channel name: 文章發佈機器人
   - Channel description: 自動發佈文章到 LINE 社群
   - Category: 選擇適合的分類
   - Subcategory: 選擇適合的子分類
4. 同意條款，點擊「Create」

#### C. 設定 Channel

1. 進入剛建立的 Channel
2. 在「Messaging API」分頁：
   - **取得 Channel Access Token**：
     - 點擊「Issue」按鈕
     - 複製 Token（長期有效）
   - **設定 Webhook**：
     - 先暫時關閉（可選）
   - **允許 Bot 加入群組**：
     - 在「LINE Official Account features」區域
     - 將「Allow bot to join group chats」設為「Enabled」

#### D. 將 Bot 加入 LINE 社群

1. 在 Channel 設定頁面找到「Bot basic ID」（例如：@abc1234）
2. 在 LINE App 中搜尋這個 ID
3. 加為好友
4. 將 Bot 邀請到你的社群

#### E. 取得 Group ID

有兩種方法：

**方法 1：使用 Webhook（推薦）**

1. 在 n8n 建立一個 Webhook 節點
2. 複製 Webhook URL
3. 在 LINE Developers Console 設定 Webhook URL
4. 在社群中發送任意訊息
5. 查看 Webhook 收到的資料，其中 `source.groupId` 就是 Group ID

**方法 2：使用 LINE API**

如果 Bot 是管理員，可以透過 API 列出所有群組。

### 2.4 Skool 設定

⚠️ **重要：Skool 目前沒有公開 API**

目前的替代方案：

#### 方案 A：手動發佈（最簡單）

1. 在 Notion 將文章標記為「已發佈」
2. n8n 發佈到其他平台（FB、Threads、LINE）
3. 手動複製貼上到 Skool
4. 手動更新 Skool 貼文連結到 Notion

#### 方案 B：使用瀏覽器自動化（進階）

使用 Puppeteer 或 Playwright：

1. 在 n8n 安裝社群節點
2. 使用「Execute Command」或「HTTP Request」
3. 透過 Headless Browser 自動登入並發佈

**注意：這可能違反 Skool 使用條款，請謹慎使用**

#### 方案 C：等待官方 API

Skool 團隊可能會在未來推出 API，屆時可以整合。

---

## 步驟 3：啟動 n8n

### 3.1 安裝 Docker

如果還沒安裝 Docker：

**macOS：**
```bash
brew install --cask docker
```

**或下載 Docker Desktop：**
https://www.docker.com/products/docker-desktop

### 3.2 設定環境變數

1. 進入 `n8n-setup` 目錄：

```bash
cd /Users/lipeter/Documents/website/n8n-setup
```

2. 複製環境變數範本：

```bash
cp .env.example .env
```

3. 編輯 `.env` 檔案，填入你取得的所有 Token 和 ID：

```bash
# 使用任何編輯器
nano .env
# 或
code .env
# 或
vim .env
```

### 3.3 啟動 n8n

```bash
docker-compose up -d
```

### 3.4 檢查狀態

```bash
# 查看 n8n 是否正常運行
docker-compose ps

# 查看 logs
docker-compose logs -f n8n
```

### 3.5 訪問 n8n

開啟瀏覽器訪問：
```
http://localhost:5678
```

使用 `.env` 中設定的帳號密碼登入。

---

## 步驟 4：設定 n8n Workflow

### 4.1 匯入 Workflow

1. 在 n8n 介面中，點擊「Workflows」
2. 點擊「Import from File」
3. 選擇 `workflows/notion-to-social-media.json`
4. 點擊「Import」

### 4.2 設定 Notion 憑證

1. 點擊任一個 Notion 節點
2. 在「Credentials」欄位點擊「Create New」
3. 選擇「Notion API」
4. 填入資訊：
   - **Name**: Notion API
   - **API Key**: 你的 Notion Integration Token
5. 點擊「Save」

### 4.3 測試連線

1. 點擊「查詢待發佈文章」節點
2. 點擊「Execute Node」
3. 檢查是否能正確讀取 Notion 資料

### 4.4 啟用 Workflow

1. 點擊右上角的「Inactive」開關
2. 變成「Active」表示已啟用
3. Workflow 現在會每 15 分鐘自動執行一次

---

## 步驟 5：測試發佈

### 5.1 在 Notion 建立測試文章

1. 在 Notion 資料庫新增一行
2. 填寫：
   - **標題**: 測試文章
   - **內容**: 這是一篇測試文章，用來測試自動發佈功能。
   - **發佈狀態**: 草稿（先不要改為已發佈）
   - **發佈平台**: 勾選「FB」

### 5.2 手動執行 Workflow

為了快速測試，不用等 15 分鐘：

1. 在 n8n 中開啟 Workflow
2. 先將文章的「發佈狀態」改為「已發佈」
3. 點擊「Execute Workflow」
4. 查看執行結果

### 5.3 檢查結果

1. **在 n8n 查看**：
   - 檢查每個節點是否成功執行
   - 查看是否有錯誤訊息

2. **在 Facebook 查看**：
   - 前往你的粉專
   - 確認文章是否成功發佈

3. **在 Notion 查看**：
   - 檢查「FB 發佈狀態」是否更新為「成功」
   - 檢查「FB 貼文連結」是否有填入

### 5.4 測試其他平台

重複上述步驟，分別測試：
- Threads
- LINE
- 多平台同時發佈

---

## 步驟 6：進階設定（選用）

### 6.1 設定 HTTPS（生產環境）

使用 Nginx + Let's Encrypt：

```bash
# 安裝 Certbot
brew install certbot

# 取得憑證
sudo certbot certonly --standalone -d your-domain.com

# 設定 Nginx reverse proxy
```

### 6.2 設定自動備份

```bash
# 在 crontab 新增定期備份
crontab -e

# 新增以下行（每天凌晨 2 點備份）
0 2 * * * docker exec n8n-social-publisher n8n export:workflow --backup --output=/backups
```

### 6.3 設定錯誤通知

在 Workflow 中新增「Error Trigger」節點：

1. 新增「Error Trigger」節點
2. 連接到「Send Email」或「Slack」節點
3. 當任何節點失敗時，會自動發送通知

### 6.4 設定圖片處理

如果要發佈圖片：

1. 新增「HTTP Request」節點下載 Notion 圖片
2. 新增「Binary Data」處理
3. 上傳到各平台

---

## 常見問題

### Q1: n8n 無法連接到 Notion

**檢查：**
1. Notion API Key 是否正確
2. Integration 是否已連接到資料庫
3. 資料庫 ID 是否正確

### Q2: Facebook 發佈失敗「Invalid OAuth access token」

**解決：**
1. Access Token 可能已過期
2. 重新生成 Page Access Token
3. 確保使用「長期 Token」

### Q3: LINE 無法發送訊息

**檢查：**
1. Bot 是否已加入社群
2. Channel Access Token 是否正確
3. Group ID 是否正確（包含 'C' 或 'R' 開頭）

### Q4: Threads 發佈失敗

**可能原因：**
1. Threads API 仍在測試階段，可能不穩定
2. Instagram 帳號未正確連結
3. Access Token 權限不足

### Q5: Workflow 不會自動執行

**檢查：**
1. Workflow 是否已啟用（Active）
2. n8n 容器是否正常運行
3. 查看 n8n logs

---

## 下一步

✅ 完成基本設定後，你可以：

1. 在 Notion 正式使用系統
2. 觀察一週，確保穩定運行
3. 根據需求調整 Workflow
4. 新增更多平台（如 Twitter、Instagram 等）
5. 設定更複雜的發佈邏輯（如不同時段、不同內容）

## 獲取幫助

- [n8n 社群論壇](https://community.n8n.io/)
- [Notion API 文件](https://developers.notion.com/)
- [Facebook Graph API 文件](https://developers.facebook.com/docs/graph-api/)

祝你使用愉快！🎉
