export type LoginInput = {
  username: string;
  password: string;
};

export enum Role {
  ADMIN = "admin",
}

export type User = {
  id: number;
  username: string;
  email: string;
  role: Role;
};

export type RegistrationInput = {
  sessionIds: (string | undefined)[];
  firstName: string;
  lastName: string;
  address: string;
  county: string;
  postcode: number | "";
  phoneNumber: string;
  email: string;
  school?: string;
  correspondenceLanguage: string;
  startYear?: number;
  dateOfBirth: string;
};

export type Event = {
  id?: string;
  type?: string;
  language?: string;
  description?: string;
  beginDate?: string | number | Date;
  endDate?: string | number | Date;
  sessions?: Session[];
  eventSetting?: EventSetting;
};

export type Session = {
  id?: string;
  description?: string;
  type?: string;
  category?: string;
  beginDate?: Date | string;
  endDate?: Date | string;
  beginTime?: string;
  endTime?: string;
  location?: string;
  mapUrl?: string;
  maxCapacity?: number;
  sessionSetting?: SessionSetting;
  registrations?: Registration[];
};

export type Registration = {
  id?: number;
  firstName?: string;
  lastName?: string;
  address?: string;
  county?: string;
  postcode?: number;
  phoneNumber?: string;
  email?: string;
  school?: string;
  correspondenceLanguage?: string;
  dateOfBirth?: string;
  startYear?: number;
  isPresent?: boolean;
};

export type EventSetting = {
  id?: number;
  sortOrder?: string;
  sortField?: string;
  moveFullToBack?: boolean;
  movePastToBack?: boolean;
  validateOverlapping?: boolean;
  canUnsubscribe?: boolean;
  phoneFormat?: string;
  active?: boolean;
  templateName?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

export type EmailTemplateDTO = {
  templateName: string;
  content: string;
  subject: string;
};

export type EmailTemplate = {
  id?: number;
  templateName?: string;
  subject?: string;
  content?: string;
};

export type SessionSetting = {
  id?: number;
  active?: boolean;
};

export type StatusMessage = {
  message: string;
  type: "error" | "success";
};
