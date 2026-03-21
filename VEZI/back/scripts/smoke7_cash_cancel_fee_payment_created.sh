#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-http://localhost:4000/api}"

INTERNAL_KEY="$(grep -E '^INTERNAL_API_KEY=' .env | tail -n1 | cut -d= -f2- | tr -d '\r')"
if [[ -z "${INTERNAL_KEY}" ]]; then
  echo "INTERNAL_API_KEY is missing in .env"; exit 1
fi

CANCEL_FEE_CENTS="$(grep -E '^CANCEL_FEE_CENTS=' .env | tail -n1 | cut -d= -f2- | tr -d '\r' || true)"
CANCEL_FEE_CENTS="${CANCEL_FEE_CENTS:-5000}"

pp(){ python3 -m json.tool; }

SUF=$(( (RANDOM % 9000) + 1000 ))
PASS_PHONE="+420700${SUF}01"
PASS_EMAIL="passenger${SUF}@test.local"
DRIVER_PHONE="+420700${SUF}02"
DRIVER_EMAIL="driver${SUF}@test.local"

LAT="50.087"
LNG="14.421"
TARIFF_ID="business"

echo "== health =="
curl -s "$BASE/health" | pp
echo

echo "== auth passenger =="
PASS_REQ="$(curl -s -X POST "$BASE/auth/request-otp" -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PASS_PHONE\",\"email\":\"$PASS_EMAIL\",\"role\":\"PASSENGER\"}")"
echo "$PASS_REQ" | pp
PASS_CODE="$(echo "$PASS_REQ" | python3 -c 'import sys,json; print(json.load(sys.stdin)["devCode"])')"

PASS_VERIFY="$(curl -s -X POST "$BASE/auth/verify-otp" -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PASS_PHONE\",\"email\":\"$PASS_EMAIL\",\"role\":\"PASSENGER\",\"code\":\"$PASS_CODE\"}")"
echo "$PASS_VERIFY" | pp
PASS_TOKEN="$(echo "$PASS_VERIFY" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["tokens"]["accessToken"])')"
PASS_ID="$(echo "$PASS_VERIFY" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["user"]["id"])')"
echo "PASS_ID=$PASS_ID"
echo

echo "== auth driver =="
DR_REQ="$(curl -s -X POST "$BASE/auth/request-otp" -H "Content-Type: application/json" \
  -d "{\"phone\":\"$DRIVER_PHONE\",\"email\":\"$DRIVER_EMAIL\",\"role\":\"DRIVER\"}")"
echo "$DR_REQ" | pp
DR_CODE="$(echo "$DR_REQ" | python3 -c 'import sys,json; print(json.load(sys.stdin)["devCode"])')"

DR_VERIFY="$(curl -s -X POST "$BASE/auth/verify-otp" -H "Content-Type: application/json" \
  -d "{\"phone\":\"$DRIVER_PHONE\",\"email\":\"$DRIVER_EMAIL\",\"role\":\"DRIVER\",\"code\":\"$DR_CODE\"}")"
echo "$DR_VERIFY" | pp
DRIVER_TOKEN="$(echo "$DR_VERIFY" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["tokens"]["accessToken"])')"
DRIVER_ID="$(echo "$DR_VERIFY" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["user"]["id"])')"
echo "DRIVER_ID=$DRIVER_ID"
echo

echo "== driver submit + approve docs (required) =="
DL_DOC="$(curl -s -X POST "$BASE/driver/documents" \
  -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"DRIVER_LICENSE","number":"DL-CASH-CANCEL","files":[{"name":"dl.jpg"}]}')"
echo "$DL_DOC" | pp
DL_ID="$(echo "$DL_DOC" | python3 -c 'import sys,json; print(json.load(sys.stdin)["document"]["id"])')"

curl -s -X POST "$BASE/internal/driver-documents/$DL_ID/decision" \
  -H "x-internal-key: $INTERNAL_KEY" -H "Content-Type: application/json" \
  -d '{"decision":"APPROVED","reviewedBy":"smoke","note":"ok"}' | pp

VR_DOC="$(curl -s -X POST "$BASE/driver/documents" \
  -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"VEHICLE_REG","number":"REG-CASH-CANCEL","files":[{"name":"reg.jpg"}]}')"
echo "$VR_DOC" | pp
VR_ID="$(echo "$VR_DOC" | python3 -c 'import sys,json; print(json.load(sys.stdin)["document"]["id"])')"

curl -s -X POST "$BASE/internal/driver-documents/$VR_ID/decision" \
  -H "x-internal-key: $INTERNAL_KEY" -H "Content-Type: application/json" \
  -d '{"decision":"APPROVED","reviewedBy":"smoke","note":"ok"}' | pp
echo

