import { Attraction, AttractionInput } from "@types";

const getAllAttractions = async (): Promise<Attraction[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/attractions`,
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
    throw new Error(error?.message || "Could not fetch attractions");
  }

  return response.json();
};

const getAttractionById = async (attractionId: string): Promise<Attraction> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/attractions/${attractionId}`,
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
      error?.message || `Failed to fetch attraction with id ${attractionId}`
    );
  }

  return response.json();
};

const addSparePartToAttraction = async (
  attractionId: number,
  sparePartId: number
): Promise<void> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/attractions/${attractionId}/spareparts/${sparePartId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({}),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || "Could not add spare part");
  }
};

const removeSparePartFromAttraction = async (
  attractionId: number,
  sparePartId: number
): Promise<void> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/attractions/${attractionId}/spareparts/${sparePartId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || "Could not remove spare part");
  }
};

const changeAttractionStatus = async (id: number): Promise<Attraction> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/attractions/${id}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || "Could not update attraction status");
  }

  return response.json();
};

const createAttraction = async (
  input: AttractionInput
): Promise<Attraction> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/attractions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || "Could not create the attraction");
  }

  return response.json();
};

const updateAttraction = async (
  id: number,
  input: Partial<AttractionInput>
): Promise<Attraction> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/attractions/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || "Could not update attraction");
  }
  return response.json();
};

const AttractionService = {
  getAllAttractions,
  getAttractionById,
  addSparePartToAttraction,
  removeSparePartFromAttraction,
  changeAttractionStatus,
  createAttraction,
  updateAttraction,
};

export default AttractionService;
