# Deploying the backend (Railway / Render)

This guide explains two common deployment paths for the `packages/backend` Express + Prisma app: using a Docker image (recommended) or using a direct Node deploy. It includes required environment variables and example commands to build/test locally.

## Prerequisites
- GitHub repo connected to Railway or Render (or ability to push Docker images).
- Node 18+/npm or Docker installed for local testing.
- Set up a production database and get `DATABASE_URL`.

## Required environment variables
- `DATABASE_URL` (required)
- `JWT_SECRET` (required)
- `SENDGRID_API_KEY` (optional)
- `ADMIN_EMAIL` (optional)
- `NODE_ENV=production`

## Build & Start commands (recommended for platforms that allow monorepo root settings)
- Build: `npm install && npm run build --workspace=@time-tracking/backend` or when in `packages/backend`: `npm install && npm run build`
- Start: `npm run start` (runs `node dist/index.js`)

## Option A — Docker (recommended)
1. Use the included `packages/backend/Dockerfile`.
2. Build locally:

```bash
# from repo root
docker build -t my-backend:latest -f packages/backend/Dockerfile .
```

3. Run locally:

```bash
docker run -e DATABASE_URL="<your-db>" -e JWT_SECRET="<secret>" -p 3001:3001 my-backend:latest
```

4. Push to registry (Docker Hub / GitHub Container Registry), then tell Railway/Render to deploy that image.

Railway example (image-based):
- Create a new Service -> Container -> provide image URL and set env vars.

Render example (image-based):
- Create a new Web Service -> choose "Docker" -> provide Dockerfile or image.

## Option B — Deploy from repo (Node build)
If you prefer not to use Docker, configure the service in Railway/Render to run from the repo and set the following:
- Build Command: `npm install --workspace=@time-tracking/backend && npm run build --workspace=@time-tracking/backend`
- Start Command: `npm run start --workspace=@time-tracking/backend` or `node packages/backend/dist/index.js`

Note: some platforms detect a monorepo poorly. If the platform cannot run workspace commands, use the Docker approach.

## Prisma & Database
- Ensure `DATABASE_URL` points to your production DB.
- If you rely on prisma migrations / seed, run `npx prisma migrate deploy` or `npx prisma db seed` in your deployment pipeline as needed.

## CORS / Frontend
- Update the frontend `VITE_API_URL` environment variable on Vercel to point to your backend URL.
- Ensure CORS in the backend allows the Vercel domain or remove restrictive settings.

## Local quick test scripts
- See `scripts/docker-build-run.sh` and `scripts/docker-build-run.ps1` for local build/run examples.

---
If you want, I can: (pick one)
- add a `render.yaml` for an automatic Render deploy,
- set up a GitHub Actions workflow to build and push the backend Docker image,
- or convert one backend route to a Vercel Serverless function as a POC.
