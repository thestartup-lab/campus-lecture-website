import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  html: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

/** GET /api/email-templates — 取得所有模板 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      // 若表格不存在，回傳空陣列並提示需要建立
      if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
        return NextResponse.json({ success: true, data: [], needsSetup: true })
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data ?? [] })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

/** POST /api/email-templates — 新增模板 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      name: string
      subject: string
      html: string
      sort_order?: number
    }
    const { name, subject, html, sort_order } = body

    if (!name?.trim() || !subject?.trim() || !html?.trim()) {
      return NextResponse.json({ success: false, error: '請填寫所有必填欄位' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .insert({ name, subject, html, sort_order: sort_order ?? 0 })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

/** PATCH /api/email-templates — 更新模板 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as {
      id: string
      name?: string
      subject?: string
      html?: string
      sort_order?: number
      is_active?: boolean
    }
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

/** DELETE /api/email-templates — 軟刪除（設 is_active = false） */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少 id' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('email_templates')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
