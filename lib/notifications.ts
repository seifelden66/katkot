import { supabase } from './supabaseClient'

export type NotificationType = 'follow' | 'like' | 'comment' | 'mention'

export async function createNotification({
  userId,
  actorId,
  type,
  postId = null
}: {
  userId: string
  actorId: string
  type: NotificationType
  postId?: string | null
}) {
  if (userId === actorId) return null

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        actor_id: actorId,
        type,
        post_id: postId,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Fetch actor name to build a descriptive push message
    const { data: actorProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', actorId)
      .single()

    const actorName = actorProfile?.full_name || 'Someone'
    const body =
      type === 'follow' ? `${actorName} started following you` :
      type === 'like' ? `${actorName} liked your post` :
      type === 'comment' ? `${actorName} commented on your post` :
      `${actorName} mentioned you`

    // Fire web push to the user
    await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title: 'Katkot',
        body,
        url: '/', // you can deep-link to a post/profile later
      }),
    })

    return data
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}