# 校園講座推廣網站

讓教育更有溫度的校園講座邀約計劃平台

## 專案簡介

這是一個使用 Next.js 14 (App Router) 開發的校園講座推廣網站，旨在連結專業講師與校園，為學生帶來啟發性的學習體驗。

## 技術堆疊

- **前端框架**: Next.js 14 (App Router)
- **樣式**: Tailwind CSS
- **圖標**: Lucide React
- **資料庫**: Supabase
- **語言**: TypeScript

## 功能特色

- 📚 現代化響應式設計
- 🎨 專業且溫暖的使用者介面
- 📝 專欄文章系統
- 📧 電子報訂閱功能
- 🎤 講師後台管理
- 📋 邀約申請系統

## 快速開始

### 1. 安裝依賴套件

```bash
npm install
```

### 2. 設置環境變數

複製 `env.example` 檔案並重新命名為 `.env.local`：

```bash
cp env.example .env.local
```

然後在 `.env.local` 中填入您的 Supabase 憑證：

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

您可以在 Supabase 專案設定中找到這些資訊：
- Project Settings > API > Project URL
- Project Settings > API > Project API keys > anon public

### 3. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器並前往 [http://localhost:3000](http://localhost:3000) 查看結果。

## 專案結構

```
website/
├── app/                  # Next.js App Router 目錄
│   ├── layout.tsx       # 全域佈局
│   ├── page.tsx         # 首頁
│   └── globals.css      # 全域樣式
├── components/          # React 組件
│   ├── Navbar.tsx       # 導覽列
│   ├── Hero.tsx         # 英雄區
│   ├── ArticlePreview.tsx  # 文章預覽卡片
│   ├── Newsletter.tsx   # 電子報訂閱
│   └── Footer.tsx       # 頁尾
├── lib/                 # 工具函式庫
│   └── supabase.ts      # Supabase 客戶端配置
├── public/              # 靜態資源
└── env.example          # 環境變數範本
```

## 開發指南

### 修改首頁內容

編輯 `app/page.tsx` 來修改首頁的組件排列。

### 新增頁面

在 `app` 目錄下創建新的資料夾和 `page.tsx` 檔案。例如：

```
app/
└── about/
    └── page.tsx
```

### 自訂樣式

主要樣式定義在 `app/globals.css` 中，使用 Tailwind CSS 的設計系統。

## 部署

### 部署到 Vercel

最簡單的部署方式是使用 [Vercel Platform](https://vercel.com/new)：

1. 將專案推送到 GitHub
2. 在 Vercel 中匯入專案
3. 設定環境變數
4. 點擊部署

### 部署到其他平台

請參考 [Next.js 部署文件](https://nextjs.org/docs/app/building-your-application/deploying)。

## 建構生產版本

```bash
npm run build
npm start
```

## 相關資源

- [Next.js 文件](https://nextjs.org/docs)
- [Tailwind CSS 文件](https://tailwindcss.com/docs)
- [Supabase 文件](https://supabase.com/docs)
- [Lucide React 圖標](https://lucide.dev)

## 授權

MIT License
