const CACHE_NAME = "clinic-site-shell-v7";
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
  "./css/fonts.css",
  "./css/vendor/fontawesome.min.css",
  "./css/accessibility.css",
  "./css/print.css",
  "./fonts/open-sans-latin.woff2",
  "./fonts/noto-sans-arabic.woff2",
  "./fonts/noto-sans-devanagari.woff2",
  "./fonts/fa-brands-400.woff2",
  "./fonts/fa-regular-400.woff2",
  "./fonts/fa-solid-900.woff2",
  "./fonts/fa-v4compatibility.woff2",
  "./js/data.js",
  "./js/main.js",
  "./js/calculators.js",
  "./js/ics-generator.js",
  "./js/content/clinic-profile.json",
  "./js/content/opening-hours.json",
  "./js/content/site-settings.json",
  "./js/content/appointments.json",
  "./js/content/homepage.json",
  "./js/content/services.json",
  "./js/content/shop.json",
  "./js/content/blog.json",
  "./js/content/patient-info.json",
  "./js/content/health-resources.json",
  "./img/favicon.svg",
  "./img/doctor.jpg",
  "./img/doctor.webp",
  "./img/doctor.avif",
  "./img/products/bp-monitor.svg",
  "./img/products/bp-monitor.webp",
  "./img/products/bp-monitor.avif",
  "./img/products/glucometer.svg",
  "./img/products/glucometer.webp",
  "./img/products/glucometer.avif",
  "./img/products/glucosamine.svg",
  "./img/products/glucosamine.webp",
  "./img/products/glucosamine.avif",
  "./img/products/omega3.svg",
  "./img/products/omega3.webp",
  "./img/products/omega3.avif",
  "./img/products/probiotic.svg",
  "./img/products/probiotic.webp",
  "./img/products/probiotic.avif",
  "./img/products/vitamin-d.svg",
  "./img/products/vitamin-d.webp",
  "./img/products/vitamin-d.avif"
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
