# SecPaid website

Static HTML/CSS/JS site, no build tooling. Deployed to GitHub Pages from `main`.

## Cache-busting styles.css

GitHub Pages serves `styles.css` with `Cache-Control: max-age=600`, so after any CSS change,
browsers/CDN can serve the *old* stylesheet against the *new* HTML for up to 10 minutes —
this has caused real layout bugs (e.g. overlapping footer columns) that "fixed themselves"
once the cache expired.

Every page links the stylesheet as `styles.css?v=N` (see any `<link rel="stylesheet">` tag).
**Whenever `styles.css` is edited, bump `?v=N` to `?v=N+1` across every HTML file in the same
commit** so the new CSS is fetched immediately instead of waiting out the cache window.

```bash
# bump from v=2 to v=3 across the whole site
grep -rl 'styles.css?v=2' --include='*.html' . | xargs sed -i '' 's/styles\.css?v=2/styles.css?v=3/g'
```
