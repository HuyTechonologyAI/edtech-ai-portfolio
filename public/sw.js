const CACHE_NAME = "zentratech-pwa-cache-v1";
const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/globe.svg",
  "/profile.jpg"
];

// Cài đặt Service Worker và nạp trước các tài sản hạt nhân
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Kích hoạt Service Worker và dọn dẹp các bộ nhớ đệm cũ
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Chiến lược bộ nhớ đệm: Stale-while-revalidate giúp ứng dụng luôn phản hồi tức thì
self.addEventListener("fetch", (event) => {
  // Chỉ can thiệp các luồng dữ liệu GET tĩnh, bỏ qua các luồng API hoặc Hot-reload
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("/api/") ||
    event.request.url.includes("chrome-extension://") ||
    event.request.url.includes("_next/webpack-hmr")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          // Lưu đệm các luồng phản hồi thành công nhằm củng cố kho ngoại tuyến
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback mượt mà nếu rớt kết nối
          return cachedResponse;
        });

      return cachedResponse || networkFetch;
    })
  );
});
