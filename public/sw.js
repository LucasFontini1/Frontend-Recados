/* Service Worker do Recados: cache de arquivos públicos, nunca dados de usuários. */
const CACHE_NAME = 'recados-static-v2'
const APP_SHELL = ['/offline.html', '/pwa/icon-192.png', '/pwa/icon-512.png', '/pwa/maskable-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith('recados-static-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      ),
      self.clients.claim(),
    ])
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Nunca armazenar autenticação, dados dinâmicos ou solicitações administrativas.
  if (url.pathname.startsWith('/api/') ||
      url.pathname.includes('/token/') ||
      url.pathname.startsWith('/admin')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        return (await caches.match('/offline.html')) || Response.error()
      })
    )
    return
  }

  // Arquivos do Vite têm hashes no nome. Podem ser cacheados até uma atualização.
  const isStaticAsset = url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/pwa/')
  if (!isStaticAsset) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (!response.ok || response.type !== 'basic') return response
        const copy = response.clone()
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        )
        return response
      })
    })
  )
})
