import { User } from "@types";

const getUserByUsername = async (username: string): Promise<User> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/vuln/get/user?username=${username}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }
  );

  if (response.status === 401) {
    throw new Error('401 Unauthorized: you must be logged in'); 
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || 'User not found');
  }

  return await response.json();
};

const VulnerableService = {
  getUserByUsername
};

export default VulnerableService;