import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();

  // Get one profile to see what columns exist
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the column names
  const columns = data && data.length > 0 ? Object.keys(data[0]) : [];

  return NextResponse.json({
    columns,
    sample: data?.[0] || null
  });
}
