# Charlie MIAO Yuchen · Personal Website

Personal site for Charlie MIAO Yuchen, Algorithm Engineer (Computer Vision) at OMNIVISION.

Live at **https://charliemiao0115.github.io/Homepage/**

## Stack

Plain HTML, CSS and JavaScript with no build step and no framework.

```
index.html             page content
404.html               not-found page
assets/css/style.css   styles and scroll-driven motion
assets/js/main.js      scroll engine, generated artwork, interactions
assets/img/            avatar, favicon, apple-touch-icon, og-image
.github/workflows/deploy.yml   CI/CD
```

The scroll effects work by having `main.js` write a progress value `--p` (0 → 1) onto every `[data-scroll]` section. The CSS turns that value into movement: the chip zoom, the word-by-word reveal and the horizontal process cards. Visitors with `prefers-reduced-motion` get a static layout.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## CI/CD

`.github/workflows/deploy.yml` runs on every push and pull request:

1. **Validate**: checks the HTML with `html-validate`, checks JS syntax and confirms every local `href`/`src` exists.
2. **Deploy**: publishes the site to GitHub Pages, but only from the default branch.

### One-time setup

1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Re-run the latest workflow, or push a commit to the default branch.

## Editing content

- **Add a publication**: copy a `<li class="pub">` block in the Research section of `index.html`.
- **Update numbers**: change the `data-count` attributes in the "At a glance" section and the publication metrics.
- **Colours**: change the CSS variables at the top of `assets/css/style.css`. `--accent` is the infrared orange.
