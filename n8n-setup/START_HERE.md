# 🎯 快速開始指南

## 📌 你需要準備的東西

1. ✅ Notion 帳號（免費版即可）
2. ✅ Facebook 粉專
3. ✅ Instagram/Threads 帳號（需轉為商業帳號）
4. ✅ LINE Official Account
5. ✅ Skool 社群帳號
6. ✅ Docker（用來跑 n8n）

---

## 🚀 5 分鐘快速設定

### 步驟 1: 建立 Notion 資料庫 (2 分鐘)

1. 開啟 Notion
2. 建立新頁面 → 選擇「Table」
3. 新增以下欄位：
   - 標題（已有）
   - 內容（Text）
   - 發佈狀態（Select）：草稿、已發佈
   - 發佈平台（Multi-select）：FB、Threads、LINE、Skool

4. 建立 Notion Integration：
   - 前往 https://www.notion.so/my-integrations
   - 新增 Integration
   - 複製 API Key

5. 連接 Integration 到你的資料庫

### 步驟 2: 啟動 n8n (1 分鐘)

```bash
cd /Users/lipeter/Documents/website/n8n-setup

# 複製環境變數範本
cp env.template .env

# 編輯 .env，填入你的 Token（先填 Notion 的就好）
nano .env

# 啟動 n8n
docker-compose up -d

# 查看狀態
docker-compose ps
```

### 步驟 3: 訪問 n8n (30 秒)

開啟瀏覽器：http://localhost:5678

使用 `.env` 中的帳號密碼登入。

### 步驟 4: 匯入 Workflow (1 分鐘)

1. 點擊「Import Workflow」
2. 選擇 `workflows/notion-to-social-media.json`
3. 設定 Notion 憑證
4. 啟用 Workflow

### 步驟 5: 測試 (30 秒)

1. 在 Notion 新增一篇文章
2. 將「發佈狀態」改為「已發佈」
3. 選擇「發佈平台」
4. 在 n8n 手動執行 Workflow
5. 檢查是否成功！

---

## 📚 完整設定教學

- **詳細設定步驟**: 請看 [`SETUP_GUIDE.md`](./SETUP_GUIDE.md)
- **使用說明**: 請看 [`README.md`](./README.md)

---

## 🎯 建議的學習路徑

### 第一天：基礎設定
- [ ] 建立 Notion 資料庫
- [ ] 啟動 n8n
- [ ] 測試基本連線

### 第二天：Facebook 整合
- [ ] 設定 Facebook Developer App
- [ ] 取得 Page Access Token
- [ ] 測試發佈到 Facebook

### 第三天：其他平台
- [ ] 設定 Threads
- [ ] 設定 LINE
- [ ] 設定 Skool（手動或自動化）

### 第四天：優化
- [ ] 調整發佈格式
- [ ] 設定錯誤通知
- [ ] 建立排程發佈

---

## ⚠️ 重要注意事項

1. **Facebook Token 會過期**
   - 需要定期更新（每 60 天）
   - 建議設定提醒

2. **LINE Bot 需要加入社群**
   - 記得邀請 Bot 到社群
   - 取得正確的 Group ID

3. **Skool 沒有官方 API**
   - 目前建議手動發佈
   - 或使用瀏覽器自動化（進階）

4. **Threads 仍在測試階段**
   - API 可能不穩定
   - 帳號需為商業帳號

---

## 🆘 遇到問題？

### 常見問題快速修復

**n8n 無法啟動**
```bash
docker-compose down
docker-compose up -d
docker-compose logs -f
```

**Notion 連接失敗**
- 檢查 API Key 是否正確
- 確認 Integration 已連接到資料庫

**Facebook 發佈失敗**
- Token 可能過期，需重新生成
- 檢查粉專權限

**Workflow 不會自動執行**
- 確認 Workflow 已啟用（Active）
- 檢查 n8n 容器狀態

---

## 📞 需要幫助

如果遇到問題：

1. 查看 [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) 的詳細教學
2. 查看 n8n logs：`docker-compose logs -f`
3. 參考官方文件：
   - [n8n 文件](https://docs.n8n.io/)
   - [Notion API](https://developers.notion.com/)

---

## 🎉 完成設定後

你就可以：

✅ 在 Notion 寫好文章  
✅ 點擊「已發佈」  
✅ 自動發送到多個平台  
✅ 自動記錄發佈狀態  

開始享受自動化的便利吧！🚀
