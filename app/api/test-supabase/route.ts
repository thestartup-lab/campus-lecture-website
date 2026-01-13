import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const testUserId = searchParams.get('userId')
  
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
  }

  // 檢查環境變數
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  results.env = {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlPrefix: supabaseUrl?.substring(0, 30) + '...',
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      ...results,
      error: '缺少 Supabase 環境變數',
    })
  }

  // 建立連線
  const supabase = createClient(supabaseUrl, supabaseKey)

  // 測試 profiles 表
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .limit(1)

    if (error) {
      results.profiles = {
        success: false,
        error: error.message,
        code: error.code,
        hint: error.hint,
      }
    } else {
      results.profiles = {
        success: true,
        count: data?.length || 0,
        sample: data?.[0] ? Object.keys(data[0]) : [],
      }
    }
  } catch (e) {
    results.profiles = {
      success: false,
      error: (e as Error).message,
    }
  }

  // 檢查 profiles 表的所有欄位
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (error) {
      results.profileColumns = {
        success: false,
        error: error.message,
      }
    } else if (data && data.length > 0) {
      results.profileColumns = {
        success: true,
        columns: Object.keys(data[0]),
      }
    } else {
      results.profileColumns = {
        success: true,
        columns: '表格為空，無法取得欄位',
      }
    }
  } catch (e) {
    results.profileColumns = {
      success: false,
      error: (e as Error).message,
    }
  }

  // 測試 storage bucket
  try {
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) {
      results.storage = {
        success: false,
        error: error.message,
      }
    } else {
      results.storage = {
        success: true,
        buckets: data?.map(b => b.name) || [],
      }
    }
  } catch (e) {
    results.storage = {
      success: false,
      error: (e as Error).message,
    }
  }

  // 如果提供了 userId，測試 upsert 操作
  if (testUserId) {
    try {
      const testData = {
        id: testUserId,
        display_name: 'Test Name ' + Date.now(),
        is_public: false,
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert(testData, { onConflict: 'id' })
        .select()

      if (error) {
        results.upsertTest = {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        }
      } else {
        results.upsertTest = {
          success: true,
          data: data,
        }
      }
    } catch (e) {
      results.upsertTest = {
        success: false,
        error: (e as Error).message,
        name: (e as Error).name,
      }
    }
  }

  return NextResponse.json(results)
}
