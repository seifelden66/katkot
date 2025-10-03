'use client'
import { useEffect, useMemo, useState } from 'react'
import { useSession } from '@/contexts/SessionContext'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { 
  useNotifications, 
  useMarkNotificationsAsRead,
  useDeleteNotification,
  useDeleteAllNotifications
} from '@/app/hooks/queries/usePostQueries'

interface Notification {
  id: number
  created_at: string
  type: string
  read: boolean
  post_id?: string
  actor: {
    id: string
    full_name: string
    avatar_url: string
  }
  posts?: {
    content: string
  }
}

export default function NotificationsPage() {
  const { session } = useSession()
  const locale = useLocale()
  const t = useTranslations('notifications')
  
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  
  const { data: notifications = [], isLoading, refetch } = useNotifications(session?.user?.id)
  const markAsRead = useMarkNotificationsAsRead()
  const deleteNotification = useDeleteNotification()
  const deleteAllNotifications = useDeleteAllNotifications()
  
  const unreadIds = useMemo(() => {
    return notifications
      ?.filter(n => !n.read)
      .map(n => n.id) || []
  }, [notifications])
  
  useEffect(() => {
    if (unreadIds.length > 0 && !markAsRead.isPending) {
      markAsRead.mutate(unreadIds)
    }
  }, [unreadIds, markAsRead])

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])
    
  if (!session?.user?.id) {
    return <div className="space-y-4 p-4">sign in please</div>
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = typeof window !== 'undefined' ? window.atob(base64) : ''
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    })
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }

  async function subscribeToPush() {
    if (!session?.user?.id) return
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      alert('Please allow notifications to subscribe')
      return
    }
    const registration = await navigator.serviceWorker.ready
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
    setSubscription(sub)
    const serializedSub = JSON.parse(JSON.stringify(sub))
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.user.id, subscription: serializedSub }),
    })
  }

  async function unsubscribeFromPush() {
    const endpoint = subscription?.endpoint
    await subscription?.unsubscribe()
    setSubscription(null)
    if (session?.user?.id && endpoint) {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, endpoint }),
      })
    }
  }
  
  const handleDeleteNotification = (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (deleteNotification.isPending) return
    deleteNotification.mutate(id, { onSuccess: () => refetch() })
  }
  
  const handleDeleteAllNotifications = () => {
    if (deleteAllNotifications.isPending || notifications.length === 0) return
    deleteAllNotifications.mutate(session.user.id, { onSuccess: () => refetch() })
  }
  
  const getNotificationContent = (notification: Notification) => {
    switch (notification.type) {
      case 'follow':
        return `${notification.actor.full_name} started following you`
      case 'like':
        return `${notification.actor.full_name} liked your post`
      case 'comment':
        return `${notification.actor.full_name} commented on your post`
      case 'new_post':
        return `${notification.actor.full_name} created a new post`
      default:
        return `New notification from ${notification.actor.full_name}`
    }
  }

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'follow':
        return `/${locale}/profile/${notification.actor.id}`
      case 'like':
      case 'comment':
      case 'new_post':
        return notification.post_id ? `/${locale}/posts/${notification.post_id}` : `/${locale}/profile/${notification.actor.id}`
      default:
        return `/${locale}/profile/${notification.actor.id}`
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse flex items-start gap-3 p-4 rounded-lg">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className="space-y-1">
      {isSupported && (
        <div className="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded">
          <span className="text-sm text-gray-700">
            {subscription ? 'Push notifications enabled' : 'Enable push notifications'}
          </span>
          {subscription ? (
            <button
              onClick={unsubscribeFromPush}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Unsubscribe
            </button>
          ) : (
            <button
              onClick={subscribeToPush}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Subscribe
            </button>
          )}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="flex justify-end mb-2">
          <button 
            onClick={handleDeleteAllNotifications}
            disabled={deleteAllNotifications.isPending}
            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
          >
            {deleteAllNotifications.isPending ? 'Deleting...' : t('clearAll')}
          </button>
        </div>
      )}
      
      {notifications.length > 0 ? (
        notifications.map(notification => (
          <div key={notification.id} className="relative">
            <Link 
              href={getNotificationLink(notification)}
              className={`flex items-start gap-3 p-4 rounded-lg transition-colors ${notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'}`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                {notification.actor.avatar_url ? (
                  <Image
                    src={notification.actor.avatar_url}
                    alt={`${notification.actor.full_name}'s avatar`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    {notification.actor.full_name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-gray-800">{getNotificationContent(notification)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
                {notification.type !== 'follow' && notification.posts && (
                  <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded line-clamp-2">
                    {notification.posts.content}
                  </p>
                )}
              </div>
            </Link>
            <button
              onClick={(e) => handleDeleteNotification(notification.id, e)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-500 transition-colors"
              aria-label={t('delete')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">{t('noNotifications')}</h3>
          <p className="text-gray-500">When you get notifications, they will show up here.</p>
        </div>
      )}
    </div>
  )
}