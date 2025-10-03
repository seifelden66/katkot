'use client'

import { useEffect } from 'react'

export default function ServiceWorkerManager() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported in this browser')
      return
    }

    const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname)
    if (!isLocalhost && location.protocol !== 'https:') {
      console.warn('Service Worker requires HTTPS in production domains')
      return
    }

    const swUrl = '/sw.js'

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(swUrl, {
          scope: '/',
          updateViaCache: 'none',
        })

        console.log('SW registered with scope:', registration.scope)

        registration.addEventListener('updatefound', () => {
          console.log('SW update found')
        })

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('SW controller changed (new SW activated)')
        })
      } catch (err) {
        console.error('SW registration failed:', err)
      }
    }

    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register, { once: true })
    }
  }, [])

  return null
}