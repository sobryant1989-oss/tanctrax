#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL-}" ]; then
  echo "DATABASE_URL is not set. Set it before running this script."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
psql "$DATABASE_URL" -f "$SCRIPT_DIR/../db/schema.sql"
