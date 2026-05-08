import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** يطابق إصدار حزمة `firebase` في package.json لـ importScripts. */
const FIREBASE_JS = "12.12.0";

/**
 * Service worker واحد: تثبيت PWA، FCM في الخلفية، إشعارات النقر.
 *
 * لا نعترض طلبات التصفح (`navigate`) — تبقى network-first افتراض المتصفح.
 * اعتراض محدود: ‎`/api/*`‎ network-first مع كاش؛ أصول ‎`/_next/static`‎ وامتدادات ثابتة cache-first؛ صور خارجية GET ‎`stale-while-revalidate`‎.
 * الاستجابة تُخدم بـ ‎`Cache-Control: no-store`‎ حتى لا يبقى ‎`sw.js`‎ قديماً في المتصفح بعد النشر.
 */
export async function GET() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };

  const icon192 = "/images/icon-192.png";
  const configJson = JSON.stringify(firebaseConfig);

  const body = `/* Sokany PWA service worker — generated */
const FIREBASE_VERSION = "${FIREBASE_JS}";
const CACHE_PREFIX = "sokany-pwa-v4";
const CACHE_MAIN = CACHE_PREFIX;
const CACHE_API = CACHE_PREFIX + "-api";
const CACHE_STATIC = CACHE_PREFIX + "-static";
const CACHE_IMG = CACHE_PREFIX + "-img";
const CACHE_KEYS = [CACHE_MAIN, CACHE_API, CACHE_STATIC, CACHE_IMG];
const OFFLINE_URL = "/offline";
const DEFAULT_ICON = "${icon192}";
const firebaseConfig = ${configJson};

importScripts(
  "https://www.gstatic.com/firebasejs/" + FIREBASE_VERSION + "/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/" + FIREBASE_VERSION + "/firebase-messaging-compat.js"
);

async function networkFirstApi(request, cacheName) {
  try {
    const res = await fetch(request);
    if (res && res.ok) {
      const c = await caches.open(cacheName);
      c.put(request, res.clone());
    }
    return res;
  } catch (e) {
    const hit = await caches.match(request);
    if (hit) return hit;
    throw e;
  }
}

async function cacheFirstStatic(request, cacheName) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res && res.ok) {
    const c = await caches.open(cacheName);
    c.put(request, res.clone());
  }
  return res;
}

async function staleWhileRevalidateImage(request, cacheName) {
  const c = await caches.open(cacheName);
  const hit = await c.match(request);
  const net = fetch(request)
    .then((res) => {
      if (res && res.ok) c.put(request, res.clone());
      return res;
    })
    .catch(() => undefined);
  return hit || (await net) || Response.error();
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_MAIN)
      .then((cache) => cache.addAll([OFFLINE_URL, DEFAULT_ICON]).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("sokany-pwa-") && CACHE_KEYS.indexOf(k) === -1)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.mode === "navigate") return;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    if (req.destination === "image") {
      event.respondWith(staleWhileRevalidateImage(req, CACHE_IMG));
    }
    return;
  }
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstApi(req, CACHE_API));
    return;
  }
  if (
    url.pathname.startsWith("/_next/static/") ||
    /\\.(js|css|woff2?|ico|png|jpg|jpeg|webp|svg|gif)(\\?|$)/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirstStatic(req, CACHE_STATIC));
  }
});

if (firebaseConfig.apiKey && firebaseConfig.messagingSenderId && firebaseConfig.appId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  const broadcastWooCacheInvalidation = (data) =>
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage(Object.assign({ type: "woo-cache-invalidation" }, data || {}));
        });
      });
  messaging.onBackgroundMessage((payload) => {
    if (payload.data && payload.data.type === "woo-cache-invalidation") {
      return broadcastWooCacheInvalidation(payload.data);
    }
    const title =
      (payload.notification && payload.notification.title) ||
      (payload.data && payload.data.title) ||
      "سوكانى";
    const bodyText =
      (payload.notification && payload.notification.body) ||
      (payload.data && payload.data.body) ||
      "";
    const options = {
      body: bodyText,
      icon: (payload.notification && payload.notification.icon) || DEFAULT_ICON,
      badge: DEFAULT_ICON,
      data: payload.data || {},
      tag: (payload.data && payload.data.tag) || "sokany-fcm",
    };
    return self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification.data || {};
  const url = typeof raw.url === "string" && raw.url ? raw.url : "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ("focus" in client && client.url.indexOf(self.location.origin) === 0) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
      "Service-Worker-Allowed": "/",
    },
  });
}
