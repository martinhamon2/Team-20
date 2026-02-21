const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const getToken = (): string => {
  const loggedInUserString = sessionStorage.getItem("loggedInUser");
  return loggedInUserString ? JSON.parse(loggedInUserString).token : "";
};

const uploadXml = async (file: File): Promise<Event> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/parser/upload`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Upload failed");
  }

  return res.json();
};

const ParserService = { uploadXml };
export default ParserService;
