import { RegistrationInput } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const registrate = (RegistrationInput: RegistrationInput) => {
  return fetch(API_URL + "/registration", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(RegistrationInput),
  });
};

const getRegistrationsByEmail = (email: string) => {
  return fetch(API_URL + "/registration/email/" + email, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const precheck = (email: string, sessionIds: string[]) => {
  return fetch(API_URL + "/registration/precheck/" + email, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sessionIds),
  });
};

const cancelRegistration = (token: string, sessionId: string) => {
  return fetch(`${API_URL}/registration/cancel/${sessionId}?token=${token}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
};

const getToken = (): string => {
  const loggedInUserString = sessionStorage.getItem("loggedInUser");
  return loggedInUserString ? JSON.parse(loggedInUserString).token : "";
};

const updateRegistrationField = (
  id: number,
  fieldName: string,
  value: string | number,
) => {
  return fetch(`${API_URL}/registration/${id}/${fieldName}`, {
    method: "PUT",
    headers: {
      "Content-Type": "text/plain",
      Authorization: "Bearer " + getToken(),
    },
    body: String(value),
  });
};

const removeRegistrationFromSession = (id: number, sessionId: string) => {
  return fetch(`${API_URL}/registration/${id}/session/${sessionId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
  });
};

const RegistrationService = {
  registrate,
  getRegistrationsByEmail,
  cancelRegistration,
  precheck,
  updateRegistrationField,
  removeRegistrationFromSession,
};

export default RegistrationService;
