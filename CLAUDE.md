# SecPaid website

Static HTML/CSS/JS site, no build tooling. Deployed to GitHub Pages from `main`.

## Cache-busting styles.css and main.js

GitHub Pages serves `styles.css` and `main.js` with `Cache-Control: max-age=600`, so after any
change to either file, browsers/CDN can serve the *old* version against the *new* HTML for up
to 10 minutes. This has caused real bugs that "fixed themselves" after the cache expired —
a broken footer layout from stale CSS, and a stale `main.js` silently skipping the reCAPTCHA
check on form submit (old JS predating the feature, served against new HTML that assumed it
was there).

Every page links both as `styles.css?v=N` / `main.js?v=N` (see the `<link rel="stylesheet">`
and the closing `<script src="...main.js?v=N">` tags). **Whenever `styles.css` or `main.js` is
edited, bump that file's `?v=N` to `?v=N+1` across every HTML file in the same commit** so the
new version is fetched immediately instead of waiting out the cache window. The two files have
independent version counters — bump only the one you changed.

```bash
# bump styles.css from v=4 to v=5 across the whole site
grep -rl 'styles.css?v=4' --include='*.html' . | xargs sed -i '' 's/styles\.css?v=4/styles.css?v=5/g'

# bump main.js from v=2 to v=3 across the whole site
grep -rl 'main.js?v=2' --include='*.html' . | xargs sed -i '' 's/main\.js?v=2/main.js?v=3/g'
```
