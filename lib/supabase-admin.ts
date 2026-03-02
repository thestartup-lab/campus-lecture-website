import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 延遲初始化：建置時不執行 createClient，避免缺少環境變數導致 build 失敗
let _adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
    _adminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return _adminClient
}

// 使用 Proxy 保持與既有程式碼相容（supabaseAdmin.from(...) 等用法不變）
// 僅在伺服器端使用！
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop: string) {
    return (getAdminClient() as unknown as Record<string, unknown>)[prop]
  },
})
