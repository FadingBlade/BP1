# BP1 Specification

Document version: 1.0.0

## 1. Scope

Blade Protocol 1 (BP1) defines an encrypted packaging format and browser runtime for static website resources. The public package consists of an encrypted bootstrap manifest (`index.bp1`) and encrypted resource objects under `bp/`.

This release distinguishes two internal wire profiles for backward compatibility. These identifiers are implementation details, not product release names:

- internal profile `1`: legacy per-object PBKDF2 derivation;
- internal profile `2`: current package-level PBKDF2 plus per-object HKDF derivation.

The BP1 product release described by this document is Version 1.0.0.

## 2. Repository layout

```text
index.bp1
bp/
  <random-object>.bp1
  <random-object>.bp1
  ...
```

`index.bp1` must exist exactly once at the repository root. Resource object names must be opaque and must not encode original source paths.

## 3. Encrypted object envelope

Every `.bp1` encrypted object uses this byte layout:

| Offset | Length | Meaning |
|---|---:|---|
| 0 | 4 | ASCII magic `BP1E` |
| 4 | 1 | internal wire profile identifier |
| 5 | 16 | salt |
| 21 | 12 | AES-GCM IV/nonce |
| 33 | remaining | AES-GCM ciphertext and authentication tag |

The minimum valid object length is 49 bytes.

## 4. Current cryptographic profile

The current packager writes internal profile `2`.

### 4.1 Password hardening

- KDF: PBKDF2
- PRF/hash: SHA-256
- iterations: 250,000
- output: 256 bits
- package salt: 16 cryptographically random bytes

PBKDF2 is executed once per package to derive a 256-bit master key.

### 4.2 Per-object key derivation

Each object receives a unique AES key derived with HKDF-SHA-256:

```text
HKDF-SHA-256(
  IKM  = package master key,
  salt = package salt,
  info = UTF-8("BP1v2:" + object-context)
)
```

The derived key is 256 bits and is used for AES-GCM.

For `index.bp1`, the object context is exactly `index.bp1`. For a resource object, the context is its exact random object filename from the manifest.

### 4.3 AES-GCM

- cipher: AES-256-GCM
- IV: 12 cryptographically random bytes per object
- additional authenticated data: UTF-8(`BP1|2|` + object-context)

The package salt stored in every current-profile object must match the salt in `index.bp1`.

## 5. Legacy cryptographic profile

The runtime may read internal profile `1` packages. In that profile, each object independently derives an AES-256-GCM key from the user password using PBKDF2-SHA-256 with 250,000 iterations and the object's own 16-byte salt. No HKDF or additional authenticated data is used.

New packages should use the current profile.

## 6. Manifest

After decrypting `index.bp1`, the plaintext is UTF-8 JSON. A current manifest has this general form:

```json
{
  "bp1": 2,
  "name": "Example Site",
  "version": 1,
  "entry": "index.html",
  "algorithm": "AES-256-GCM",
  "kdf": "PBKDF2-SHA-256+HKDF-SHA-256",
  "iterations": 250000,
  "hkdfHash": "SHA-256",
  "masterSalt": "<32 lowercase hex characters>",
  "created": "<ISO-8601 timestamp>",
  "files": {
    "index.html": {
      "object": "<opaque>.bp1",
      "type": "text/html; charset=utf-8",
      "size": 1234,
      "sha256": "<64 lowercase hex characters>"
    }
  }
}
```

### Required behavior

- `bp1` must equal the encrypted object's internal wire profile.
- `entry` must identify an existing manifest resource.
- resource paths are relative, forward-slash-separated, and may not contain empty segments, `.` segments, `..` segments, control characters, backslashes, a leading slash, or a trailing slash;
- object names must be unique and may not contain path separators or control characters;
- SHA-256 must be a 64-character hexadecimal digest;
- sizes must be non-negative safe integers when present;
- MIME types must not contain CR, LF, or NUL.

## 7. Integrity verification

After authenticated decryption, the runtime verifies each resource against its manifest `size` and SHA-256 digest before placing it into the virtual filesystem cache. A package must not launch if any required resource fails verification.

AES-GCM authentication protects encrypted-object integrity. The manifest SHA-256 values provide explicit plaintext verification and corruption detection after decryption.

## 8. Virtual filesystem

The runtime assigns each successfully loaded package a random 128-bit package identifier and stores verified resources under a path of the form:

```text
/__bp1__/<package-id>/<original-resource-path>
```

The Service Worker intercepts only this virtual path prefix. Non-BP1 requests are left to normal browser networking.

The Service Worker supports:

- GET;
- HEAD;
- HTTP byte ranges, including `206 Partial Content` and `416 Range Not Satisfiable`;
- query strings without changing the underlying BP1 resource lookup;
- directory requests that resolve to `index.html` when available.

## 9. Runtime caching

A newly loaded package is fully downloaded, decrypted, verified, and written to a new package cache before older BP1 package caches are removed. A failed load must not replace a previously valid package cache.

## 10. Versioning

Product release version: 1.0.0.

Internal wire profile identifiers are retained solely to preserve decoding compatibility and may differ from the product release version. Implementations must not infer product release numbers from the encrypted object profile byte.
