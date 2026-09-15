# SecPaid marketing site

Static site. Shared `styles.css`, `main.js`, and `assets/` (logo, payment-method
icons, dashboard screenshots pulled from the current secpaid.com).

## Pages

| URL (on deploy) | File | Title |
| --- | --- | --- |
| `/` | `index.html` | SecPaid, payment processing for high-risk merchants |
| `/online-pharmacy-merchant-account/` | `online-pharmacy-merchant-account/index.html` | Online Pharmacy Merchant Account, High-Risk Payment Processing |
| `/supplements-nutraceuticals-merchant-account/` | `supplements-nutraceuticals-merchant-account/index.html` | Supplement & Nutraceutical Merchant Account, High-Risk Payment Processing |
| `/medical-cannabis-cbd-payment-processing/` | `medical-cannabis-cbd-payment-processing/index.html` | Medical Cannabis & CBD Payment Processing, EU High-Risk Gateway |
| `/telehealth-payment-processing/` | `telehealth-payment-processing/index.html` | Telehealth Payment Processing, High-Risk Merchant Account |

Each vertical page has a unique title, meta description, self-referencing
canonical, and BreadcrumbList plus FAQPage JSON-LD. The main page links to all
four from the Industries section and the footer; each vertical page links back to
the other three.

## Preview locally

The main page opens on its own by double-clicking `index.html`. Full navigation
between pages needs a server:

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765.

## SEO notes for deployment

- **Fix the canonical bug on the live site first.** Every page on the current
  secpaid.com (including `/pharmaone-shops/` and the blog post) sets its canonical
  to the homepage, which tells Google to ignore the page. Every page also shares
  the homepage title and meta description. Nothing else ranks until this is fixed.
- **301-redirect `/pharmaone-shops/` to `/online-pharmacy-merchant-account/`.**
  The new pharmacy page absorbs that content with a real, keyword-matched URL,
  title, and meta. The PharmaOne ecosystem is still referenced on the page.
- **Add `sitemap.xml` entries** for the four new URLs (see `sitemap.xml` here) and
  keep the existing legal, blog, and feature URLs from the live sitemap.
- **Open Graph image**: the live site uses the logo SVG as `og:image`. Replace
  with a real 1200x630 PNG or JPG.
- Vertical pages are English only. A German set (`/de/...`) would open the less
  contested DACH high-risk search space.

## Placeholders to replace before launch

- **Testimonials** (`index.html`, `#testimonials`): the lead quote is from a real
  customer whose name, photo, and written consent are still being confirmed. The
  two supporting quotes are placeholders. Do not publish the section as real
  endorsements until each quote has a named, consenting customer and a real photo.
  Photo slots are `span.t-photo.is-placeholder`; swap for `<img class="t-photo">`.
- Plan names (Solo, Ensemble, Orchestra), prices, and the `[Feature placeholder]`
  lines in the pricing section.
- The signup form in `main.js` has a `TODO` where it should POST to your billing
  backend.
- Footer legal links (Privacy, Terms, Impressum, AML, Cookie) point to `#`.
- "Full API docs" links point to secpaid.com; swap for the real docs URL.
- The DE language toggle is visual only.
