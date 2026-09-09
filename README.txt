BP1 v2 TEST BUNDLE
==================

Key for every included test package:
BP1-TEST-2026

WHAT CHANGED IN V2
------------------
V1: every encrypted object runs PBKDF2-SHA-256 (250,000 iterations).
V2: PBKDF2-SHA-256 runs ONCE per package to create a 256-bit master key.
    HKDF-SHA-256 then derives a unique AES-256-GCM key per object.

V2 encryption chain:
Password -> PBKDF2(250,000, package salt) -> master key
Master key -> HKDF(package salt, object context) -> per-object AES-256 key
Per-object key -> AES-256-GCM

Each v2 .bp1 object keeps the same 33-byte pre-ciphertext header shape:
bytes 0-3   ASCII BP1E
byte 4      version = 2
bytes 5-20  package master salt (same for every object in one package)
bytes 21-32 random AES-GCM IV
byte 33+    ciphertext + authentication tag

HKDF context:
index.bp1 uses: BP1v2:index.bp1
resource uses:  BP1v2:<random-object-name>

AES-GCM additional authenticated data:
index.bp1 uses: BP1|2|index.bp1
resource uses:  BP1|2|<random-object-name>

FILES
-----
runtime/
  index.html  - dual-stack loader; supports BP1 v1 and v2
  bp1-sw.js   - virtual filesystem, Range/HEAD support

dev-tool/
  index.html  - BP1 v2 browser packager

BP1-v2-Compatibility-Package-READY.zip
  Full existing compatibility test repackaged as BP1 v2.

BP1-Speed-Test-v1-READY.zip
BP1-Speed-Test-v2-READY.zip
  Same 121-file site packaged in each format for direct timing comparison.

BP1-Speed-Test-Source.zip
  Unencrypted source of the speed test.

HOW TO TEST
-----------
1. Deploy runtime/index.html and runtime/bp1-sw.js to Cloudflare Pages.
2. Extract BP1-v2-Compatibility-Package-READY.zip into a PUBLIC GitHub repo.
3. Load that repo using key BP1-TEST-2026.
4. Confirm the compatibility results match the prior v1 test.
5. For speed comparison, put the v1 and v2 speed packages into two separate public GitHub repos.
6. Load each with the same runtime and key. The loader status reports total load time; v2 also reports the single PBKDF2 time.

BACKWARD COMPATIBILITY
----------------------
The new loader detects the encrypted index header version before decrypting it.
- version 1 -> original per-file PBKDF2 path
- version 2 -> one PBKDF2 master derivation + per-file HKDF path
Existing v1 packages do not need to be rebuilt.

KNOWN ARCHITECTURAL LIMITATION
------------------------------
A BP1-loaded site still cannot reliably register its own nested Service Worker.
Normal browser CORS rules also still apply to external network requests.
