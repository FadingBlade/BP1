BP1 FULL END-TO-END TEST
========================

TEST KEY
  BP1-TEST-2026

A. FASTEST RUNTIME TEST
1. Create a NEW public GitHub repository.
2. Extract BP1-Test-Package-READY.zip.
3. Upload index.bp1 and the bp/ folder to the repository root.
4. Deploy the contents of runtime/ to Cloudflare Pages (index.html + bp1-sw.js at the same directory level).
5. Open the Cloudflare Pages HTTPS URL.
6. Enter the public GitHub repository URL.
7. Enter key: BP1-TEST-2026
8. Click Load Website.

PASS CONDITIONS
- Main page renders with dark styling.
- BP1 SVG logo appears.
- JavaScript status changes to Loaded.
- Clicking Test JavaScript changes the result text.
- JSON status changes to Loaded and JSON is displayed.
- Open second page works and remains styled.
- Back to test page works.

B. PACKAGER TEST
1. Open dev-tool/index.html in a modern browser.
2. Select the test-site/ folder.
3. Keep key BP1-TEST-2026 (or choose another key).
4. Click Build BP1 Package.
5. Extract the generated ZIP and upload it to another public GitHub repo.
6. Load that repo through the hosted runtime with the same key.
7. Repeat the PASS CONDITIONS above.

FAILURE TESTS
- Wrong key should fail before launching the site.
- Repository without index.bp1 should report that index.bp1 is missing.
- Delete one encrypted object from bp/ and loading should report a missing BP1 resource.

IMPORTANT
Use a dedicated Cloudflare Pages project/origin for the BP1 runtime when testing untrusted BP1 packages.
