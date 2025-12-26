// src/models/ride.model.ts
import { randomUUID } from "crypto";

export type RideStatus =
  | "searching_driver"
  | "driver_assigned"
  | "on_way_to_pickup"
  | "in_progress"
  | "completed"
  | "canceled";

export interface Ride {
  id: string;

  passengerId: string;
  driverId?: string | null;

  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;

  destinationAddress: string;
  destinationLat: number;
  destinationLng: number;

  carType?: string;

  status: RideStatus;

  createdAt: string;
  updatedAt: string;
}

const rides: Ride[] = [];

const TERMINAL: RideStatus[] = ["completed", "canceled"];
const ACTIVE: RideStatus[] = ["searching_driver", "driver_assigned", "on_way_to_pickup", "in_progress"];

function nowISO() {
  return new Date().toISOString();
}

function isTerminal(status: RideStatus) {
  return TERMINAL.includes(status);
}

export function createRide(params: {
  passengerId: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  destinationAddress: string;
  destinationLat: number;
  destinationLng: number;
  carType?: string;
}): Ride {
  // Один пассажир = одна активная поездка (чтобы не ломать state и не плодить баги)
  const existing = findActiveRideForPassenger(params.passengerId);
  if (existing) {
    // Возвращаем существующую (или можешь кидать ошибку — но это проще для MVP)
    return existing;
  }

  const ride: Ride = {
    id: randomUUID(),
    passengerId: params.passengerId,
    driverId: null,

    pickupAddress: params.pickupAddress,
    pickupLat: params.pickupLat,
    pickupLng: params.pickupLng,

    destinationAddress: params.destinationAddress,
    destinationLat: params.destinationLat,
    destinationLng: params.destinationLng,

    carType: params.carType,

    status: "searching_driver",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  rides.unshift(ride);
  return ride;
}

export function findRideById(id: string): Ride | undefined {
  return rides.find((r) => r.id === id);
}

export function findRidesForPassenger(passengerId: string): Ride[] {
  return rides.filter((r) => r.passengerId === passengerId);
}

export function findActiveRideForPassenger(passengerId: string): Ride | undefined {
  return rides.find((r) => r.passengerId === passengerId && ACTIVE.includes(r.status));
}

// ✅ Для driver app (если у тебя уже есть отдельная модель — можно не использовать,
// но это правильная логика для синхронизации)
export function findAvailableRidesForDriver(): Ride[] {
  // Только реально доступные
  return rides.filter((r) => r.status === "searching_driver");
}

export function findActiveRideForDriver(driverId: string): Ride | undefined {
  return rides.find((r) => r.driverId === driverId && ACTIVE.includes(r.status));
}

export function acceptRideByDriver(rideId: string, driverId: string): Ride | null {
  const ride = findRideById(rideId);
  if (!ride) return null;

  // Нельзя принять терминальную
  if (isTerminal(ride.status)) return null;

  // Принимать можно ТОЛЬКО из searching_driver
  if (ride.status !== "searching_driver") return null;

  // Если уже кем-то назначена (на всякий)
  if (ride.driverId) return null;

  ride.driverId = driverId;
  ride.status = "driver_assigned";
  ride.updatedAt = nowISO();
  return ride;
}

// Сдвиг статуса водителем по реальной цепочке
export function driverMoveRideToNextStatus(rideId: string, driverId: string): Ride | null {
  const ride = findRideById(rideId);
  if (!ride) return null;
  if (!ride.driverId || ride.driverId !== driverId) return null;
  if (isTerminal(ride.status)) return null;

  const next: Record<RideStatus, RideStatus> = {
    searching_driver: "searching_driver", // водитель не должен двигать из searching
    driver_assigned: "on_way_to_pickup",
    on_way_to_pickup: "in_progress",
    in_progress: "completed",
    completed: "completed",
    canceled: "canceled",
  };

  const to = next[ride.status];
  if (to === ride.status) return null;

  ride.status = to;
  ride.updatedAt = nowISO();
  return ride;
}

// ✅ Cancel пассажиром — ТОЛЬКО пока не началась поездка
export function cancelRideById(rideId: string, passengerId: string): Ride | null {
  const ride = findRideById(rideId);
  if (!ride) return null;
  if (ride.passengerId !== passengerId) return null;

  if (isTerminal(ride.status)) return null;

  // Разрешаем отменить пока водитель ещё не начал движение/поездку
  if (ride.status === "on_way_to_pickup" || ride.status === "in_progress") {
    return null;
  }

  ride.status = "canceled";
  ride.updatedAt = nowISO();
  return ride;
}

// DEV: кнопка теста у пассажира — двигаем цепочку, но аккуратно
export function moveRideToNextStatus(rideId: string): Ride | null {
  const ride = findRideById(rideId);
  if (!ride) return null;
  if (isTerminal(ride.status)) return null;

  const next: Record<RideStatus, RideStatus> = {
    searching_driver: "driver_assigned",
    driver_assigned: "on_way_to_pickup",
    on_way_to_pickup: "in_progress",
    in_progress: "completed",
    completed: "completed",
    canceled: "canceled",
  };

  ride.status = next[ride.status];
  ride.updatedAt = nowISO();
  return ride;
}
