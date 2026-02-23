// ============================================
// VEHICLE STATUS
// ============================================

export const VEHICLE_STATUS = {
  AVAILABLE: "available",
  SOLD: "sold",
  RESERVED: "reserved",
  MAINTENANCE: "maintenance",
} as const;

export type VehicleStatus =
  (typeof VEHICLE_STATUS)[keyof typeof VEHICLE_STATUS];

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  [VEHICLE_STATUS.AVAILABLE]: "Disponível",
  [VEHICLE_STATUS.SOLD]: "Vendido",
  [VEHICLE_STATUS.RESERVED]: "Reservado",
  [VEHICLE_STATUS.MAINTENANCE]: "Em manutenção",
};

export const VEHICLE_TYPES = {
  CAR: "car",
  MOTORCYCLE: "motorcycle",
  TRUCK: "truck",
  VAN: "van",
  SUV: "suv",
} as const;

export type VehicleType = (typeof VEHICLE_TYPES)[keyof typeof VEHICLE_TYPES];

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  [VEHICLE_TYPES.CAR]: "Carro",
  [VEHICLE_TYPES.MOTORCYCLE]: "Moto",
  [VEHICLE_TYPES.TRUCK]: "Caminhão",
  [VEHICLE_TYPES.VAN]: "Van",
  [VEHICLE_TYPES.SUV]: "SUV",
};