import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/** GET /api/newsletter/history — 取得電子報寄送歷史 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('newsletter_history')
      .select('id, subject, recipient_count, sent_count, fail_count, sent_at')
      .order('sent_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, history: data })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '伺服器錯誤',
    }, { status: 500 })
  }
}
