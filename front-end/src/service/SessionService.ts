const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const getToken = (): string => {
  const loggedInUserString = sessionStorage.getItem("loggedInUser");
  return loggedInUserString ? JSON.parse(loggedInUserString).token : "";
};

const updateSession = async (sessionId: string) => {
  return await fetch(API_URL + `/sessions/${sessionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
  });
};

const sessionService = {
  updateSession,
};

export default sessionService;
