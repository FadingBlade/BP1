# BP1 Deployment Guide

Document version: 1.0.0

## Runtime deployment

Deploy exactly these two files together at the root of an HTTPS static site:

```text
index.html
bp1-sw.js
```

Cloudflare Pages is a suitable host. No Cloudflare Worker or server-side decryption component is required.

The Service Worker scope is based on the directory that contains `index.html`. Keeping both files at the deployment root is the simplest supported layout.

## Package hosting

The current runtime accepts public GitHub repositories. A repository must expose the package contents directly:

```text
index.bp1
bp/
  ...
```

Do not upload only the ZIP produced by the packager. Extract the ZIP and upload `index.bp1` and the `bp/` directory.

## Runtime origin isolation

Treat the BP1 runtime origin as an execution origin for untrusted packaged JavaScript. Use a dedicated hostname or project for BP1 and do not place unrelated authenticated applications, administrative panels, or sensitive same-origin data on that origin.

Recommended pattern:

```text
bp1-runtime.example.com
```

rather than sharing an origin with an account portal or administration application.

## Updating the runtime

Replace both runtime files together. The runtime registers its Service Worker with update checks enabled and supports immediate activation of a waiting BP1 Service Worker. Browser Service Worker lifecycle rules still apply, so after a deployment it is reasonable to reload the runtime page before testing.

## Test deployment

The included compatibility package uses key:

```text
BP1-TEST-2026
```

Extract `tests/compatibility/BP1-Compatibility-Test-READY.zip` into a public GitHub repository, then load that repository through the deployed runtime.
