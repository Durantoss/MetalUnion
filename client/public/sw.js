/**
 * MoshUnion Service Worker - Enhanced Performance & Mobile Optimization
 */
const CACHE_NAME = 'moshunion-v1.3.0';
const API_CACHE_NAME = 'moshunion-api-v1';

// Static assets to cache
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon.svg'
];

// API endpoints to cache for offline functionality
const API_CACHE_PATTERNS = [
  /^\/api\/bands/,
  /^\/api\/tours/,
  /^\/api\/reviews/,
  /^\/api\/photos/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Installing enhanced service worker...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('📦 SW: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      }),
      caches.open(API_CACHE_NAME),
    ]).then(() => {
      console.log('✅ SW: Service worker installed successfully');
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 SW: Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('🗑️ SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ SW: Service worker activated');
      return self.clients.claim();
    })
  );
});

// Enhanced fetch handler with smart caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(handleStaticRequest(request));
});

/**
 * API request handler - Network first, cache fallback
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
  
  if (!shouldCache) {
    return fetch(request);
  }

  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests
    if (request.method === 'GET' && networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('📱 SW: Network failed, checking cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Add offline indicator header
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Served-By', 'ServiceWorker-Cache');
      headers.set('X-Cache-Status', 'offline');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }
    
    throw error;
  }
}

/**
 * Static request handler - Cache first, network fallback
 */
async function handleStaticRequest(request) {
  // Check cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Could return offline fallback page here
    throw error;
  }
}