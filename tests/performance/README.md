# Performance Tests

Release version: 1.0.0

- `BP1-Speed-Test-Legacy-READY.zip` uses the older per-file PBKDF2 profile.
- `BP1-Speed-Test-Current-READY.zip` uses the current package-level PBKDF2 plus per-file HKDF profile.
- `crypto-benchmark.html` compares KDF overhead locally in the browser without GitHub/network latency.

Both package tests use key `BP1-TEST-2026`.
