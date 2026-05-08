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

const uploadAvatar = async (username: string, avatarUrl: string): Promise<{ message: string; path?: string }> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${encodeURIComponent(username)}/avatar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ avatarUrl }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || 'Failed to update avatar');
  }
  return data;
};

const getAvatarUrl = (username: string): string =>
  `${process.env.NEXT_PUBLIC_API_URL}/users/${encodeURIComponent(username)}/avatar`;

const changePassword = async (username: string, currentPassword: string, newPassword: string): Promise<void> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${encodeURIComponent(username)}/password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || 'Failed to change password');
  }
};

const UserService = {
  authenticate,
  logout,
  signup,
  uploadAvatar,
  getAvatarUrl,
  changePassword,
};

export default UserService;