# BP1 Release Validation

Document version: 1.0.0

## Offline validation completed

The release bundle was checked for the following before packaging:

- runtime loader JavaScript parses successfully;
- runtime Service Worker JavaScript parses successfully;
- packager JavaScript parses successfully;
- compatibility-suite module JavaScript parses successfully;
- the updated compatibility package was rebuilt using the current cryptographic profile;
- its encrypted manifest decrypted successfully with the documented test key;
- all 17 encrypted compatibility resources decrypted successfully;
- all 17 resources matched their declared plaintext sizes;
- all 17 resources matched their declared SHA-256 digests;
- the compatibility ZIP exposes `index.bp1` and `bp/` at the archive root;
- runtime and packager deployable ZIPs contain only their required files;
- release-file SHA-256 checksums are included in `SHA256SUMS.txt`.

## Browser regression baseline

The BP1 runtime design represented by this release has already been exercised in Chrome on Windows with successful results for HTML, CSS, modules, dynamic imports, Web Workers, module Workers, WebAssembly, binary resources, multi-megabyte resources, byte ranges/206, storage APIs, Web Crypto, media resources, and downloads.

The updated compatibility suite makes HEAD, FormData multipart encoding, and CORS-enabled external fetch checks more definitive. These browser-level checks should be run after deploying the release runtime because Service Worker behavior cannot be fully validated by static syntax or Node-based crypto checks alone.

## Expected result

The site-owned Service Worker test is a documented architectural limitation and is not a release-blocking failure for Version 1.0.0.