echo "== ensure Vehicle exists for driver (category=business) =="
DRIVER_PROFILE_ID="$(docker compose exec -T postgres psql -U vezi -d vezi -tA -c \
"select id from \"DriverProfile\" where \"userId\"='$DRIVER_ID';")"
echo "DRIVER_PROFILE_ID=$DRIVER_PROFILE_ID"
VEH_EXISTS="$(docker compose exec -T postgres psql -U vezi -d vezi -tA -c \
"select count(*) from \"Vehicle\" where \"driverId\"='$DRIVER_PROFILE_ID';")"
if [[ "${VEH_EXISTS}" == "0" ]]; then
  VID="veh_${SUF}_$RANDOM"
  docker compose exec -T postgres psql -U vezi -d vezi -c \
"insert into \"Vehicle\"(id,\"driverId\",plate,\"brandModel\",color,category)
 values ('$VID','$DRIVER_PROFILE_ID','1AB${SUF}','Skoda Octavia','Black','business');"
fi
echo "vehicle ok"
echo

echo "== driver go ONLINE (MUST include lat/lng) =="
curl -s -X POST "$BASE/driver/availability" \
  -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d "{\"online\":true,\"lat\":$LAT,\"lng\":$LNG}" | pp
echo

echo "== CLEANUP: set OTHER drivers OFFLINE in DB =="
docker compose exec -T postgres psql -U vezi -d vezi -c \
"update \"DriverProfile\" set status='OFFLINE', \"isBusy\"=false where \"userId\" <> '$DRIVER_ID';" >/dev/null
echo "cleanup ok"
echo

echo "== FORCE Redis GEO: reset + add this driver =="
docker compose exec -T redis redis-cli DEL drivers:online >/dev/null
docker compose exec -T redis redis-cli GEOADD drivers:online "$LNG" "$LAT" "driver:$DRIVER_ID" >/dev/null
docker compose exec -T redis redis-cli GEOPOS drivers:online "driver:$DRIVER_ID"
echo

echo "== passenger create ride (CASH) =="
RIDE_CREATE="$(curl -s -X POST "$BASE/passenger/rides" \
  -H "Authorization: Bearer $PASS_TOKEN" -H "Content-Type: application/json" \
  -d "{\"pickupAddress\":\"Test Pickup\",\"pickupLat\":$LAT,\"pickupLng\":$LNG,\"destinationAddress\":\"Test Dest\",\"destinationLat\":$LAT,\"destinationLng\":$LNG,\"tariffId\":\"$TARIFF_ID\",\"paymentMethod\":\"CASH\"}")"
echo "$RIDE_CREATE" | pp
RIDE_ID="$(echo "$RIDE_CREATE" | python3 -c 'import sys,json; print(json.load(sys.stdin)["ride"]["id"])')"
echo "RIDE_ID=$RIDE_ID"
echo

echo "== driver poll offers for THIS ride (wait up to 25s) =="
FOUND=""
for i in $(seq 1 25); do
  OFFERS="$(curl -s -H "Authorization: Bearer $DRIVER_TOKEN" "$BASE/driver/offers")"
  RID="$(echo "$OFFERS" | python3 -c "import sys,json; d=json.load(sys.stdin); o=d.get('offers',[]); 
print(next((x.get('rideId') for x in o if x.get('rideId')=='$RIDE_ID'), ''))")"
  if [[ -n "$RID" ]]; then
    echo "$OFFERS" | pp
    FOUND="1"
    break
  fi
  sleep 1
done
if [[ -z "$FOUND" ]]; then
  echo "No offer received for RIDE_ID=$RIDE_ID"; exit 1
fi
echo

echo "== driver accept offer =="
curl -s -X POST "$BASE/driver/offers/accept" \
  -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d "{\"rideId\":\"$RIDE_ID\"}" | pp
echo

echo "== driver set status DRIVER_ARRIVING =="
curl -s -X POST "$BASE/rides/$RIDE_ID/status" \
  -H "Authorization: Bearer $DRIVER_TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"DRIVER_ARRIVING"}' | pp
echo

echo "== passenger cancel (CASH -> debt grows; payment status CREATED kind=CANCEL_FEE) =="
curl -s -X POST "$BASE/rides/$RIDE_ID/cancel" \
  -H "Authorization: Bearer $PASS_TOKEN" -H "Content-Type: application/json" \
  -d '{"reason":"smoke cash cancel after arriving"}' | pp
echo

echo "== passenger cashDebtCents in DB (should be +CANCEL_FEE_CENTS=${CANCEL_FEE_CENTS}) =="
docker compose exec -T postgres psql -U vezi -d vezi -c \
"select \"cashDebtCents\" from \"PassengerProfile\" where \"userId\"='$PASS_ID';"
echo

echo "== ridePayment in DB (should exist, CASH, status=CREATED, kind=CANCEL_FEE) =="
docker compose exec -T postgres psql -U vezi -d vezi -c \
"select \"rideId\", method, status, \"amountCents\", (meta->>'kind') as kind
 from \"RidePayment\" where \"rideId\"='$RIDE_ID';"
echo

echo "DONE ✅"
