import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const BATCH_SIZE = 100

/** POST /api/newsletter/broadcast — 群發電子報給所有訂閱者 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: 'RESEND_API_KEY 未設定' }, { status: 500 })
    }

    const body = await request.json()
    const { subject, htmlContent, emails } = body as {
      subject: string
      htmlContent: string
      emails?: string[] // 若有傳入，只寄給指定 email；否則寄給全部訂閱者
    }

    if (!subject?.trim()) {
      return NextResponse.json({ success: false, error: '請填寫主旨' }, { status: 400 })
    }
    if (!htmlContent?.trim()) {
      return NextResponse.json({ success: false, error: '請填寫郵件內容' }, { status: 400 })
    }

    let subscribers: { email: string }[]

    if (emails && emails.length > 0) {
      // 使用前端傳入的指定名單
      subscribers = emails.map((e) => ({ email: e }))
    } else {
      // 撈全部訂閱者
      const { data, error: dbError } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('email')

      if (dbError) {
        return NextResponse.json({ success: false, error: dbError.message }, { status: 500 })
      }
      subscribers = data ?? []
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: false, error: '目前沒有任何訂閱者' }, { status: 400 })
    }

    let sentCount = 0
    let failCount = 0

    // 分批寄送（每批最多 100 封）
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE)

      try {
        const { data, error: sendError } = await resend.batch.send(
          batch.map((s) => ({
            from: '生命應該是這樣的 <send@cjlead.com.tw>',
            to: s.email,
            subject,
            html: htmlContent,
          }))
        )

        if (sendError) {
          console.error('[Newsletter] Batch error:', sendError)
          failCount += batch.length
        } else {
          sentCount += data?.data?.length ?? batch.length
        }
      } catch (batchErr) {
        console.error('[Newsletter] Batch exception:', batchErr)
        failCount += batch.length
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      failCount,
      total: subscribers.length,
    })
  } catch (error) {
    console.error('[Newsletter] Broadcast error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '伺服器錯誤',
    }, { status: 500 })
  }
}
