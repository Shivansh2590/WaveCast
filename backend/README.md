# Wavecast Backend

Node.js + Express + MongoDB API for the Wavecast podcast app.
Episode audio is stored on Cloudinary; podcast cover images are stored on ImageKit.

## Structure

```
src/
  config/
    config.js              – loads and exports all env vars in one place
  controllers/
    user.controller.js     – register/login/logout, profile, become-creator
    podcast.controller.js  – list/create/delete podcasts, add episodes, subscribe
  db/
    db.js                  – Mongoose connection
  middleware/
    protected.middleware.js – JWT auth guard + creator-only guard
    multer.middleware.js    – in-memory file upload handling (image/audio)
  models/
    user.model.js
    podcast.model.js
    episode.model.js
  routes/
    auth.router.js         – /api/auth/*
    user.router.js         – /api/users/*
    podcast.router.js      – /api/podcasts/*
  services/
    imagekit.service.js    – cover image upload/delete
    cloudinary.service.js  – episode audio upload/delete
  utils/
    generateToken.js       – JWT signing + cookie helper
  app.js                    – express app (middleware + routes)
server.js                   – connects to MongoDB, then starts the server
```

## Setup

```bash
cp .env.example .env
# then fill in MONGODB_URI, JWT_SECRET, CLOUDINARY_*, IMAGEKIT_* in .env
npm install
npm run dev      # nodemon, auto-restarts
# or
npm start
```

Server runs on `http://localhost:5000` by default. Health check: `GET /api/health`.

## Required keys (put these in `.env`)

| Key | Where to get it |
|---|---|
| `MONGODB_URI` | https://www.mongodb.com/cloud/atlas — free cluster, copy the connection string |
| `JWT_SECRET` | any long random string (e.g. `openssl rand -base64 32`) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | https://console.cloudinary.com/settings/api-keys |
| `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` / `IMAGEKIT_URL_ENDPOINT` | https://imagekit.io/dashboard/developer/api-keys |

## API overview

- `POST /api/auth/register` `{ name, email, password }` → listener account
- `POST /api/auth/login` `{ email, password }`
- `POST /api/auth/creator/register` `{ channelName, name, email, password }` → creator account
- `POST /api/auth/creator/login` `{ email, password }`
- `POST /api/auth/logout`
- `GET /api/users/me` (auth) → current user
- `PATCH /api/users/me/become-creator` `{ channelName }` (auth)
- `GET /api/podcasts` `?category=&search=` → public feed
- `GET /api/podcasts/mine` (creator) → your own shows
- `GET /api/podcasts/:id` → podcast + its episodes
- `POST /api/podcasts` (creator, multipart: `coverImage` + fields) → create a show
- `POST /api/podcasts/:id/episodes` (creator, multipart: `audio` + fields) → publish an episode
- `POST /api/podcasts/:id/subscribe` (auth) → toggle subscription
