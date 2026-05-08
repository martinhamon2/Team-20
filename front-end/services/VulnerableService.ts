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

const validateUrl = async (url: string): Promise<string> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vuln/url-validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: url,
  });
  return response.text();
};

const VulnerableService = {
  getUserByUsername,
  validateUrl,
};

export default VulnerableService;