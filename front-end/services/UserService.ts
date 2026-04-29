import { User } from "@types";

const authenticate = async (user: User): Promise<User> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
    credentials: 'include', 
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || 'Authentication failed');
  }

  return await response.json();
};

const logout = async (): Promise<void> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Logout failed');
    }
};

const signup = async (user: User): Promise<User> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
    credentials: 'include', 
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || 'Signup failed');
  }

  return await response.json();
};

const getMe = async (): Promise<User> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
    credentials: 'include', 
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || 'getMe failed');
  }

  return await response.json();
};

const UserService = {
  authenticate,
  logout,
  signup,
  getMe,
};

export default UserService;