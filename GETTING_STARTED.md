# 快速開始指南

## 🎉 專案已成功初始化！

您的校園講座推廣網站已經設置完成。以下是一些重要資訊：

## ✅ 已完成項目

- ✅ Next.js 14 專案初始化（使用 App Router）
- ✅ Tailwind CSS 配置完成
- ✅ Lucide React 圖標庫已安裝
- ✅ Supabase 客戶端已配置
- ✅ 導覽列組件（包含首頁、專欄、邀約申請、講師後台）
- ✅ 英雄區組件（標題：讓教育更有溫度，校園講座邀約計劃）
- ✅ 專欄文章卡片預覽區
- ✅ 電子報訂閱區
- ✅ 響應式頁尾
- ✅ 環境變數範本檔案

## 🚀 開發伺服器

開發伺服器正在運行中：
- **本地網址**: http://localhost:3001
- **網路網址**: http://192.168.50.5:3001

## 📝 下一步設置

### 1. 設置 Supabase

1. 前往 [Supabase](https://supabase.com) 創建一個新專案
2. 複製 `env.example` 為 `.env.local`：
   ```bash
   cp env.example .env.local
   ```
3. 在 `.env.local` 中填入您的 Supabase 憑證：
   - **NEXT_PUBLIC_SUPABASE_URL**: 在 Project Settings > API > Project URL
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY**: 在 Project Settings > API > Project API keys > anon public

### 2. 建議的 Supabase 資料表結構

您可能需要在 Supabase 中創建以下資料表：

#### 文章表 (articles)
```sql
create table articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  excerpt text,
  content text,
  author text not null,
  category text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### 電子報訂閱表 (newsletter_subscribers)
```sql
create table newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true
);
```

#### 講座邀約表 (invitations)
```sql
create table invitations (
  id uuid default gen_random_uuid() primary key,
  school_name text not null,
  contact_person text not null,
  email text not null,
  phone text,
  preferred_date date,
  topic text,
  message text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## 🎨 已實現功能

### 首頁包含
- **導覽列**: 響應式設計，包含行動版選單
- **英雄區**: 
  - 主標題：讓教育更有溫度，校園講座邀約計劃
  - CTA 按鈕：立即邀約講師、瀏覽專欄文章
  - 統計數據展示（500+ 合作講師、1,200+ 場次講座、50,000+ 學生參與）
- **專欄文章預覽**: 3 個範例文章卡片，包含類別、作者、日期資訊
- **電子報訂閱**: 完整的表單與狀態處理
- **頁尾**: 包含品牌資訊、快速連結、資源連結和聯絡資訊

## 📁 專案結構

```
website/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 全域佈局（包含導覽列和頁尾）
│   ├── page.tsx           # 首頁
│   └── globals.css        # 全域樣式
├── components/            # React 組件
│   ├── Navbar.tsx        # 導覽列
│   ├── Hero.tsx          # 英雄區
│   ├── ArticlePreview.tsx # 文章預覽
│   ├── Newsletter.tsx    # 電子報訂閱
│   └── Footer.tsx        # 頁尾
├── lib/                  # 工具庫
│   └── supabase.ts       # Supabase 客戶端
└── env.example           # 環境變數範本
```

## 🛠️ 接下來可以做的事

1. **整合 Supabase 資料**:
   - 修改 `ArticlePreview.tsx` 從 Supabase 抓取真實文章資料
   - 修改 `Newsletter.tsx` 將訂閱資料存入 Supabase

2. **建立其他頁面**:
   - `/articles` - 專欄列表頁面
   - `/articles/[id]` - 文章詳細頁面
   - `/invitation` - 邀約申請表單頁面
   - `/dashboard` - 講師後台管理頁面

3. **新增功能**:
   - 搜尋功能
   - 文章分類篩選
   - 使用者認證（講師登入）
   - 圖片上傳功能

4. **優化**:
   - 加入真實圖片
   - 優化 SEO
   - 加入動畫效果
   - 效能優化

## 📚 技術文件

- [Next.js 文件](https://nextjs.org/docs)
- [Tailwind CSS 文件](https://tailwindcss.com/docs)
- [Supabase 文件](https://supabase.com/docs)
- [Lucide React 圖標](https://lucide.dev)

## 🎯 設計特色

- **現代感**: 使用漸層背景、圓角設計、陰影效果
- **專業性**: 清晰的排版、一致的配色方案
- **溫暖感**: 使用藍色與橙色的溫暖色調
- **響應式**: 支援桌面、平板、手機等各種裝置
- **使用者體驗**: 流暢的過渡動畫、清晰的視覺層次

## 💡 提示

- 開發時檔案會自動重新載入
- 使用 TypeScript 獲得更好的開發體驗
- 所有組件都使用繁體中文
- Tailwind CSS 提供實用的工具類別

---

如有任何問題，請參考 `README.md` 或相關技術文件。祝開發順利！🚀
