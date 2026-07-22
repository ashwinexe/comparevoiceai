# CompareVoiceAI

Static voice-AI pricing catalog, comparison pages, calculator, and engineering guides for [comparevoiceai.com](https://comparevoiceai.com).

## Local development

```sh
npm ci
npm run dev
```

## Validate the production build

```sh
npm run validate
npm run preview
```

The production document root is `dist/`. The validation command type-checks the app, runs the calculator and pricing regression tests, builds the site, prerenders every indexable route, and audits the generated static output.

## Deployment

Pushes to `main` run `.github/workflows/deploy-pages.yml`. GitHub Actions builds and audits the site, uploads `dist/`, and deploys it to GitHub Pages. The Pages custom domain is `comparevoiceai.com`.
