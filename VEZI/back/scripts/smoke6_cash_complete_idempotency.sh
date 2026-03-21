#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-http://localhost:4000/api}"

INTERNAL_KEY="$(grep -E '^INTERNAL_API_KEY=' .env | tail -n1 | cut -d= -f2- | tr -d '\r')"
if [[ -z "${INTERNAL_KEY}" ]]; then
  echo "INTERNAL_API_KEY is missing in .env"; exit 1
fi

pp(){ python3 -m json.tool; }

SUF=$(( (RANDOM % 9000) + 1000 ))
PASS_PHONE="+420700${SUF}01"
PASS_EMAIL="passenger${SUF}@test.local"
DRIVER_PHONE="+420700${SUF}02"
DRIVER_EMAIL="driver${SUF}@test.local"

echo "== health =="; curl -s "$BASE/health" | pp || true; echo

echo "== auth passenger =="
PASS_REQ=$(curl -s -X POST "$BASE/auth/request-otp" -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PASS_PHONE\",\"email\":\"$PASS_EMAIL\",\"role\":\"PASSENGER\"}")
PASS_CODE=$(echo "$PASS_REQ" | python3 -c 'import sys,json; print(json.load(sys.stdin)["devCode"])')
PASS_VERIFY=$(curl -s -X POST "$BASE/auth/verify-otp" -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PASS_PHONE\",\"email\":\"$PASS_EMAIL\",\"role\":\"PASSENGER\",\"code\":\"$PASS_CODE\"}")
PASS_TOKEN=$(echo "$PASS_VERIFY" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["tokens"]["accessToken"])')
PASS_ID=$(echo "$PASS_VERIFY" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["user"]["id"])')
echo "PASS_ID=$PASS_ID"; echo

echo "== auth driver =="
DR_REQ=$(curl -s -X POST "$BASE/auth/request-otp" -H "Content-Type: application/json" \
  -d "{\"phone\":\"$DRIVER_PHONE\",\"email\":\"$DRIVER_EMAIL\",\"role\":\"DRIVER\"}")
DR_CODE=$(echo "$DR_REQ" | python3 -c 'import sys,json; print(json.load(sys.stdin)["devCode"])')
DR_VERIFY=$(curl -s -X POST "$BASE/auth/verify-otp" -H "Content-Type: application/json" \
  -d "{\"phone\":\"$DRIVER_PHONE\",\"email\":\"$DRIVER_EMAIL\",\"role\":\"DRIVER\",\"code\":\"$DR_CODE\"}")
DRIVER_TOKEN=$(echo "$DR_VERIFY" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["tokens"]["accessToken"])')
DRIVER_ID=$(echo "$DR_VERIFY" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["user"]["id"])')
echo "DRIVER_ID=$DRIVER_ID"; echo

echo "== approve docs =="
DL_DOC=$(curl -s -X POST "$BASE/driver/documents" \
  -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"DRIVER_LICENSE","number":"DL-CASH-1","files":[{"name":"dl.jpg"}]}')
DL_ID=$(echo "$DL_DOC" | python3 -c 'import sys,json; print(json.load(sys.stdin)["document"]["id"])')
curl -s -X POST "$BASE/internal/driver-documents/$DL_ID/decision" \
  -H "x-internal-key: $INTERNAL_KEY" -H "Content-Type: application/json" \
  -d '{"decision":"APPROVED","reviewedBy":"smoke","note":"ok"}' >/dev/null

VR_DOC=$(curl -s -X POST "$BASE/driver/documents" \
  -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"VEHICLE_REG","number":"REG-CASH-1","files":[{"name":"reg.jpg"}]}')
VR_ID=$(echo "$VR_DOC" | python3 -c 'import sys,json; print(json.load(sys.stdin)["document"]["id"])')
curl -s -X POST "$BASE/internal/driver-documents/$VR_ID/decision" \
  -H "x-internal-key: $INTERNAL_KEY" -H "Content-Type: application/json" \
  -d '{"decision":"APPROVED","reviewedBy":"smoke","note":"ok"}' >/dev/null
echo "docs ok"; echo

echo "== driver go ONLINE =="; curl -s -X POST "$BASE/driver/availability" \
  -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d '{"online":true,"lat":50.087,"lng":14.421}' | pp; echo

echo "== passenger create ride (CASH) =="
RIDE_CREATE=$(curl -s -X POST "$BASE/passenger/rides" \
  -H "Authorization: Bearer $PASS_TOKEN" -H "Content-Type: application/json" \
  -d '{"pickupAddress":"Test Pickup","pickupLat":50.087,"pickupLng":14.421,"destinationAddress":"Test Dest","destinationLat":50.087,"destinationLng":14.421,"tariffId":"business","paymentMethod":"CASH"}')
echo "$RIDE_CREATE" | pp
RIDE_ID=$(echo "$RIDE_CREATE" | python3 -c 'import sys,json; print(json.load(sys.stdin)["ride"]["id"])')
echo "RIDE_ID=$RIDE_ID"; echo

echo "== driver poll offers (wait up to 10s) =="
FOUND=""
for i in $(seq 1 10); do
  OFFERS=$(curl -s -H "Authorization: Bearer $DRIVER_TOKEN" "$BASE/driver/offers")
  R=$(echo "$OFFERS" | python3 -c 'import sys,json; d=json.load(sys.stdin); o=d.get("offers",[]); print(o[0]["rideId"] if o else "")')
  if [[ -n "$R" ]]; then FOUND="$R"; break; fi
  sleep 1
done
if [[ -z "$FOUND" ]]; then echo "No offers received"; exit 1; fi

curl -s -X POST "$BASE/driver/offers/accept" \
  -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d "{\"rideId\":\"$RIDE_ID\"}" >/dev/null

echo "== driver COMPLETE ride =="
curl -s -X POST "$BASE/rides/$RIDE_ID/status" \
  -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"COMPLETED"}' | pp
echo

echo "== driver COMPLETE ride again (idempotency) =="
curl -s -X POST "$BASE/rides/$RIDE_ID/status" \
  -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"COMPLETED"}' | pp
echo

echo "== passenger cashDebtCents in DB (should be +fare once) =="
docker compose exec -T postgres psql -U vezi -d vezi -c \
"select \"cashDebtCents\" from \"PassengerProfile\" where \"userId\"='$PASS_ID';"
echo

echo "== wallet entries count FARE for this ride (should be 2: driver+platform, not duplicated) =="
docker compose exec -T postgres psql -U vezi -d vezi -c \
"select type, count(*) from \"WalletEntry\" where \"rideId\"='$RIDE_ID' group by type order by type;"
echo

echo "== ridePayment rows for this ride (should exist, kind=RIDE_FARE) =="
docker compose exec -T postgres psql -U vezi -d vezi -c \
"select \"rideId\", method, status, \"amountCents\", meta->>'kind' as kind
 from \"RidePayment\" where \"rideId\"='$RIDE_ID';"
echo

echo "DONE ✅"
