import { EmailTemplateDTO, EventSetting } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const getToken = (): string => {
  const loggedInUserString = sessionStorage.getItem("loggedInUser");
  return loggedInUserString ? JSON.parse(loggedInUserString).token : "";
};

const getAllEvents = async () => {
  return await fetch(API_URL + "/events", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
  });
};

const updateEvent = async (eventId: string) => {
  return await fetch(API_URL + `/events/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
  });
};

const createEmailTemplate = async (
  emailTemplateDTO: EmailTemplateDTO,
  eventId: string,
) => {
  return await fetch(API_URL + `/events/emailTemplate/${eventId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
    body: JSON.stringify(emailTemplateDTO),
  });
};

const getEventById = async (eventId: string) => {
  return await fetch(API_URL + `/events/${eventId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const getEventBySessionId = async (sessionId: string) => {
  return await fetch(API_URL + `/events/session/${sessionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const getAllEventTemplates = async () => {
  return await fetch(API_URL + `/events/templates`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
  });
};

const updateSettings = async (eventId: string, newSettings: EventSetting) => {
  return await fetch(API_URL + `/events/${eventId}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
    body: JSON.stringify(newSettings),
  });
};

const markAttendance = async (token: string, sessionId: string) => {
  return await fetch(API_URL + `/attendance/mark?sessionId=${sessionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
};

const downloadXML = async (eventId: string) => {
  return await fetch(API_URL + `/events/download/${eventId}`, {
    method: "GET",
  });
};

const eventService = {
  getAllEvents,
  updateEvent,
  getEventById,
  updateSettings,
  getEventBySessionId,
  createEmailTemplate,
  getAllEventTemplates,
  markAttendance,
  downloadXML,
};

export default eventService;
