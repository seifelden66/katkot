import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.split(' ')[1]
  
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 403 }
    )
  }

  const body = await request.json()
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content: body.content,
      media_url: body.media_url || null,
      affiliate_link: body.affiliate_link || null,
      user_id: user.id,
      category_id: body.category_id, // Will use DB default if null
      store_id: body.store_id, // Add store_id field
      description: body.description // Add description field
    })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json(data)
}