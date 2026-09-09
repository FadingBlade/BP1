# BP1 Example Workflow

Release version: 1.0.0

A normal source site might look like:

```text
my-site/
  index.html
  css/style.css
  js/app.js
  assets/logo.svg
```

Open `../packager/index.html`, select `my-site/`, enter a package key, and build the package. Extract the resulting ZIP into a public GitHub repository so the repository root contains `index.bp1` and `bp/`.

Deploy `../runtime/index.html` and `../runtime/bp1-sw.js` to HTTPS, open the runtime, then enter the GitHub repository URL and package key.
