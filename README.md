# 7 Hing Wan Street — responsive one-page

Static HTML/CSS/JS build of the `Homepage_opt2` design (Assembly / Vervain).

- `index.html` – page markup
- `assets/css/style.css` – styles (desktop base 1920px; breakpoints 1100 / 900 / 640)
- `assets/js/main.js` – mobile menu, suite tabs, photo sliders, enquiry form (opens mail client)
- `assets/img`, `assets/icons` – images exported from the PSD / Hi-Res Retouched folder; icons are SVGs from the PSD vector smart objects

Preview locally:

    python3 -m http.server 8765

Fonts: Aboreto + Montserrat (Google Fonts).

## Preview gate & deploys

- The page opens behind a black password gate (client-side only: GitHub Pages is static, so this hides the
  page from casual visitors but is not real protection — the repo itself is public). A correct password is
  remembered in the browser for 24 hours.
- GitHub Pages caches CSS/JS for ~10 minutes. When `style.css` or `main.js` change, bump the `?v=` number on
  their links in `index.html` so visitors never get new HTML with an old stylesheet.
