/* BP1 Hosted Runtime Service Worker
 *
 * This is a browser Service Worker, NOT a Cloudflare Worker.
 * It serves decrypted BP1 resources from Cache Storage.
 */

const CACHE_PREFIX = "bp1-package-v1-";
const BP1_PREFIX = "/__bp1__/";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  if (!url.pathname.startsWith(BP1_PREFIX)) return;

  event.respondWith(handleBP1Request(event.request));
});

async function handleBP1Request(request) {
  const url = new URL(request.url);
  const relative = url.pathname.slice(BP1_PREFIX.length);
  const slash = relative.indexOf("/");

  if (slash <= 0) {
    return new Response("Invalid BP1 path.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  const packageId = relative.slice(0, slash);
  const path = relative.slice(slash + 1);

  if (!packageId || !path || path.includes("..")) {
    return new Response("Invalid BP1 path.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  const cache = await caches.open(CACHE_PREFIX + packageId);

  // Cache keys are stored without query strings. This lets normal website
  // requests such as "app.js?v=2" resolve to the same BP1 resource.
  const resourceURL = new URL(BP1_PREFIX + packageId + "/" + path, url.origin);
  const response = await cache.match(resourceURL);

  if (response) {
    return response;
  }

  // If a directory is requested, try its index.html.
  if (url.pathname.endsWith("/")) {
    const indexURL = new URL(BP1_PREFIX + packageId + "/" + path + "index.html", url.origin);
    const indexResponse = await cache.match(indexURL);
    if (indexResponse) return indexResponse;
  }

  return new Response("BP1 resource not found.", {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
