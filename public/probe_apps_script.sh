#!/usr/bin/env bash
set -eu
endpoint='https://script.google.com/macros/s/AKfycbwwlPYXS2UmhxoBradM9XJHpq2SXrWYeG85Q8ejyKecfXH-DhyhVX_r8Cg3UgcD0F23Gg/exec'
body='{"type":"__non_mutating_probe__"}'
headers=$(mktemp)
body_file=$(mktemp)
curl -sS --max-time 20 -D "$headers" -o /dev/null -X POST "$endpoint" -H 'Content-Type: application/json' --data "$body"
location=$(awk 'tolower($1)=="location:" {sub(/^[^:]*:[[:space:]]*/,""); gsub(/\r/,""); print; exit}' "$headers")
printf 'INITIAL_STATUS='; awk 'NR==1 {print $2}' "$headers"
printf 'REDIRECT_PRESENT=%s\n' "$([ -n "$location" ] && echo yes || echo no)"
curl -sS --max-time 20 -D "$headers" -o "$body_file" -X POST "$location" -H 'Content-Type: application/json' --data "$body"
printf 'FINAL_STATUS='; awk 'NR==1 {print $2}' "$headers"
printf 'FINAL_CONTENT_TYPE='; awk 'tolower($1)=="content-type:" {sub(/^[^:]*:[[:space:]]*/,""); gsub(/\r/,""); print; exit}' "$headers"
printf 'FINAL_BODY='; head -c 500 "$body_file"; printf '\n'
rm -f "$headers" "$body_file"
