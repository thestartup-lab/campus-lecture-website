# 部署指南

本指南將協助您將網站部署到生產環境。

## 🚀 推薦部署平台：Vercel

Vercel 是 Next.js 的官方推薦部署平台，提供：
- ✅ 自動 CI/CD（Git 推送即自動部署）
- ✅ 全球 CDN 加速
- ✅ 免費 SSL 憑證
- ✅ 環境變數管理
- ✅ 自動構建與部署

## 📋 部署前準備

### 1. 確保所有代碼已提交到 Git

```bash
# 檢查未提交的變更
git status

# 提交所有變更（如有需要）
git add .
git commit -m "準備部署"
git push origin main
```

### 2. 準備環境變數清單

部署前，請準備以下環境變數：

#### Supabase 配置
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 專案 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 公開金鑰

#### Notion API 配置
- `NOTION_API_KEY` - Notion Integration Token
- `NOTION_LECTURE_APPLICATIONS_DB_ID` - 講座申請資料庫 ID
- `NOTION_POSTS_DB_ID` - 文章資料庫 ID
- `NOTION_TESTIMONIALS_DB_ID` - 讀者回饋資料庫 ID
- `NOTION_SITE_SETTINGS_DB_ID` - 網站設定資料庫 ID

#### 電子郵件服務（可選）
- `RESEND_API_KEY` - Resend API 金鑰（用於發送歡迎郵件）

## 🔧 Vercel 部署步驟

### 方法一：透過 Vercel Dashboard（推薦）

1. **註冊/登入 Vercel**
   - 前往 https://vercel.com
   - 使用 GitHub 帳號登入（推薦）

2. **匯入專案**
   - 點擊「Add New...」→「Project」
   - 選擇您的 GitHub 儲存庫
   - 點擊「Import」

3. **設定專案配置**
   - **Framework Preset**: Next.js（應自動偵測）
   - **Root Directory**: `./`（預設）
   - **Build Command**: `npm run build`（預設）
   - **Output Directory**: `.next`（預設）
   - **Install Command**: `npm install`（預設）

4. **設定環境變數**
   - 在「Environment Variables」區塊，逐項新增所有環境變數
   - 確保所有環境都勾選（Production、Preview、Development）
   - 點擊「Add」新增每個變數

5. **部署**
   - 點擊「Deploy」按鈕
   - 等待構建完成（約 2-5 分鐘）
   - 部署成功後，Vercel 會提供一個網址（例如：`your-project.vercel.app`）

### 方法二：使用 Vercel CLI

1. **安裝 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登入 Vercel**
   ```bash
   vercel login
   ```

3. **部署到預覽環境**
   ```bash
   vercel
   ```
   首次部署會提示設定環境變數

4. **部署到生產環境**
   ```bash
   vercel --prod
   ```

5. **設定環境變數（如未設定）**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add NOTION_API_KEY
   # ... 依此類推新增其他環境變數
   ```

## 🌐 自訂網域（選用）

1. **在 Vercel Dashboard 設定**
   - 前往專案 → Settings → Domains
   - 輸入您的網域名稱
   - 按照指示設定 DNS 記錄

2. **DNS 設定範例**
   - 類型：`CNAME`
   - 名稱：`@` 或 `www`
   - 值：`cname.vercel-dns.com`

## ✅ 部署後檢查清單

部署完成後，請測試以下功能：

### 基礎功能
- [ ] 首頁正常載入
- [ ] 導覽列連結正常運作
- [ ] 響應式設計在手機/平板/電腦正常顯示

### 內容功能
- [ ] 專欄文章頁面 (`/blog`) 正常顯示
- [ ] 文章詳情頁正常載入
- [ ] 講師列表頁 (`/lecturers`) 正常顯示
- [ ] 講師個人頁面正常顯示

### 表單功能
- [ ] 講座邀約表單 (`/lecture-request`) 可提交
- [ ] FAQ 諮詢表單 (`/faq`) 可提交
- [ ] 講師諮詢表單可提交
- [ ] 電子報訂閱功能正常

### 後台功能
- [ ] 登入功能正常 (`/login`)
- [ ] 講師後台 (`/dashboard`) 正常載入
- [ ] 管理員後台 (`/admin`) 正常載入（如適用）
- [ ] 資料新增/編輯/刪除功能正常

### 效能檢查
- [ ] 頁面載入速度正常（使用 Lighthouse 測試）
- [ ] 圖片正常顯示且已優化
- [ ] 沒有控制台錯誤

## 🔄 持續部署

Vercel 預設啟用自動部署：
- 推送到 `main` 分支 → 自動部署到生產環境
- 推送到其他分支 → 自動建立預覽部署
- 建立 Pull Request → 自動建立預覽部署

## 🐛 常見問題排除

### 構建失敗

1. **檢查環境變數**
   - 確認所有必要的環境變數都已設定
   - 檢查變數名稱是否正確（大小寫敏感）

2. **檢查構建日誌**
   - 在 Vercel Dashboard → Deployments → 點擊失敗的部署
   - 查看構建日誌找出錯誤原因

3. **本地測試構建**
   ```bash
   npm run build
   ```

### 環境變數未生效

- 環境變數變更後，需要重新部署才能生效
- 在 Vercel Dashboard 重新部署，或推送新的 commit

### 字體載入問題

- Next.js 會自動處理 Google Fonts 的優化
- 如遇問題，檢查 `app/layout.tsx` 中的字體導入設定

### API 路由錯誤

- 檢查環境變數是否正確設定
- 確認 Supabase 和 Notion API 憑證有效
- 查看 Vercel 函數日誌（Functions 標籤）

## 📚 其他部署平台

### Netlify

1. 註冊/登入 Netlify
2. 匯入 Git 儲存庫
3. 構建設定：
   - Build command: `npm run build`
   - Publish directory: `.next`
4. 設定環境變數（Site settings → Environment variables）
5. 部署

### Railway

1. 註冊/登入 Railway
2. 建立新專案 → Deploy from GitHub repo
3. 設定環境變數
4. 部署

### 自架伺服器

如需部署到自己的伺服器：

```bash
# 構建生產版本
npm run build

# 啟動生產伺服器
npm start
```

注意：需要設定反向代理（如 Nginx）和處理 SSL 憑證。

## 📞 需要協助？

如有部署相關問題，請參考：
- [Next.js 部署文件](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel 文件](https://vercel.com/docs)
- [Supabase 文件](https://supabase.com/docs)
