export type Role = 'ADMIN' | 'TECHNICIAN' | 'USER';
export type AssetStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE' | 'DECOMMISSIONED';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PeripheralType = 'MONITOR' | 'KEYBOARD' | 'MOUSE' | 'PRINTER' | 'SCANNER' | 'WEBCAM' | 'HEADSET' | 'USB_HUB' | 'DOCKING_STATION' | 'OTHER';
export type EntityType = 'COMPUTER' | 'PERIPHERAL';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Building = {
  id: string;
  name: string;
  address: string | null;
  createdAt: string;
  rooms?: Room[];
  _count?: { rooms: number };
};

export type Room = {
  id: string;
  buildingId: string;
  name: string;
  floor: string | null;
  capacity: number | null;
  createdAt: string;
  computers?: Computer[];
  _count?: { computers: number };
};

export type Computer = {
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
  status: AssetStatus;
  notes: string | null;
  createdAt: string;
  peripherals?: Peripheral[];
  _count?: { peripherals: number };
};

export type Peripheral = {
  id: string;
  computerId: string | null;
  type: PeripheralType;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  status: AssetStatus;
  notes: string | null;
  createdAt: string;
};

export type AssetHistory = {
  id: string;
  entityId: string;
  entityType: EntityType;
  action: string;
  snapshot: Record<string, unknown>;
  diff: Record<string, unknown> | null;
  changedBy: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  changedAt: string;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  reportedById: string;
  assignedToId: string | null;
  computerId: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reportedBy?: Pick<User, 'id' | 'name' | 'email'>;
  assignedTo?: Pick<User, 'id' | 'name' | 'email'> | null;
  computer?: Pick<Computer, 'id' | 'hostname'> | null;
  comments?: TicketComment[];
  _count?: { comments: number };
};

export type TicketComment = {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author?: Pick<User, 'id' | 'name' | 'role'>;
};
