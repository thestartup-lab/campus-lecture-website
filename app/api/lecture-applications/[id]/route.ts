import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 取得單一講座申請
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '缺少講座申請 ID' },
        { status: 400 }
      );
    }

    const { data: application, error } = await supabase
      .from('lecture_applications')
      .select(`
        id,
        school_name,
        contact_name,
        contact_email,
        contact_phone,
        lecture_topics,
        audience_type,
        audience_count,
        preferred_dates,
        lecture_format,
        status,
        price,
        payment_status,
        created_at
      `)
      .eq('id', id)
      .single();

    if (error || !application) {
      return NextResponse.json(
        { error: '找不到講座申請' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('查詢講座申請失敗:', error);
    return NextResponse.json(
      { error: '系統錯誤' },
      { status: 500 }
    );
  }
}
