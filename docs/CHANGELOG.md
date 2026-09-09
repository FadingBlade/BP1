# BP1 Changelog

Document version: 1.0.0

## 1.0.0

Initial consolidated BP1 release.

Included capabilities:

- browser-only encrypted package loading from public GitHub repositories;
- browser-only website packager;
- AES-256-GCM authenticated encryption;
- current package-level PBKDF2 + per-object HKDF key hierarchy;
- backward compatibility with the older per-object PBKDF2 package profile;
- SHA-256 and plaintext-size verification;
- virtual filesystem through Cache Storage and a runtime Service Worker;
- GET, HEAD, byte-range/206, 404, query-string, fragment, and directory-index handling;
- atomic-style package cache replacement and stale BP1 cache cleanup;
- path, manifest, object-name, MIME, algorithm, KDF, version, and integrity validation;
- compatibility and performance test packages;
- documented nested site Service Worker limitation;
- deployment, security, protocol, packaging, compatibility, and testing documentation.
