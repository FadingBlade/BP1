# BP1 Hosted Runtime

This is the hosted runtime for BP1 (Blade Protocol 1).

## Files

- `index.html` — BP1 loader UI and package downloader/decryptor.
- `bp1-sw.js` — browser Service Worker that exposes decrypted BP1 resources as normal HTTP(S) resources.

## Deploying to Cloudflare Pages

Upload/deploy this folder as a normal static Cloudflare Pages project.

No Cloudflare Worker is required.

The runtime must be accessed over HTTPS. Cloudflare Pages provides HTTPS automatically.

## BP1 package format

A public repository loaded by the runtime should contain:

```text
My-BP1-Site/
├── index.bp1
└── bp/
    ├── RANDOM1.bp1
    ├── RANDOM2.bp1
    └── ...
```

The loader downloads `index.bp1`, decrypts the manifest, then downloads and decrypts every resource listed in the manifest.

## Important security note

The BP1 website runs in an iframe under the runtime's origin. This prototype is intended for BP1 packages you trust. Do not treat BP1 encryption as DRM: once a package is loaded, its decrypted resources necessarily exist in the user's browser.

For a production release, isolate untrusted BP1 packages on a dedicated runtime origin/subdomain rather than hosting the loader and arbitrary BP1 content on an origin containing other sensitive applications.

## Current compatibility target

The hosted runtime is designed to make normal browser requests work for:

- HTML
- CSS
- JavaScript
- images
- SVG
- JSON
- audio/video
- fonts
- nested paths
- multiple HTML pages
- relative URLs
- `fetch()` to BP1 resources

Advanced features such as Web Workers, WebSockets, cross-origin APIs, streaming/range requests, and service workers inside the BP1 site require additional work.
