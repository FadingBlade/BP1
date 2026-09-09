# BP1 Packager Guide

Document version: 1.0.0

## Input requirements

The browser packager accepts a complete static website directory selected through the folder picker. The selected directory must contain a root `index.html`.

Paths are validated before packaging. Duplicate paths, traversal segments, empty path segments, control characters, and malformed paths are rejected.

## Output

The packager downloads a ZIP containing:

```text
index.bp1
bp/
  <random>.bp1
  <random>.bp1
  ...
```

Extract this ZIP before uploading it to the public GitHub repository used by the runtime.

## Encryption process

1. Generate a random 16-byte package salt.
2. Derive a package master key from the entered key using PBKDF2-SHA-256 with 250,000 iterations.
3. Generate a random object filename for each source file.
4. Derive a unique AES-256 key for each object with HKDF-SHA-256.
5. Encrypt each resource with AES-256-GCM and a fresh random 12-byte IV.
6. Calculate each plaintext file's SHA-256 digest and size.
7. Build the manifest.
8. Encrypt the manifest as `index.bp1` using the same package master-key hierarchy and a separate object context.
9. Produce the ZIP.

## MIME types

Common web file extensions are mapped to standard MIME types. Unknown extensions are packaged as `application/octet-stream`. The MIME type is preserved in the encrypted manifest and restored by the runtime when the resource is served.

## Backend-dependent websites

BP1 packages static resources. A site's external backend can still be contacted normally if it is reachable from the browser and permits the request under standard browser rules. Server-side application code itself is not packaged or executed by BP1.
