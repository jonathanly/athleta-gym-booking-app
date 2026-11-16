#!/usr/bin/env bash
set -euo pipefail

# Hosted jobs have isolated Docker daemons. Never reuse the persisted demo volume.
docker info >/dev/null
name="athleta-feature-${BUILDKITE_JOB_ID:?}"

cleanup() {
  local status=$?
  if [ "$status" -ne 0 ]; then
    docker logs "$name" || true
  fi
  docker rm --force --volumes "$name" >/dev/null 2>&1 || true
  return "$status"
}
trap cleanup EXIT

docker run --detach \
  --name "$name" \
  --publish 127.0.0.1::5432 \
  --env POSTGRES_USER=athleta \
  --env POSTGRES_PASSWORD=athleta-ci \
  --env POSTGRES_DB=postgres \
  --tmpfs /var/lib/postgresql/data:rw \
  postgres:17-alpine

ready=false
for ((attempt = 0; attempt < 60; attempt++)); do
  if docker exec "$name" \
    pg_isready --host=127.0.0.1 --username=athleta --dbname=postgres \
    >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done
if [ "$ready" != true ]; then
  echo "PostgreSQL did not become ready within 60 seconds" >&2
  exit 1
fi

address=$(docker port "$name" 5432/tcp)
port=${address##*:}
export TEST_DATABASE_ADMIN_URL="postgres://athleta:athleta-ci@127.0.0.1:${port}/postgres"

npm run test:feature -- \
  --shard="$((BUILDKITE_PARALLEL_JOB + 1))/${BUILDKITE_PARALLEL_JOB_COUNT}" \
  --workers=1
