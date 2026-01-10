import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '缺少 email 參數' },
        { status: 400 }
      )
    }

    // 檢查 API Key 是否存在
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY 未設定')
      return NextResponse.json(
        { error: 'Email 服務未設定' },
        { status: 500 }
      )
    }

    // 動態初始化 Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    // 發送歡迎信
    const { data, error } = await resend.emails.send({
      from: '校園講座計劃 <onboarding@resend.dev>', // 使用 Resend 預設寄件者，正式上線請改成您的網域
      to: email,
      subject: '🎉 歡迎訂閱校園講座計劃電子報！',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 10px; font-weight: bold;">
                        📚 校園講座計劃
                      </h1>
                      <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;">
                        讓教育更有溫度
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px; font-weight: bold;">
                        🎉 歡迎加入我們！
                      </h2>
                      
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        親愛的訂閱者，您好！
                      </p>
                      
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        感謝您訂閱<strong>校園講座計劃</strong>的電子報！我們非常高興能與您分享教育的精彩世界。
                      </p>
                      
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        作為訂閱者，您將會收到：
                      </p>
                      
                      <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0 0 25px; padding-left: 20px;">
                        <li>📅 最新講座活動資訊</li>
                        <li>📝 精選專欄文章與教育觀點</li>
                        <li>🎓 講師專訪與教學心得</li>
                        <li>💡 教育創新趨勢分享</li>
                      </ul>
                      
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                        我們相信，每一場講座都能點燃學習的熱情，開啟未來的可能。期待與您一起為教育注入更多溫度！
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="https://your-website.com" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                              探索更多內容 →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px; text-align: center;">
                        此郵件由<strong>校園講座計劃</strong>自動發送
                      </p>
                      <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                        如果您不想再收到這類郵件，請回覆此郵件告知我們。
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- Copyright -->
                <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0; text-align: center;">
                  © ${new Date().getFullYear()} 校園講座計劃. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend 發送錯誤:', error)
      return NextResponse.json(
        { error: '發送郵件失敗', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: '歡迎信已發送',
      id: data?.id 
    })
  } catch (error) {
    console.error('發送歡迎信錯誤:', error)
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
