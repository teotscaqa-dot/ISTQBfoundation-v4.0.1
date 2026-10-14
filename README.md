# ISTQB Foundation Quiz

Practice ISTQB Foundation v4.0.1 questions with instant feedback. Static app: questions are bundled, progress (streak, favorites) stays in the browser.

```bash
npm install
npm run dev       # local dev server
npm run build     # static build in dist/
```

## Updating questions

Put the Google Classroom export at `raw/istqb_questions.json` (not committed), then:

```bash
npm run import    # -> src/data/foundation-4.0.1.json + public/q-img/
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.
