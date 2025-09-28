const CACHE_NAME = "capyuniverse-v1.0.0"
const STATIC_CACHE = "capyuniverse-static-v1.0.0"
const DYNAMIC_CACHE = "capyuniverse-dynamic-v1.0.0"

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  // Add other static assets as needed
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...")

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("[SW] Static assets cached successfully")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("[SW] Error caching static assets:", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Service worker activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip external API calls (Gemini API)
  if (url.hostname === "generativelanguage.googleapis.com") {
    return
  }

  // Handle navigation requests (app shell)
  if (request.mode === "navigate") {
    event.respondWith(
      caches
        .match("/")
        .then((response) => {
          return response || fetch(request)
        })
        .catch(() => {
          return caches.match("/")
        }),
    )
    return
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        console.log("[SW] Serving from cache:", request.url)
        return response
      }

      // Clone the request for caching
      const fetchRequest = request.clone()

      return fetch(fetchRequest)
        .then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response for caching
          const responseToCache = response.clone()

          caches.open(DYNAMIC_CACHE).then((cache) => {
            console.log("[SW] Caching new resource:", request.url)
            cache.put(request, responseToCache)
          })

          return response
        })
        .catch((error) => {
          console.error("[SW] Fetch failed:", error)

          // Return offline fallback for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/")
          }

          throw error
        })
    }),
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag)

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle background sync tasks
      handleBackgroundSync(),
    )
  }
})

// Push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received")

  const options = {
    body: event.data ? event.data.text() : "Nova notificação do CapyUniverse",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Explorar",
        icon: "/icon-192x192.png",
      },
      {
        action: "close",
        title: "Fechar",
        icon: "/icon-192x192.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("CapyUniverse", options))
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action)

  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/?page=explore"))
  } else if (event.action === "close") {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/"))
  }
})

// Helper function for background sync
async function handleBackgroundSync() {
  try {
    // Handle any pending offline actions
    console.log("[SW] Handling background sync tasks")

    // Example: sync offline data, retry failed API calls, etc.
    // This would be implemented based on specific app needs

    return Promise.resolve()
  } catch (error) {
    console.error("[SW] Background sync failed:", error)
    throw error
  }
}

// Message handler for communication with main thread
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data)

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})
