self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'app-notification',
      vibrate: [100, 50, 100],
      requireInteraction: data.persistent || false,
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url || '/',
      },
      actions: [
        {
          action: 'open',
          title: 'Open App',
        },
        {
          action: 'close',
          title: 'Dismiss',
        },
      ]
    }
    event.waitUntil(
        self.registration.showNotification(data.title || 'Notification', options)
    )
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const baseUrl = 'https://giadinhminh.mchisxyz.id.vn'
  const urlToOpen = event.notification.data.url
      ? baseUrl + event.notification.data.url
      : baseUrl + '/'

  event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      }).then(function (windowClients) {
        // Check if app is already open
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i]
          if (client.url.includes('giadinhminh.mchisxyz.id.vn') && 'focus' in client) {
            return client.focus()
          }
        }
        // If not open, open the app
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

self.addEventListener('notificationclose', function (event) {
  console.log('Notification dismissed:', event)
})