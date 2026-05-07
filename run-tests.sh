#!/usr/bin/env bash
# Run AuraMail backend tests from the repo root.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="${ROOT}/app/backend"

cd "${BACKEND}"

if [[ "${1:-}" == "-c" || "${1:-}" == "--cover" ]]; then
	shift
	exec go test ./... -count=1 -cover "$@"
fi

exec go test ./... -count=1 "$@"
