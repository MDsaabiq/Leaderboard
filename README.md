# Tech Fest Gaming Zone Leaderboard (Vercel + MongoDB)

Production-ready leaderboard focused on:
- Drone Arena
- VR
- Robot Soccer

Additional boards included:
- Drone Track
- Board Ice Hockey

## Features
- Next.js serverless API routes for Vercel.
- MongoDB persistence (no local-only storage dependency).
- Robust API error handling with request IDs.
- Structured logs for Vercel (`console.log` and `console.error` JSON payloads).
- Frontend fail-safe behavior:
  - Timeout + catch for API calls.
  - Cached fallback data when network/db is temporarily unavailable.
  - Emergency fallback seed data for projector continuity.
- 3D-styled animated UI and upgraded visual symbols.

## 1) Local Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 2) Environment Variables

Create `.env.local` (or configure in Vercel dashboard):

```env
MONGODB_URI=mongodb+srv://<username>:<password>@leaderboard.iuc1pzg.mongodb.net/
MONGODB_DB=techfest_leaderboard
LEADERBOARD_COLLECTION=entries
ADMIN_SECRET=<strong-secret-for-admin-actions>
NEXT_PUBLIC_VR_GIF_URL=<optional-direct-gif-url-from-media.tenor.com>
```

Important:
- Use a **direct GIF file URL** for `NEXT_PUBLIC_VR_GIF_URL` (from `media.tenor.com`), not a Tenor page URL.
- Never commit `.env.local`.

## 3) MongoDB Setup

1. In MongoDB Atlas, allow your Vercel deployment IP access (or temporarily allow all during setup).
2. Create DB user with read/write access for this project.
3. Use the provided connection string in `MONGODB_URI`.

## 4) Deploy To Vercel (No Render)

1. Push this `Leaderboard` folder to a GitHub repo.
2. In Vercel, click `Add New Project` and import that repo.
3. Set root directory to `Leaderboard` if repo has multiple folders.
4. Add environment variables from section 2.
5. Deploy.

## 5) Verify After Deploy

- Open `/api/health` and confirm `{ "ok": true }`.
- Open homepage and verify live entries load.
- Open admin panel and test add/update/delete with `ADMIN_SECRET`.
- Check Vercel logs for structured events:
  - `entries_post_success`
  - `entries_post_failed`
  - `entries_get_failed`

## 6) Admin Usage

- `Save or Update Entry` upserts by `game + playerId`.
- `Delete by Game + Player ID` removes that record.
- Invalid auth returns 401 and does not modify data.

## API Summary

- `GET /api/entries?game=droneArena`
- `POST /api/entries` with header `x-admin-secret`
- `DELETE /api/entries/{game__playerId}` with header `x-admin-secret`
- `GET /api/health`
