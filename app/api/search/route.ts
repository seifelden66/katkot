import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')
  
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ 
      users: [], 
      posts: [] 
    })
  }

  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, username')
    .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
    .limit(5)

  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select(`
      id, 
      content, 
      created_at,
      user_id,
      author:profiles!user_id(id, full_name, avatar_url)
    `)
    .ilike('content', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(10)

  if (usersError || postsError) {
    console.error('Users search error:', usersError);
    console.error('Posts search error:', postsError);
    return NextResponse.json(
      { error: 'Failed to perform search', details: usersError?.message || postsError?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    users: users || [],
    posts: posts || []
  })
}