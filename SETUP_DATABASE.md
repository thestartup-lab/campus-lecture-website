# Supabase 資料庫設置教學

本文件將引導您在 Supabase 中建立校園講座推廣網站所需的所有資料表。

## 📋 前置準備

1. 前往 [Supabase](https://supabase.com) 註冊並登入
2. 建立一個新專案
3. 等待專案初始化完成（約 2 分鐘）
4. 進入 SQL Editor 執行以下 SQL 語法

## 🗄️ 資料表架構

### 1. 文章表 (posts)

儲存所有專欄文章的資料。

```sql
-- 建立文章表
create table posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  excerpt text,
  content text not null,
  author text not null,
  category text not null,
  image_url text,
  status text default 'published' check (status in ('draft', 'published', 'archived')),
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 建立索引以加速查詢
create index posts_category_idx on posts(category);
create index posts_status_idx on posts(status);
create index posts_created_at_idx on posts(created_at desc);

-- 建立 updated_at 自動更新觸發器
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_posts_updated_at
  before update on posts
  for each row
  execute function update_updated_at_column();

-- 啟用 Row Level Security (RLS)
alter table posts enable row level security;

-- 允許所有人讀取已發布的文章
create policy "公開已發布的文章"
  on posts for select
  using (status = 'published');

-- 允許認證使用者建立和更新文章
create policy "認證使用者可以建立文章"
  on posts for insert
  with check (auth.role() = 'authenticated');

create policy "認證使用者可以更新自己的文章"
  on posts for update
  using (auth.role() = 'authenticated');
```

### 2. 電子報訂閱表 (newsletter_subscribers)

儲存電子報訂閱者的資訊。

```sql
-- 建立電子報訂閱表
create table newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  is_active boolean default true,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unsubscribed_at timestamp with time zone
);

-- 建立索引
create index newsletter_subscribers_email_idx on newsletter_subscribers(email);
create index newsletter_subscribers_is_active_idx on newsletter_subscribers(is_active);

-- 啟用 RLS
alter table newsletter_subscribers enable row level security;

-- 允許任何人訂閱
create policy "任何人都可以訂閱電子報"
  on newsletter_subscribers for insert
  with check (true);

-- 只有認證使用者可以查看訂閱者列表
create policy "認證使用者可以查看訂閱者"
  on newsletter_subscribers for select
  using (auth.role() = 'authenticated');
```

### 3. 講座邀約申請表 (applications)

儲存學校或機構的講座邀約申請。

```sql
-- 建立講座邀約申請表
create table applications (
  id uuid default gen_random_uuid() primary key,
  school_name text not null,
  contact_person text not null,
  contact_email text not null,
  contact_phone text,
  preferred_date date,
  preferred_time text,
  topic text not null,
  expected_audience integer,
  message text,
  status text default 'pending' check (status in ('pending', 'reviewing', 'approved', 'rejected', 'completed')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 建立索引
create index applications_status_idx on applications(status);
create index applications_preferred_date_idx on applications(preferred_date);
create index applications_created_at_idx on applications(created_at desc);

-- 建立 updated_at 自動更新觸發器
create trigger update_applications_updated_at
  before update on applications
  for each row
  execute function update_updated_at_column();

-- 啟用 RLS
alter table applications enable row level security;

-- 允許任何人提交申請
create policy "任何人都可以提交邀約申請"
  on applications for insert
  with check (true);

-- 只有認證使用者可以查看申請
create policy "認證使用者可以查看申請"
  on applications for select
  using (auth.role() = 'authenticated');

-- 只有認證使用者可以更新申請狀態
create policy "認證使用者可以更新申請"
  on applications for update
  using (auth.role() = 'authenticated');
```

### 4. 用戶資料表 (profiles)

儲存所有用戶（講師、管理員）的個人資料與審核狀態。

```sql
-- 建立用戶資料表
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  display_name text,
  avatar_url text,
  phone text,
  title text,
  bio text,
  bio_long text,
  expertise text[],
  role text default 'instructor' check (role in ('admin', 'instructor')),
  is_approved boolean default false,
  is_public boolean default false,
  approved_at timestamp with time zone,
  approved_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 建立索引
create index profiles_role_idx on profiles(role);
create index profiles_is_approved_idx on profiles(is_approved);
create index profiles_is_public_idx on profiles(is_public);

-- 建立 updated_at 自動更新觸發器
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

-- 啟用 RLS
alter table profiles enable row level security;

-- 允許用戶查看自己的資料
create policy "用戶可以查看自己的資料"
  on profiles for select
  using (auth.uid() = id);

-- 允許用戶更新自己的資料
create policy "用戶可以更新自己的資料"
  on profiles for update
  using (auth.uid() = id);

-- 允許任何認證用戶插入自己的資料
create policy "認證用戶可以插入自己的資料"
  on profiles for insert
  with check (auth.uid() = id);

-- 允許所有人查看公開的講師資料
create policy "公開講師資料可被查看"
  on profiles for select
  using (is_public = true);

-- 允許管理員查看所有資料
create policy "管理員可以查看所有資料"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 允許管理員更新所有資料
create policy "管理員可以更新所有資料"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 建立自動創建 profile 的觸發器（當用戶註冊時）
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, display_name, role, is_approved)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'full_name',
    'instructor',
    false
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 5. 講師資料表 (instructors) - 舊版，可選

儲存講師的個人資料與專長。

```sql
-- 建立講師資料表
create table instructors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  phone text,
  title text,
  organization text,
  bio text,
  expertise text[],
  avatar_url text,
  website text,
  social_links jsonb,
  is_active boolean default true,
  total_lectures integer default 0,
  rating decimal(3,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 建立索引
create index instructors_user_id_idx on instructors(user_id);
create index instructors_email_idx on instructors(email);
create index instructors_is_active_idx on instructors(is_active);

-- 建立 updated_at 自動更新觸發器
create trigger update_instructors_updated_at
  before update on instructors
  for each row
  execute function update_updated_at_column();

-- 啟用 RLS
alter table instructors enable row level security;

-- 允許所有人查看活躍的講師
create policy "公開活躍的講師資料"
  on instructors for select
  using (is_active = true);

-- 講師可以更新自己的資料
create policy "講師可以更新自己的資料"
  on instructors for update
  using (auth.uid() = user_id);
```

### 5. 講座記錄表 (lectures)

儲存已完成的講座記錄。

```sql
-- 建立講座記錄表
create table lectures (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references applications(id) on delete set null,
  instructor_id uuid references instructors(id) on delete set null,
  title text not null,
  school_name text not null,
  lecture_date date not null,
  lecture_time text,
  topic text not null,
  audience_count integer,
  feedback_score decimal(3,2),
  feedback_comments text,
  photos text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 建立索引
create index lectures_instructor_id_idx on lectures(instructor_id);
create index lectures_lecture_date_idx on lectures(lecture_date desc);
create index lectures_school_name_idx on lectures(school_name);

-- 啟用 RLS
alter table lectures enable row level security;

-- 允許所有人查看講座記錄
create policy "公開講座記錄"
  on lectures for select
  using (true);

-- 只有認證使用者可以新增講座記錄
create policy "認證使用者可以新增講座記錄"
  on lectures for insert
  with check (auth.role() = 'authenticated');
```

### 6. 客戶回饋表 (testimonials)

儲存客戶回饋與見證，用於首頁展示。

```sql
-- 建立客戶回饋表
create table testimonials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  school_title text,
  content text not null,
  is_approved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 建立索引
create index testimonials_is_approved_idx on testimonials(is_approved);
create index testimonials_created_at_idx on testimonials(created_at desc);

-- 啟用 RLS
alter table testimonials enable row level security;

-- 允許任何人提交回饋
create policy "任何人都可以提交回饋"
  on testimonials for insert
  with check (true);

-- 允許所有人查看已審核的回饋
create policy "公開已審核的回饋"
  on testimonials for select
  using (is_approved = true);

-- 允許認證使用者查看所有回饋
create policy "認證使用者可以查看所有回饋"
  on testimonials for select
  using (auth.role() = 'authenticated');

-- 允許認證使用者更新回饋狀態
create policy "認證使用者可以更新回饋"
  on testimonials for update
  using (auth.role() = 'authenticated');

-- 允許認證使用者刪除回饋
create policy "認證使用者可以刪除回饋"
  on testimonials for delete
  using (auth.role() = 'authenticated');
```

## 📊 插入測試資料

執行完上述 SQL 後，您可以插入一些測試資料：

```sql
-- 插入測試文章
insert into posts (title, excerpt, content, author, category) values
('如何在校園中推動創新教育', '探討在現代教育環境中，如何透過創新的教學方法激發學生的學習興趣...', '完整文章內容...', '張教授', '教育創新'),
('科技與人文的對話：AI時代的教育反思', '在人工智慧快速發展的時代，我們應該如何重新思考教育的本質...', '完整文章內容...', '李博士', '科技教育'),
('建立校園永續發展文化的實踐經驗', '分享如何在校園中建立永續發展的文化，從課程設計到校園活動...', '完整文章內容...', '王老師', '永續發展');

-- 插入測試電子報訂閱
insert into newsletter_subscribers (email) values
('test1@example.com'),
('test2@example.com');

-- 插入測試邀約申請
insert into applications (school_name, contact_person, contact_email, topic) values
('台北市某國中', '張老師', 'zhang@school.edu.tw', 'AI與未來教育'),
('新北市某高中', '李主任', 'li@school.edu.tw', '永續發展與環境保護');
```

## 🔐 設定環境變數

完成資料表建立後，請執行以下步驟：

1. 在 Supabase 專案頁面，前往 **Settings** > **API**
2. 複製以下資訊：
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

3. 在專案根目錄建立 `.env.local` 檔案（或複製 `env.example`）：

```bash
cp env.example .env.local
```

4. 填入您的 Supabase 憑證：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## ✅ 驗證設置

1. 重新啟動開發伺服器：
```bash
npm run dev
```

2. 前往專欄頁面 (http://localhost:3000/blog) 查看是否能正確顯示文章

3. 如果一切正常，您應該可以看到從 Supabase 抓取的文章資料

## 📝 注意事項

- **Row Level Security (RLS)**: 已啟用 RLS 以保護資料安全
- **索引**: 已建立必要的索引以優化查詢效能
- **觸發器**: 已設置 `updated_at` 自動更新觸發器
- **外鍵約束**: 已設置適當的外鍵關聯

## 🆘 常見問題

### Q: 執行 SQL 時出現權限錯誤？
A: 確保您在 Supabase SQL Editor 中執行，而不是在本地資料庫。

### Q: 網站顯示假資料而非資料庫資料？
A: 檢查 `.env.local` 是否正確設置，並重新啟動開發伺服器。

### Q: 如何查看資料表是否建立成功？
A: 在 Supabase 專案中，前往 **Table Editor** 查看所有資料表。

## 🚀 下一步

資料庫設置完成後，您可以：
1. 開始開發其他頁面（邀約申請、講師後台等）
2. 實作使用者認證功能
3. 建立後台管理介面
4. 整合圖片上傳功能

---

如有任何問題，請參考 [Supabase 官方文件](https://supabase.com/docs) 或專案 README.md。
