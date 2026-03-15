import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const DEFAULT_TEMPLATES = [
  {
    name: '合作邀請函',
    subject: '邀請貴校參與講座合作',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
  <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 32px 40px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px;">生命應該是這樣的</h1>
    <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0;">讓教育更有溫度</p>
  </div>
  <div style="background: #ffffff; padding: 32px 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px;">親愛的承辦人您好，</h2>
    <p style="line-height: 1.8; color: #374151;">感謝您撥冗閱覽此信。</p>
    <p style="line-height: 1.8; color: #374151;">我們是<strong>生命應該是這樣的</strong>教育團隊，長期致力於提供高品質的校園講座與職涯探索課程，協助大專院校學生建立正確的生涯規劃觀念與人生目標。</p>
    <p style="line-height: 1.8; color: #374151;">誠摯邀請貴校與我們洽談合作，為同學帶來一場難忘的學習體驗。</p>
    <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #374151; font-size: 14px;">如有任何疑問，歡迎隨時回覆此信與我們聯繫。</p>
    </div>
    <p style="margin-top: 32px; color: #374151;">敬祝 教安</p>
    <p style="color: #374151;"><strong>生命應該是這樣的 教育團隊</strong></p>
  </div>
</div>`,
    sort_order: 1,
  },
  {
    name: '講座課程介紹',
    subject: '關於我們的校園講座課程介紹',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
  <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 32px 40px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px;">生命應該是這樣的</h1>
    <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0;">校園講座 × 職涯探索</p>
  </div>
  <div style="background: #ffffff; padding: 32px 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px;">親愛的承辦人您好，</h2>
    <p style="line-height: 1.8; color: #374151;">您好！我們是<strong>生命應該是這樣的</strong>教育團隊，以下是我們目前提供的講座主題：</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="background: #2563eb; color: white;">
        <th style="padding: 12px 16px; text-align: left; font-size: 14px;">講座主題</th>
        <th style="padding: 12px 16px; text-align: center; font-size: 14px;">時數</th>
      </tr>
      <tr style="background: #f8fafc;">
        <td style="padding: 12px 16px; font-size: 14px;">🎯 職涯探索與自我定位</td>
        <td style="padding: 12px 16px; text-align: center; font-size: 14px;">2hr</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; font-size: 14px;">💼 社會新鮮人必備軟實力</td>
        <td style="padding: 12px 16px; text-align: center; font-size: 14px;">2hr</td>
      </tr>
      <tr style="background: #f8fafc;">
        <td style="padding: 12px 16px; font-size: 14px;">🚀 創業精神與斜槓人生</td>
        <td style="padding: 12px 16px; text-align: center; font-size: 14px;">2hr</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; font-size: 14px;">❤️ 人際關係與溝通技巧</td>
        <td style="padding: 12px 16px; text-align: center; font-size: 14px;">2hr</td>
      </tr>
    </table>
    <p style="line-height: 1.8; color: #374151;">每場講座可依貴校需求客製化規劃，歡迎進一步洽談合作細節。</p>
    <p style="margin-top: 32px; color: #374151;">敬祝 教安</p>
    <p style="color: #374151;"><strong>生命應該是這樣的 教育團隊</strong></p>
  </div>
</div>`,
    sort_order: 2,
  },
  {
    name: '後續追蹤信',
    subject: '感謝您對講座合作的關注',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
  <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 32px 40px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px;">生命應該是這樣的</h1>
    <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0;">讓教育更有溫度</p>
  </div>
  <div style="background: #ffffff; padding: 32px 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 16px;">親愛的承辦人您好，</h2>
    <p style="line-height: 1.8; color: #374151;">非常感謝您日前對我們講座合作事宜的關注與回覆。</p>
    <p style="line-height: 1.8; color: #374151;">想再次確認雙方討論的合作細節，並了解目前的進度與需求。如有任何需要補充的資料，我們非常樂意提供。</p>
    <p style="line-height: 1.8; color: #374151;">期待與貴校建立長期的合作關係，共同為學生帶來更多有價值的學習資源。</p>
    <p style="margin-top: 32px; color: #374151;">敬祝 教安</p>
    <p style="color: #374151;"><strong>生命應該是這樣的 教育團隊</strong></p>
  </div>
</div>`,
    sort_order: 3,
  },
]

/** POST /api/setup-email-templates — 建立 email_templates 資料表並塞入預設模板（只需執行一次） */
export async function POST() {
  try {
    // 先確認資料表是否已存在（嘗試 SELECT）
    const { error: checkError } = await supabaseAdmin
      .from('email_templates')
      .select('id')
      .limit(1)

    if (checkError && (checkError.message.includes('does not exist') || checkError.message.includes('schema cache'))) {
      return NextResponse.json({
        success: false,
        error: '資料表尚未建立，請先至 Supabase Dashboard > SQL Editor 執行以下 SQL：\n\nCREATE TABLE email_templates (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  name text NOT NULL,\n  subject text NOT NULL,\n  html text NOT NULL,\n  is_active boolean NOT NULL DEFAULT true,\n  sort_order integer NOT NULL DEFAULT 0,\n  created_at timestamptz NOT NULL DEFAULT now(),\n  updated_at timestamptz NOT NULL DEFAULT now()\n);',
        sql: `CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  html text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);`,
      }, { status: 422 })
    }

    // 資料表存在，塞入預設模板（若尚無資料）
    const { data: existing } = await supabaseAdmin
      .from('email_templates')
      .select('id')
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true, message: '模板已存在，無需重複建立' })
    }

    const { error: insertError } = await supabaseAdmin
      .from('email_templates')
      .insert(DEFAULT_TEMPLATES)

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `已成功建立 ${DEFAULT_TEMPLATES.length} 個預設模板` })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
