import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  supabaseAnonKey !== 'your-supabase-anon-key';

const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);

export async function handleWaitlistPublicCore(reqQuery: any, reqCookieHeaders?: string) {
  const limit = Math.min(parseInt(reqQuery.limit || '20', 10), 50);
  const cursor = reqQuery.cursor || null;

  if (!isSupabaseConfigured) {
    // Demo fallback data
    const mockItems = [
      { id: '1', firstName: 'Tanvir', isYou: false },
      { id: '2', firstName: 'Rahim', isYou: false },
      { id: '3', firstName: 'A student', isYou: false },
      { id: '4', firstName: 'Nusrat', isYou: false },
      { id: '5', firstName: 'Sakib', isYou: false },
    ];
    return {
      statusCode: 200,
      data: {
        total: 5,
        items: mockItems.slice(0, limit),
        nextCursor: null,
      },
    };
  }

  try {
    let query = supabase
      .from('waitlist')
      .select('id, first_name, email, created_at, show_first_name, email_verified_at', { count: 'exact' })
      .not('email_verified_at', 'is', null)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error, count } = await query;

    if (error) {
      return {
        statusCode: 500,
        data: { success: false, error: error.message },
      };
    }

    const rows = data || [];
    const total = count !== null ? count : rows.length;

    const items = rows.map((row: any) => {
      const rawName = (row.first_name || '').trim();
      const firstWord = rawName.split(/\s+/)[0] || 'Student';
      const capitalized = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
      const showName = row.show_first_name !== false;

      return {
        id: row.id,
        firstName: showName ? capitalized : 'A student',
        isYou: false,
      };
    });

    const nextCursor = rows.length === limit ? rows[rows.length - 1].created_at : null;

    return {
      statusCode: 200,
      data: {
        total,
        items,
        nextCursor,
      },
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      data: { success: false, error: err?.message || 'Server Error' },
    };
  }
}
