# ksqstudios-site

The marketing site for KSQ Studios LLC at [ksqstudios.com](https://ksqstudios.com).

A static site introducing the studio and its ten apps, with privacy and support pages.

The studio after hours: a dark room so the ten apps' colors can glow. On the home page the ten five-color arcs stand side by side like instruments on a bench, each with a reading that drifts as if live; pointing at one names its app. Each app entry draws its arc in as it scrolls into view. `scripts.js` runs both; nothing is stored or sent.

## Stack

- Plain HTML + CSS, no build step
- Hosted on Cloudflare Pages
- Typography: Geist and Geist Mono, loaded from Google Fonts
- Domain via Cloudflare Registrar

## Structure

```
.
├── index.html           # the page
├── privacy.html         # studio privacy policy
├── support.html         # links to each app's support page
├── styles.css           # all styles
├── scripts.js           # the wall of arcs and the entries
├── images/              # the ten app icons
├── favicon.png, favicon.ico, apple-touch-icon.png
└── og-image.png         # 1200x630 link preview
```

## Local preview

Open `index.html` in any browser, or serve from a folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

The site auto-deploys from the `main` branch via Cloudflare Pages. Push to GitHub and the site updates within ~30 seconds.

## Analytics

None. Keep it that way.

## License

© 2026 KSQ Studios LLC. All rights reserved.
