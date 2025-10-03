import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId, endpoint } = await req.json()
    if (!userId || !endpoint) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .match({ user_id: userId, endpoint })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Unsubscribe error:', err)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }
}