# Blade Protocol 1 (BP1)

BP1 is a browser-side encrypted website packaging and runtime system. A normal static website is packaged into encrypted `.bp1` objects, stored in a public GitHub repository, decrypted and verified in the user's browser, and served through a browser Service Worker as a virtual website.

Release version: **1.0.0**.

## What is included

- `runtime/` — deploy these files to a static HTTPS host such as Cloudflare Pages.
- `packager/` — open `index.html` in a modern browser to package a static website.
- `tests/compatibility/` — complete compatibility source and a prebuilt encrypted test package.
- `tests/performance/` — legacy/current crypto speed packages and a browser-only crypto benchmark.
- `docs/` — protocol, deployment, compatibility, security, packaging, testing, and release notes.
- `RELEASE.json` — machine-readable release metadata.
- `SHA256SUMS.txt` — SHA-256 checksums for release files.

## Fast start

1. Deploy `runtime/index.html` and `runtime/bp1-sw.js` together at the root of an HTTPS site.
2. Create a public GitHub repository containing an extracted BP1 package:

   ```text
   index.bp1
   bp/
     RANDOM.bp1
     RANDOM.bp1
     ...
   ```

3. Open the BP1 runtime, enter the public GitHub repository URL and the package key, then load the site.

For the included compatibility test, use `tests/compatibility/BP1-Compatibility-Test-READY.zip`, extract it into a public GitHub repository, and use key `BP1-TEST-2026`.

## Current behavior

The current packager uses PBKDF2-SHA-256 once per package, then HKDF-SHA-256 to derive an independent AES-256-GCM key for each encrypted object. The runtime also retains compatibility with older BP1 packages that used per-file PBKDF2 derivation.

BP1 performs decryption, integrity verification, caching, and website execution entirely in the client browser. The static host and GitHub repository never receive the plaintext encryption key from BP1.

## Known architectural limitation

A packaged website cannot reliably register its own Service Worker through BP1's static virtual-filesystem architecture. Features that require a site-owned Service Worker, such as some PWA offline flows, push notification handling, and Background Sync, are therefore not guaranteed. External network requests continue to follow normal browser CORS rules.

See `docs/` for the complete specification and operating guidance.
