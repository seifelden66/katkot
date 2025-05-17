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
    return data
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}