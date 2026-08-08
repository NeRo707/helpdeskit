
export const Role = {
  ADMIN: "ADMIN",
  TECHNICIAN: "TECHNICIAN",
  USER: "USER",
} as const;
export type TRole = (typeof Role)[keyof typeof Role];

export type TAssetStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "UNDER_MAINTENANCE"
  | "DECOMMISSIONED";
export type TTicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "RESOLVED"
  | "CLOSED";
export type TTicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TPeripheralType =
  | "MONITOR"
  | "KEYBOARD"
  | "MOUSE"
  | "PRINTER"
  | "SCANNER"
  | "WEBCAM"
  | "HEADSET"
  | "USB_HUB"
  | "DOCKING_STATION"
  | "OTHER";
export type TEntityType = "COMPUTER" | "PERIPHERAL";
export type TNetworkDeviceType =
  | "SWITCH"
  | "ROUTER"
  | "FIREWALL"
  | "ACCESS_POINT"
  | "MODEM"
  | "OTHER";

export type TUser = {
  id: string;
  name: string;
  email: string;
  role: TRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TBuilding = {
  id: string;
  name: string;
  address: string | null;
  createdAt: string;
  rooms?: TRoom[];
  _count?: { rooms: number };
};

export type TRoom = {
  id: string;
  buildingId: string;
  name: string;
  floor: string | null;
  createdAt: string;
  computers?: TComputer[];
  _count?: { computers: number };
};

export type TComputer = {
  id: string;
  roomId: string;
  hostname: string;
  ipAddress: string | null;
  macAddress: string | null;
  os: string | null;
  osVersion: string | null;
  cpu: string | null;
  ramGb: number | null;
  storageGb: number | null;
  purchaseDate: string | null;
  warrantyEnd: string | null;
  status: TAssetStatus;
  notes: string | null;
  createdAt: string;
  peripherals?: TPeripheral[];
  _count?: { peripherals: number };
};

export type TPeripheral = {
  id: string;
  computerId: string | null;
  type: TPeripheralType;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  status: TAssetStatus;
  notes: string | null;
  createdAt: string;
};

export type TNetworkDevice = {
  id: string;
  roomId: string | null;
  type: TNetworkDeviceType;
  hostname: string | null;
  ipAddress: string | null;
  macAddress: string | null;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  ports: number | null;
  status: TAssetStatus;
  purchaseDate: string | null;
  warrantyEnd: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TAssetHistory = {
  id: string;
  entityId: string;
  entityType: TEntityType;
  action: string;
  snapshot: Record<string, unknown>;
  diff: Record<string, unknown> | null;
  changedBy: Pick<TUser, "id" | "name" | "email" | "role">;
  changedAt: string;
};

export type TTicket = {
  id: string;
  title: string;
  description: string;
  status: TTicketStatus;
  priority: TTicketPriority;
  reportedById: string;
  assignedToId: string | null;
  computerId: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reportedBy?: Pick<TUser, "id" | "name" | "email">;
  assignedTo?: Pick<TUser, "id" | "name" | "email"> | null;
  computer?: Pick<TComputer, "id" | "hostname"> | null;
  comments?: TTicketComment[];
  _count?: { comments: number };
};

export type TTicketComment = {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author?: Pick<TUser, "id" | "name" | "role">;
};
