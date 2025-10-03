import { supabase } from '@/lib/supabaseClient'
import webPush from 'web-push'
import { NextResponse } from 'next/server'

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function POST(req: Request) {
  try {
    const { userId, title, body, url } = await req.json()
    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    if (!publicKey || !privateKey) {
      return NextResponse.json({ error: 'Missing VAPID keys' }, { status: 500 })
    }

    webPush.setVapidDetails('mailto:admin@katkot.com', publicKey, privateKey)

    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', userId)

    if (error) throw error

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
    })

    const results = await Promise.allSettled(
      (subs || []).map((s) => {
        const subscription: PushSubscription = {
          endpoint: s.endpoint,
          keys: { p256dh: s.p256dh, auth: s.auth },
        }
        return webPush.sendNotification(subscription, payload)
      })
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({ ok: true, sent, failed })
  } catch (err) {
    console.error('Push send error:', err)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}