self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Katkot'
  const options = {
    body: data.body || '',
    icon: '/icon512_rounded.png',
    badge: '/icon512_maskable.png',
    data: { url: data.url || '/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

const STATIC_CACHE = 'katkot-static-v1'
const DATA_CACHE = 'katkot-data-v1'
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/icon512_rounded.png',
  '/icon512_maskable.png',
  '/logo1.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, DATA_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const net = await fetch(req)
          const cache = await caches.open(STATIC_CACHE)
          cache.put(req, net.clone()) 
          return net
        } catch {
          const cache = await caches.open(STATIC_CACHE)
          const cached = await cache.match(req) 
          if (cached) return cached
          return new Response(
            '<h1>Offline</h1><p>You are offline and this page is not cached yet.</p>',
            { status: 200, headers: { 'Content-Type': 'text/html' } }
          )
        }
      })()
    )
    return
  }


  if (
    ['style', 'script', 'image', 'font'].includes(req.destination) ||
    url.pathname.startsWith('/_next/static')
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE)
        const cached = await cache.match(req)
        if (cached) return cached
        const net = await fetch(req)
        cache.put(req, net.clone())
        return net
      })()
    )
    return
  }
  const accept = req.headers.get('accept') || ''
  if (
    accept.includes('application/json') ||
    url.hostname.includes('supabase') ||
    url.pathname.includes('/rest/v1')
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(DATA_CACHE)
        const cached = await cache.match(req)

        try {
          const net = await fetch(req)
          if (net.ok) {
            cache.put(req, net.clone())
          }
          return net
        } catch {
          if (cached) {
            return cached
          }
          return new Response(
            JSON.stringify({ error: 'Offline and no cached data' }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }
      })()
    )
    return
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification?.data?.url || '/'

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      const matching = allClients.find((client) => client.url.includes(url))

      if (matching) {
        matching.focus()
      } else {
        clients.openWindow(url)
      }
    })()
  )
})