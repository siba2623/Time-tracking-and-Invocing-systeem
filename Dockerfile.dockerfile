FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Replace `npm ci --only=production` (requires package-lock.json)
# with `npm install --omit=dev` so builds succeed without a lockfile.
RUN npm install --omit=dev --no-audit --no-fund

COPY . .

# (retain existing CMD/ENTRYPOINT and other instructions)