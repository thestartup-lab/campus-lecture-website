# 📡 各平台 API 參考

## Facebook Graph API

### 發佈文字貼文

```bash
curl -X POST "https://graph.facebook.com/v18.0/{page-id}/feed" \
  -d "message=你的文章內容" \
  -d "access_token={page-access-token}"
```

### 發佈含圖片的貼文

```bash
# 步驟 1: 上傳圖片
curl -X POST "https://graph.facebook.com/v18.0/{page-id}/photos" \
  -F "url=https://example.com/image.jpg" \
  -F "published=false" \
  -F "access_token={page-access-token}"

# 步驟 2: 發佈貼文
curl -X POST "https://graph.facebook.com/v18.0/{page-id}/feed" \
  -d "message=你的文章內容" \
  -d "attached_media[0]={'media_fbid':'{photo-id}'}" \
  -d "access_token={page-access-token}"
```

### 回應範例

```json
{
  "id": "123456789_987654321"
}
```

### 取得貼文連結

格式：`https://www.facebook.com/{post-id}`

### 所需權限

- `pages_manage_posts` - 發佈內容
- `pages_read_engagement` - 讀取互動數據
- `pages_show_list` - 列出管理的粉專

### 官方文件

https://developers.facebook.com/docs/graph-api/reference/page/feed/

---

## Threads API (Instagram Graph API)

### 發佈純文字

```bash
# 步驟 1: 建立容器
curl -X POST "https://graph.threads.net/v1.0/{user-id}/threads" \
  -d "media_type=TEXT" \
  -d "text=你的文章內容" \
  -d "access_token={access-token}"

# 回應
{
  "id": "{creation-id}"
}

# 步驟 2: 發佈容器
curl -X POST "https://graph.threads.net/v1.0/{user-id}/threads_publish" \
  -d "creation_id={creation-id}" \
  -d "access_token={access-token}"

# 回應
{
  "id": "{threads-post-id}"
}
```

### 發佈含圖片

```bash
# 步驟 1: 建立圖片容器
curl -X POST "https://graph.threads.net/v1.0/{user-id}/threads" \
  -d "media_type=IMAGE" \
  -d "image_url=https://example.com/image.jpg" \
  -d "text=你的文章內容" \
  -d "access_token={access-token}"

# 步驟 2: 發佈（同上）
```

### 取得貼文連結

格式：`https://www.threads.net/@{username}/post/{post-id}`

### 限制

- 文字限制：500 字元
- 一次只能發佈一張圖片
- 需要 Instagram 商業帳號

### 官方文件

https://developers.facebook.com/docs/threads

---

## LINE Messaging API

### 發送訊息到社群

```bash
curl -X POST "https://api.line.me/v2/bot/message/push" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {channel-access-token}" \
  -d '{
    "to": "{group-id}",
    "messages": [
      {
        "type": "text",
        "text": "你的文章內容"
      }
    ]
  }'
```

### 發送含圖片的訊息

```bash
curl -X POST "https://api.line.me/v2/bot/message/push" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {channel-access-token}" \
  -d '{
    "to": "{group-id}",
    "messages": [
      {
        "type": "image",
        "originalContentUrl": "https://example.com/image.jpg",
        "previewImageUrl": "https://example.com/preview.jpg"
      },
      {
        "type": "text",
        "text": "你的文章內容"
      }
    ]
  }'
```

### 發送 Flex Message（卡片式訊息）

```bash
curl -X POST "https://api.line.me/v2/bot/message/push" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {channel-access-token}" \
  -d '{
    "to": "{group-id}",
    "messages": [
      {
        "type": "flex",
        "altText": "文章通知",
        "contents": {
          "type": "bubble",
          "hero": {
            "type": "image",
            "url": "https://example.com/image.jpg",
            "size": "full",
            "aspectRatio": "20:13",
            "aspectMode": "cover"
          },
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "文章標題",
                "weight": "bold",
                "size": "xl"
              },
              {
                "type": "text",
                "text": "文章摘要...",
                "wrap": true,
                "color": "#666666",
                "size": "sm"
              }
            ]
          },
          "footer": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "button",
                "action": {
                  "type": "uri",
                  "label": "閱讀全文",
                  "uri": "https://example.com/article"
                },
                "style": "primary"
              }
            ]
          }
        }
      }
    ]
  }'
```

### 回應範例

```json
{}
```

成功時回傳空物件。

### Group ID 格式

