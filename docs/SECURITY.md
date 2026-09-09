# BP1 Security Notes

Document version: 1.0.0

## Security model

BP1 encrypts package resources at rest in the public package repository and decrypts them in the user's browser after the user supplies the package key. The static runtime host does not need the package key.

The current package profile uses:

- PBKDF2-SHA-256, 250,000 iterations, once per package;
- HKDF-SHA-256 to derive an independent AES key for each encrypted object;
- AES-256-GCM with a fresh 96-bit IV for every object;
- authenticated object context to prevent encrypted-object substitution between filenames;
- SHA-256 plaintext verification and size verification before resources are served.

## Key strength

PBKDF2 slows password guessing but cannot make a weak password strong. Use a long, high-entropy key for packages that require meaningful confidentiality. A randomly generated key is preferable to a short human password.

An attacker with the public package can perform offline key guesses. Because successful decryption can be authenticated with AES-GCM, security ultimately depends on key entropy and KDF cost.

## Browser plaintext

BP1 is not DRM. To execute a site, the browser must eventually hold decrypted HTML, JavaScript, media, and other resources. A user who controls the client environment can potentially inspect plaintext after decryption.

## Runtime-origin trust boundary

Packaged JavaScript executes under the BP1 runtime origin. The runtime iframe currently allows scripts and same-origin behavior because ordinary website functionality depends on them. Therefore:

- use a dedicated BP1 runtime origin;
- do not place sensitive cookies, authenticated administrative applications, or unrelated private data on the same origin;
- treat packages as executable code, not merely passive documents.

## Repository metadata

Encryption hides resource plaintext and original paths from the random object filenames, but a public repository still reveals package existence, total object count, approximate encrypted object sizes, update timing, repository ownership, and other repository metadata.

## Integrity

AES-GCM authenticates encrypted objects. After decryption, SHA-256 and declared-size checks are performed before resources enter the virtual filesystem. Any mismatch causes package loading to fail.

## Networking

BP1 does not proxy or hide external network requests made by packaged code. Those requests originate from the browser and remain subject to normal browser policy and destination-server behavior.

## Not a sandbox boundary

The iframe sandbox reduces some capabilities but should not be considered a complete security boundary for hostile packages because `allow-scripts` and `allow-same-origin` are intentionally enabled. Origin isolation is the primary operational mitigation.
