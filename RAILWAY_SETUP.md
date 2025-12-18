# Railway Setup Checklist — Backend (packages/backend)

This checklist shows two Railway deployment approaches: using a Docker image (recommended for monorepos) or a direct GitHub repo service.

## Prerequisites
- A Railway account and a Railway project
- GitHub repo connected to Railway (if using repo deploy)
- Production `DATABASE_URL` ready

## Required environment variables (Railway project variables)
- `DATABASE_URL` (required)
- `JWT_SECRET` (required)
- `SENDGRID_API_KEY` (optional)
- `ADMIN_EMAIL` (optional)
- `NODE_ENV=production`

---

## Option A — Deploy via Docker image (recommended)
1. Build locally or in CI and push image to a registry (Docker Hub, GHCR):

```bash
# from repo root
docker build -t ghcr.io/<org>/<repo>/time-tracking-backend:latest -f packages/backend/Dockerfile .
# push
docker push ghcr.io/<org>/<repo>/time-tracking-backend:latest
```

2. In Railway, create a new Service -> Container -> provide the image URL.
3. In Railway service settings, add environment variables listed above.
4. (Optional) Configure health check path `/api/health`.
5. Deploy and verify logs; ensure Prisma can connect to `DATABASE_URL`.

Notes:
- Use CI (GitHub Actions) to build/push images on push to `main`.
- Run Prisma migrations from CI or in a one-off Railway run: `npx prisma migrate deploy`.

---

## Option B — Deploy from GitHub repo (build on Railway)
1. In Railway, create a new Service -> Deploy from GitHub -> select repository.
2. Set the following build & start commands in Railway service settings:

- Build Command:

```
cd packages/backend && npm ci && npm run build
```

- Start Command:

```
cd packages/backend && npm run start
```

3. Add the environment variables to the Railway project (see Required env vars).
4. Add a post-deploy step to run migrations if needed:

```
cd packages/backend && npx prisma migrate deploy
```

Notes:
- Railway will run the build step on their builder; ensure `package.json` scripts and `tsconfig` are correct.
- If builds fail due to monorepo workspace handling, prefer Docker image approach.

---

## Post-deploy checks
- Visit `<service-url>/api/health` and expect JSON status.
- Confirm logs show server listening on assigned port.
- Ensure CORS settings allow your frontend domain.
- Update `VITE_API_URL` in Vercel to point to Railway service URL.

---

## Optional: CI to automate Docker build & push (GitHub Actions)
- Create a workflow that builds the Docker image, logs in to GHCR/Docker Hub, pushes the image, and optionally runs `npx prisma migrate deploy` using a temporary runner.

If you want, I can generate a GitHub Actions workflow to build & push the Docker image and run migrations automatically.
