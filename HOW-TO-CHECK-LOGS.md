# 📊 如何查看 Vercel 日誌

## 方法 1：使用 Vercel CLI（推薦）

### 查看即時日誌

```bash
cd /Users/lipeter/Documents/website
vercel logs website-4tphs79ih-cjleads-projects.vercel.app
```

### 查看最近的日誌（過濾關鍵字）

```bash
vercel logs website-4tphs79ih-cjleads-projects.vercel.app | grep -i "content\|notion\|debug"
```

---

## 方法 2：Vercel Dashboard

1. 前往：https://vercel.com/dashboard
2. 點擊專案：`campus-lecture-website`
3. 點擊「Deployments」
4. 點擊最新的部署（website-4tphs79ih）
5. 點擊「Functions」標籤
6. 選擇 `/api/posts`
7. 點擊「View Function Logs」

---

## 🔍 我們要找的日誌

### ✅ 成功的日誌應該顯示：

```
收到的文章資料: { title: '...', hasContent: true, contentLength: 123 }
頁面建立後檢查: { pageId: '...', hasContent: true, contentLength: 123 }
開始寫入文章內容到 Notion 頁面...
轉換後的 blocks 數量: 5
成功寫入 5 個內容區塊
```

### ❌ 如果失敗，可能看到：

```
收到的文章資料: { title: '...', hasContent: false, contentLength: 0 }
未寫入內容，原因: { noPageId: false, noContent: true, emptyContent: false }
```

或

```
寫入文章內容失敗: [錯誤訊息]
```

---

## 🎯 診斷步驟

1. **檢查是否有收到內容**
   - 看 `hasContent: true/false`
   - 看 `contentLength: X`

2. **檢查是否開始寫入**
   - 看是否有「開始寫入文章內容到 Notion 頁面...」

3. **檢查是否成功寫入**
   - 看是否有「成功寫入 X 個內容區塊」
   - 或「寫入文章內容失敗」

---

## 📋 完整測試流程

1. ✅ 創建新文章（包含內容）
2. ✅ 儲存/發布
3. ✅ 查看 Vercel 日誌
4. ✅ 檢查 Notion 頁面
5. ✅ 回報結果

---

**現在請執行測試並告訴我日誌顯示什麼！** 🚀
