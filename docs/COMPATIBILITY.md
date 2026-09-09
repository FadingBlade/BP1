# BP1 Compatibility

Document version: 1.0.0

## Confirmed functionality

The provided browser compatibility suite exercises ordinary static-site behavior including:

- HTML, CSS, classic JavaScript, ES modules, static imports, dynamic `import()`, and `import.meta.url`;
- SVG and binary resources;
- local `fetch`, query strings, URL fragments, XMLHttpRequest, nested paths, directory indexes, and 404 behavior;
- classic Web Workers and module Web Workers;
- WebAssembly;
- multi-megabyte resources;
- HTTP Range / `206 Partial Content` behavior;
- HEAD requests;
- History API;
- localStorage, sessionStorage, IndexedDB, and Cache Storage;
- Web Crypto;
- FormData multipart encoding;
- audio/video resource metadata and browser playback;
- downloadable resources;
- external HTTPS fetches when the destination permits CORS.

## Known limitation: site-owned Service Workers

A website running inside BP1's Service Worker-backed virtual filesystem cannot reliably register another Service Worker whose script exists only inside that virtual filesystem. Consequently, packaged sites must not depend on their own Service Worker for core functionality.

Common affected features include:

- PWA-specific offline caching implemented by the packaged site;
- push event handlers owned by the packaged site;
- Background Sync owned by the packaged site.

This does not prevent ordinary JavaScript Web Workers, module Workers, Cache Storage, IndexedDB, or the BP1 runtime Service Worker from working.

## External networking

Relative BP1 resource requests are served by the BP1 virtual filesystem. External HTTP(S) requests are normal browser network requests and remain subject to browser security controls, including CORS, CSP behavior of the destination/context, mixed-content rules, and network policy.

BP1 intentionally does not bypass CORS.

## Browser support target

A compatible browser needs modern Web Platform support for Service Workers, Cache Storage, Web Crypto (PBKDF2, HKDF, AES-GCM, SHA-256), `fetch`, and standard JavaScript modules for sites that use modules.

The release has been validated primarily in Chromium-based browsers. Firefox, Safari, iOS, and Android should be regression-tested before making browser-specific guarantees for a deployment.
