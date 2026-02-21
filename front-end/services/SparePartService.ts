import { SparePart } from "@types";

const getAllSpareParts = async (): Promise<SparePart[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/spareParts`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || "Could not fetch spare parts");
  }

  return response.json();
};

const getSparePartById = async (sparePartId: string): Promise<SparePart> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/spareParts/${sparePartId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || `Failed to fetch spare part with id ${sparePartId}`
    );
  }

  return response.json();
};

const SparePartService = {
  getAllSpareParts,
  getSparePartById,
};

export default SparePartService;
