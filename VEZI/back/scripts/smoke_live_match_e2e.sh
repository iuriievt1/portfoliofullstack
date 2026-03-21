#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-http://localhost:4000/api}"

DR_PHONE="${DR_PHONE:-+420700000001}"
DR_EMAIL="${DR_EMAIL:-driver000001@test.local}"

PA_PHONE="${PA_PHONE:-+420700000002}"
PA_EMAIL="${PA_EMAIL:-passenger000002@test.local}"

LAT="${LAT:-50.087}"
LNG="${LNG:-14.421}"

echo "BASE=$BASE"

echo "== DRIVER auth =="
DR_REQ=$(curl -s -X POST "$BASE/auth/request-otp" -H "Content-Type: application/json" \
  -d "{\"role\":\"DRIVER\",\"phone\":\"$DR_PHONE\",\"email\":\"$DR_EMAIL\"}")
DR_CODE=$(echo "$DR_REQ" | python3 -c 'import sys,json; print(json.load(sys.stdin)["devCode"])')

DR_VER=$(curl -s -X POST "$BASE/auth/verify-otp" -H "Content-Type: application/json" \
  -d "{\"role\":\"DRIVER\",\"phone\":\"$DR_PHONE\",\"email\":\"$DR_EMAIL\",\"code\":\"$DR_CODE\"}")

DRIVER_TOKEN=$(echo "$DR_VER" | python3 -c 'import sys,json; print(json.load(sys.stdin)["tokens"]["accessToken"])')
DRIVER_USER_ID=$(echo "$DR_VER" | python3 -c 'import sys,json; print(json.load(sys.stdin)["user"]["id"])')

echo "DRIVER_USER_ID=$DRIVER_USER_ID"

echo "== DRIVER go ONLINE =="
curl -s -X POST "$BASE/driver/availability" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"online\":true,\"lat\":$LAT,\"lng\":$LNG}" | cat
echo

echo "== start DRIVER heartbeat (background) =="
( while true; do
    curl -s -X POST "$BASE/driver/location" \
      -H "Authorization: Bearer $DRIVER_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"lat\":$LAT,\"lng\":$LNG}" >/dev/null || true
    sleep 20
  done ) &
HB_PID=$!

cleanup() {
  kill "$HB_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "== check TTL =="
docker compose exec -T redis redis-cli TTL "drivers:online:ttl:$DRIVER_USER_ID" || true

echo "== PASSENGER auth =="
PA_REQ=$(curl -s -X POST "$BASE/auth/request-otp" -H "Content-Type: application/json" \
  -d "{\"role\":\"PASSENGER\",\"phone\":\"$PA_PHONE\",\"email\":\"$PA_EMAIL\"}")
PA_CODE=$(echo "$PA_REQ" | python3 -c 'import sys,json; print(json.load(sys.stdin)["devCode"])')

PA_VER=$(curl -s -X POST "$BASE/auth/verify-otp" -H "Content-Type: application/json" \
  -d "{\"role\":\"PASSENGER\",\"phone\":\"$PA_PHONE\",\"email\":\"$PA_EMAIL\",\"code\":\"$PA_CODE\"}")

PASS_TOKEN=$(echo "$PA_VER" | python3 -c 'import sys,json; print(json.load(sys.stdin)["tokens"]["accessToken"])')
PASS_USER_ID=$(echo "$PA_VER" | python3 -c 'import sys,json; print(json.load(sys.stdin)["user"]["id"])')

echo "PASS_USER_ID=$PASS_USER_ID"

echo "== PASSENGER create ride =="
RIDE_RES=$(curl -s -X POST "$BASE/passenger/rides" \
  -H "Authorization: Bearer $PASS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"pickupAddress\":\"Test Pickup\",
    \"pickupLat\":$LAT,
    \"pickupLng\":$LNG,
    \"destinationAddress\":\"Test Dest\",
    \"destinationLat\":$LAT,
    \"destinationLng\":$LNG,
    \"tariffId\":\"business\",
    \"paymentMethod\":\"CASH\"
  }")

echo "$RIDE_RES"
RIDE_ID=$(echo "$RIDE_RES" | python3 -c 'import sys,json; print(json.load(sys.stdin)["ride"]["id"])')
echo "RIDE_ID=$RIDE_ID"

echo "== wait offers (up to 25s) =="
deadline=$((SECONDS+25))
while [ $SECONDS -lt $deadline ]; do
  OFF=$(curl -s -X GET "$BASE/driver/offers" -H "Authorization: Bearer $DRIVER_TOKEN")
  cnt=$(echo "$OFF" | python3 -c 'import sys,json; print(len(json.load(sys.stdin).get("offers", [])))')
  if [ "$cnt" != "0" ]; then
    echo "$OFF"
    echo "DONE ✅ offer received"
    exit 0
  fi
  sleep 1
done

echo "FAIL ❌ no offers"
exit 1