- 群組：`C` 開頭（例如：`Cxxxxxxxxxxxxx`）
- 聊天室：`R` 開頭（例如：`Rxxxxxxxxxxxxx`）

### 限制

- 每月免費 500 則訊息（依方案不同）
- 圖片大小限制：10 MB
- 文字限制：5,000 字元

### 官方文件

https://developers.line.biz/en/docs/messaging-api/

---

## Skool（無官方 API）

### 替代方案 1：瀏覽器自動化

使用 Puppeteer/Playwright：

```javascript
const puppeteer = require('puppeteer');

async function postToSkool(title, content) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // 登入
  await page.goto('https://www.skool.com/login');
  await page.type('#email', 'your-email@example.com');
  await page.type('#password', 'your-password');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  
  // 前往社群
  await page.goto('https://www.skool.com/your-community');
  
  // 建立貼文
  await page.click('[data-testid="create-post-button"]');
  await page.type('[data-testid="post-title"]', title);
  await page.type('[data-testid="post-content"]', content);
  await page.click('[data-testid="publish-button"]');
  
  // 取得貼文 URL
  await page.waitForNavigation();
  const postUrl = page.url();
  
  await browser.close();
  return postUrl;
}
```

### 替代方案 2：Email to Post

某些社群平台支援透過 Email 發佈：

1. 檢查 Skool 是否提供 Email 發佈功能
2. 使用 n8n 的 Email 節點發送

### 替代方案 3：Zapier 整合

如果 Zapier 有 Skool 整合：

1. 建立 Zapier Zap
2. 從 n8n 使用 Webhook 觸發 Zapier
3. Zapier 發佈到 Skool

### 替代方案 4：手動複製貼上

最簡單但不自動：

1. n8n 發佈到其他平台
2. 手動複製內容到 Skool
3. 手動更新貼文連結到 Notion

---

## 🔐 Token 管理

### Facebook Token 延長

**短期 Token → 長期 Token**

```bash
curl "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}"
```

回應：
```json
{
  "access_token": "長期Token",
  "token_type": "bearer",
  "expires_in": 5184000
}
```

長期 Token 有效期約 60 天。

### LINE Token

LINE Channel Access Token 不會過期（除非手動撤銷）。

### Threads Token

與 Facebook 相同，使用 Instagram Access Token。

---

## 📊 API 限制比較

| 平台 | 速率限制 | 文字限制 | 圖片大小限制 |
|------|---------|---------|-------------|
| **Facebook** | 200 次/小時/用戶 | 63,206 字元 | 4 MB |
| **Threads** | 未公開（推測與 IG 相同） | 500 字元 | 8 MB |
| **LINE** | 60,000 次/分鐘 | 5,000 字元 | 10 MB |
| **Skool** | N/A（無官方 API） | 未知 | 未知 |

---

## 🧪 測試工具

### Facebook Graph API Explorer

https://developers.facebook.com/tools/explorer/

- 可直接測試 API 呼叫
- 取得 Access Token
- 查看權限

### LINE API Console

https://developers.line.biz/console/

- 測試發送訊息
- 查看使用量
- 管理 Channel

### Postman Collection

可以建立 Postman Collection 來測試各平台 API。

---

## 💡 最佳實踐

### 1. Token 安全

- ❌ 不要將 Token 寫死在程式碼中
- ✅ 使用環境變數
- ✅ 定期更換 Token
- ✅ 限制 Token 權限

### 2. 錯誤處理

```javascript
try {
  // API 呼叫
} catch (error) {
  if (error.response.status === 429) {
    // 速率限制，等待後重試
    await sleep(60000);
    retry();
  } else if (error.response.status === 401) {
    // Token 過期，通知管理員
    sendAlert('Token 已過期，請更新');
  }
}
```

### 3. 內容格式化

不同平台有不同的格式偏好：

- **Facebook**: 支援 Emoji、換行、連結
- **Threads**: 簡短有力，適合配圖
- **LINE**: 可使用 Flex Message 做出精美卡片

### 4. 監控與日誌

記錄每次發佈：

- 時間戳記
- 平台
- 是否成功
- 錯誤訊息（如果有）
- 貼文連結

---

## 📚 延伸閱讀

- [Facebook Marketing API](https://developers.facebook.com/docs/marketing-apis)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [LINE Flex Message Simulator](https://developers.line.biz/flex-simulator/)
- [n8n HTTP Request Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)

---

最後更新：2026-01-19
