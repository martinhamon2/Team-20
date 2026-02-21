import { Park } from "@types";

const getAllParks = async (): Promise<Park[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parks`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || "Could not fetch parks");
  }

  return response.json();
};

const ParkService = {
  getAllParks,
};

export default ParkService;
