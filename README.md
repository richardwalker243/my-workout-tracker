# Workout Tracker

Mobile-friendly web app for **routines**, **in-gym sessions** (max weight, last time, checkboxes), **workout history**, and **per-exercise progress** with a line chart. Data stays in your browser (localStorage).

## Run locally

Requires [Node.js](https://nodejs.org/) 20+.

```bash
cd workout-tracker
npm install
npm run dev
```

Open the URL shown (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Deploy to a public URL

1. Create a repository on GitHub and push this folder.
2. In [Vercel](https://vercel.com), [Netlify](https://netlify.com), or [Cloudflare Pages](https://pages.cloudflare.com), choose **Import project** and select the repo.
3. Use the default settings for a Vite app: build command `npm run build`, output directory `dist`.
4. After deploy, open the HTTPS URL on your phone. For a home-screen icon, use **Add to Home Screen** (PWA).

## Progressive Web App

The app registers a service worker in production builds so it can work offline after the first visit. Install dependencies and run `npm run build` to verify the PWA bundle.
