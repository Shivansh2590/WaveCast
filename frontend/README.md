# Wavecast (Frontend)

A podcast streaming frontend built with React, Vite, and Tailwind CSS — now connected
to the companion Node.js backend for real authentication, podcast creation, and
episode publishing (Cloudinary for audio, ImageKit for cover images).

## Structure

```
src/
  assets/
  components/
    AudioPlayer.jsx      – persistent bottom player bar (play/pause/seek/volume)
    CategoryCard.jsx      – category tile used on Home & Browse
    EditorCard.jsx         – large featured card for Editor's Picks
    EpisodeRow.jsx           – single row in an episode list
    navbar.jsx                – top nav; shows Sign In, or Studio + avatar when logged in
    PodcastCard.jsx            – square show card for Trending Now
    ReleaseCard.jsx              – square show card for New Releases
  context/
    AuthContext.jsx        – login/register (listener + creator), session state
    PlayerContext.jsx       – now-playing state shared with AudioPlayer
  data/
    podcasts.js              – mock data for the public browse/home pages
  lib/
    api.js                     – axios client wired to the backend (cookies + bearer)
  pages/
    Browse.jsx                  – category filter + search results
    CreateAccount.jsx            – listener sign-up (calls /api/auth/register)
    CreatorPortal.jsx             – creator sign-up (calls /api/auth/creator/register)
    CreatorSignIn.jsx              – creator sign-in
    CreatePodcast.jsx                – Record or Upload an episode, publish a podcast
    CreatorStudio.jsx                 – creator dashboard (stats + quick actions)
    Footer.jsx                         – site footer (used on every page)
    frontpage.jsx                       – home page (hero, categories, trending, etc.)
    Library.jsx                          – listener library placeholder
    NewRelease.jsx                        – full New Releases grid
    PodcastDetails.jsx                     – show page with full episode list + Play
    SignIn.jsx                              – listener sign-in
    YourPodcasts.jsx                         – creator's own shows, "New Podcast" CTA
  App.jsx      – providers (Auth, Player) + route definitions + global player bar
  index.css    – Tailwind directives + base styles
  main.jsx     – app entry point
```

## Getting started

```bash
cp .env.example .env      # VITE_API_URL, defaults to http://localhost:5000/api
npm install
npm run dev       # starts the dev server
npm run build     # production build
npm run preview   # preview the production build
```

Make sure the backend (see `../backend`) is running first — sign-in, sign-up, and
the Creator Studio all call it directly.

## Auth flow

- `AuthContext` calls `/api/auth/*` and stores the returned JWT in `localStorage`
  (sent as a `Bearer` header) in addition to relying on the backend's httpOnly cookie.
- Once signed in as a creator, the navbar shows a **Studio** link and your avatar.
- `/studio`, `/studio/podcasts`, and `/studio/new` all redirect to `/creator/signin`
  if you're not signed in as a creator.

## Notes

- The public Home/Browse/New Releases pages still use mock data in `src/data/podcasts.js`
  so the app looks fully populated out of the box.
- Podcasts you create for real in the Creator Studio are persisted through the backend
  (MongoDB + Cloudinary + ImageKit) and are visible at `/studio/podcasts` and `/podcast/:id`.
