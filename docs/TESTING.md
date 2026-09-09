# BP1 Testing Guide

Document version: 1.0.0

## Compatibility test

Use:

```text
tests/compatibility/BP1-Compatibility-Test-READY.zip
```

Key:

```text
BP1-TEST-2026
```

Extract the ZIP into a public GitHub repository, load it through the BP1 runtime, and select **Run all tests**. The test page can copy a complete results report.

The `source/` directory contains the unencrypted compatibility site used to build the package.

## Manual checks

The compatibility page includes direct user-gesture checks for audio playback, video playback, and downloading. Browser permission and gesture requirements make these better as manual confirmations.

## Expected limitation

The packaged-site Service Worker registration test is expected to report a known limitation. It should not be treated as a regression unless BP1 later adopts an architecture that explicitly supports nested site Service Workers.

## Performance tests

`tests/performance/BP1-Speed-Test-Legacy-READY.zip` exercises the older per-file PBKDF2 profile.

`tests/performance/BP1-Speed-Test-Current-READY.zip` exercises the current package-level PBKDF2 + HKDF profile.

Use the same runtime and key `BP1-TEST-2026` for both. Network latency affects total load times, so repeat tests and compare several runs.

`crypto-benchmark.html` isolates the key-derivation difference from GitHub/network overhead and runs entirely in the browser.

## Release validation checklist

Before replacing a deployed runtime:

1. Run JavaScript syntax checks on the runtime, Service Worker, packager, and test suite.
2. Confirm the current compatibility package decrypts and all manifest SHA-256 hashes match.
3. Deploy runtime files to HTTPS.
4. Load the compatibility package and run all automated tests.
5. Manually confirm audio, video, and download behavior.
6. Load at least one older BP1 package to verify backward compatibility.
7. Test the current packager by packaging a small multi-file site and loading the result.
