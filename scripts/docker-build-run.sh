#!/usr/bin/env bash
# Build and run backend container locally
set -e
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

docker build -t time-tracking-backend:local -f packages/backend/Dockerfile "$ROOT_DIR"

echo "Run with: docker run -e DATABASE_URL=\"<your-db>\" -e JWT_SECRET=\"<secret>\" -p 3001:3001 time-tracking-backend:local"
