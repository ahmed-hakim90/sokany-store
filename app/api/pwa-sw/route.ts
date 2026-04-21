import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** يطابق إصدار حزمة `firebase` في package.json لـ importScripts. */
const FIREBASE_JS = "12.12.0";

/**
 * Service worker واحد: تثبيت PWA، تخزين صفحة offline، FCM في الخلفية، إشعارات النقر.
 * يُولَّد ليحقن إعداد Firebase العام (المفاتيح علنية أصلاً في العميل).
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
const CACHE_NAME = "sokany-pwa-v2";
const OFFLINE_URL = "/offline";
const DEFAULT_ICON = "${icon192}";
const firebaseConfig = ${configJson};

importScripts(
  "https://www.gstatic.com/firebasejs/" + FIREBASE_VERSION + "/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/" + FIREBASE_VERSION + "/firebase-messaging-compat.js"
);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll([OFFLINE_URL, DEFAULT_ICON]).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});

if (firebaseConfig.apiKey && firebaseConfig.messagingSenderId && firebaseConfig.appId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
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
