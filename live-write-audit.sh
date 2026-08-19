#!/usr/bin/env bash
set -euo pipefail
BASE='https://script.google.com/macros/s/AKfycbwwlPYXS2UmhxoBradM9XJHpq2SXrWYeG85Q8ejyKecfXH-DhyhVX_r8Cg3UgcD0F23Gg/exec'
# Invalid action is intentionally non-mutating; it verifies the live endpoint rejects
# unsupported writes instead of returning a false success response.
PAYLOAD='{"type":"audit_invalid_non_mutating_action","audit_label":"JYOTI_PORTAL_AUDIT_NO_WRITE"}'
HEADERS=$(mktemp)
curl -sS -D "$HEADERS" -o /tmp/jyoti-live-write-body.txt -X POST "$BASE" -H 'Content-Type: application/json' --data-raw "$PAYLOAD"
LOCATION=$(awk 'BEGIN{IGNORECASE=1} /^location:/{sub(/\r$/, ""); sub(/^location:[[:space:]]*/, ""); print; exit}' "$HEADERS")
printf '%s\n' '--- initial response headers ---'
cat "$HEADERS"
if [ -n "$LOCATION" ]; then
  printf '%s\n' '--- redirected response ---'
  curl -sS -X POST "$LOCATION" -H 'Content-Type: application/json' --data-raw "$PAYLOAD"
else
  printf '%s\n' '--- response body ---'
  cat /tmp/jyoti-live-write-body.txt
fi
rm -f "$HEADERS" /tmp/jyoti-live-write-body.txt
