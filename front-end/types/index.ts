export enum Status {
  UP = "UP",
  DOWN = "DOWN",
  MAINTENANCE = "MAINTENANCE",
}

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  STAFF = "STAFF",
}

export type Park = {
  id: number;
  name: string;
};

export type Attraction = {
  id: number;
  name?: string;
  park: Park;
  type?: string;
  status?: Status | string;
  waitTime?: string;
  minHeight?: number;
  minAge?: number;
  accessibility?: boolean;
  spareParts?: SparePart[];
};

export type AttractionInput = {
  name: string;
  type: string;
  waitTime?: string;
  accessibility: boolean;
  minAge: number;
  minHeight: number;
  parkId: number;
  sparePartIds: number[];
};

export type User = {
  username: string;
  password: string;
  role: Role;
  avatarUrl?: string;
};

export type StatusMessage = {
  message: string;
  type: "error" | "success";
};

export type SparePart = {
  id: number;
  name?: string;
  type?: string;
  attractions?: Attraction[];
};
