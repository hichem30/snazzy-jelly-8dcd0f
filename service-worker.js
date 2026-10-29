const CACHE_NAME = "clinic-site-shell-v4";
const APP_SHELL = [
  "./",
  "./index.html",
  "./about.html",
  "./services.html",
  "./shop.html",
  "./appointment.html",
  "./contact.html",
  "./faq.html",
  "./blog.html",
  "./tools.html",
  "./css/style.css",
  "./css/ar.css",
  "./css/accessibility.css",
  "./css/print.css",
  "./js/data.js",
  "./js/main.js",
  "./js/calculators.js",
  "./js/ics-generator.js",
  "./js/content/clinic-profile.json",
  "./js/content/opening-hours.json",
  "./js/content/site-settings.json",
  "./js/content/services.json",
  "./js/content/shop.json",
  "./js/content/blog.json",
  "./js/content/patient-info.json",
  "./js/content/health-resources.json",
  "./img/favicon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith("clinic-site-shell-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin ||
    url.pathname === "/admin" || url.pathname.startsWith("/admin/")) return;

  if (url.pathname.startsWith("/js/content/")) {
    event.respondWith(fetch(request).then(async (response) => {
      if (response.ok) {
        await (await caches.open(CACHE_NAME)).put(request, response.clone());
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      return new Response("Clinic content is unavailable offline.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }));
    return;
  }

  event.respondWith(fetch(request).then(async (response) => {
    if (response.ok && response.type === "basic") {
      await (await caches.open(CACHE_NAME)).put(request, response.clone());
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(request) ||
      await caches.match(new Request(`${url.origin}${url.pathname}`));
    if (cached) return cached;
    return new Response("This page is unavailable offline.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }));
});
