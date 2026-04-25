# ksqstudios-site

The marketing site for KSQ Studios LLC at [ksqstudios.com](https://ksqstudios.com).

A static, single-page site introducing the studio and linking to its two product sites (minuted.org and winnowed.app).

## Stack

- Plain HTML + CSS, no build step
- Hosted on Cloudflare Pages
- Typography: Fraunces (display) + Inter (body), loaded from Google Fonts
- Domain via Cloudflare Registrar

## Structure

```
.
├── index.html          # The page
├── styles.css          # All styles
├── images/
│   ├── minuted-icon.png
│   └── winnowed-icon.png
├── favicon.png         # TODO: 48x48
├── apple-touch-icon.png # TODO: 180x180
├── og-image.png        # TODO: 1200x630
└── README.md
```

## Local preview

Open `index.html` in any browser, or serve from a folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

The site auto-deploys from the `main` branch via Cloudflare Pages. Push to GitHub and the site updates within ~30 seconds.

## TODO

- [ ] Add favicon.png (48×48)
- [ ] Add apple-touch-icon.png (180×180)
- [ ] Add og-image.png (1200×630)
- [ ] Update App Store status pills once apps are live (replace `<span class="app-status">` with actual App Store links)

## License

© 2026 KSQ Studios LLC. All rights reserved.
