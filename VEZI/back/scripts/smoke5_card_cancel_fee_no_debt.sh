#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-http://localhost:4000/api}"
INTERNAL_KEY="$(grep -E '^INTERNAL_API_KEY=' .env | tail -n1 | cut -d= -f2- | tr -d '\r')"
pp(){ python3 -m json.tool; }

SUF=$(( (RANDOM % 9000) + 1000 ))
PASS_PHONE="+420700${SUF}01"
PASS_EMAIL="passenger${SUF}@test.local"
DRIVER_PHONE="+420700${SUF}02"
DRIVER_EMAIL="driver${SUF}@test.local"

PASS_REQ=$(curl -s -X POST "$BASE/auth/request-otp" -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PASS_PHONE\",\"email\":\"$PASS_EMAIL\",\"role\":\"PASSENGER\"}")
PASS_CODE=$(echo "$PASS_REQ" | python3 -c 'import sys,json; print(json.load(sys.stdin)["devCode"])')
PASS_VERIFY=$(curl -s -X POST "$BASE/auth/verify-otp" -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PASS_PHONE\",\"email\":\"$PASS_EMAIL\",\"role\":\"PASSENGER\",\"code\":\"$PASS_CODE\"}")
PASS_TOKEN=$(echo "$PASS_VERIFY" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["tokens"]["accessToken"])')
PASS_ID=$(echo "$PASS_VERIFY" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["user"]["id"])')

DR_REQ=$(curl -s -X POST "$BASE/auth/request-otp" -H "Content-Type: application/json" \
  -d "{\"phone\":\"$DRIVER_PHONE\",\"email\":\"$DRIVER_EMAIL\",\"role\":\"DRIVER\"}")
DR_CODE=$(echo "$DR_REQ" | python3 -c 'import sys,json; print(json.load(sys.stdin)["devCode"])')
DR_VERIFY=$(curl -s -X POST "$BASE/auth/verify-otp" -H "Content-Type: application/json" \
  -d "{\"phone\":\"$DRIVER_PHONE\",\"email\":\"$DRIVER_EMAIL\",\"role\":\"DRIVER\",\"code\":\"$DR_CODE\"}")
DRIVER_TOKEN=$(echo "$DR_VERIFY" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["tokens"]["accessToken"])')

DL_DOC=$(curl -s -X POST "$BASE/driver/documents" -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"DRIVER_LICENSE","number":"DL-CARD-CANCEL","files":[{"name":"dl.jpg"}]}')
DL_ID=$(echo "$DL_DOC" | python3 -c 'import sys,json; print(json.load(sys.stdin)["document"]["id"])')
curl -s -X POST "$BASE/internal/driver-documents/$DL_ID/decision" -H "x-internal-key: $INTERNAL_KEY" -H "Content-Type: application/json" \
  -d '{"decision":"APPROVED","reviewedBy":"smoke","note":"ok"}' | pp

VR_DOC=$(curl -s -X POST "$BASE/driver/documents" -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"VEHICLE_REG","number":"REG-CARD-CANCEL","files":[{"name":"reg.jpg"}]}')
VR_ID=$(echo "$VR_DOC" | python3 -c 'import sys,json; print(json.load(sys.stdin)["document"]["id"])')
curl -s -X POST "$BASE/internal/driver-documents/$VR_ID/decision" -H "x-internal-key: $INTERNAL_KEY" -H "Content-Type: application/json" \
  -d '{"decision":"APPROVED","reviewedBy":"smoke","note":"ok"}' | pp

curl -s -X POST "$BASE/driver/availability" -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d '{"online":true,"lat":50.087,"lng":14.421}' | pp

RIDE_CREATE=$(curl -s -X POST "$BASE/passenger/rides" -H "Authorization: Bearer $PASS_TOKEN" -H "Content-Type: application/json" \
  -d '{"pickupAddress":"Test Pickup","pickupLat":50.087,"pickupLng":14.421,"destinationAddress":"Test Dest","destinationLat":50.087,"destinationLng":14.421,"tariffId":"business","paymentMethod":"CARD"}')
echo "$RIDE_CREATE" | pp
RIDE_ID=$(echo "$RIDE_CREATE" | python3 -c 'import sys,json; print(json.load(sys.stdin)["ride"]["id"])')

for i in $(seq 1 10); do
  OFFERS=$(curl -s -H "Authorization: Bearer $DRIVER_TOKEN" "$BASE/driver/offers")
  R=$(echo "$OFFERS" | python3 -c 'import sys,json; d=json.load(sys.stdin); o=d.get("offers",[]); print(o[0]["rideId"] if o else "")')
  if [[ -n "$R" ]]; then break; fi
  sleep 1
done

curl -s -X POST "$BASE/driver/offers/accept" -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d "{\"rideId\":\"$RIDE_ID\"}" | pp

curl -s -X POST "$BASE/rides/$RIDE_ID/status" -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"DRIVER_ARRIVING"}' | pp

CANCEL=$(curl -s -X POST "$BASE/rides/$RIDE_ID/cancel" -H "Authorization: Bearer $PASS_TOKEN" -H "Content-Type: application/json" \
  -d '{"reason":"smoke card cancel after arriving"}')
echo "$CANCEL" | pp

echo "== passenger cashDebtCents should stay 0 =="
docker compose exec -T postgres psql -U vezi -d vezi -c \
"select \"cashDebtCents\" from \"PassengerProfile\" where \"userId\"='$PASS_ID';"

echo "== ridePayment should be CAPTURED kind=CANCEL_FEE =="
docker compose exec -T postgres psql -U vezi -d vezi -c \
"select \"rideId\", method, status, \"amountCents\", (meta->>'kind') as kind from \"RidePayment\" where \"rideId\"='$RIDE_ID';"

echo "DONE ✅"
