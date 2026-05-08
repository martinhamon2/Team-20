"use client";

import React, { useContext, useState } from "react";
import { AuthContext } from "@context/AuthContext";
import { useRouter } from "next/navigation";
import UserService from "@services/UserService";

export default function ProfilePage() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("no auth context");
  const { user, isLoading } = context;
  const router = useRouter();

  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarStatus, setAvatarStatus] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (isLoading) return <p>Loading…</p>;

  if (!user) {
    router.push("/login");
    return null;
  }

  const avatarSrc = UserService.getAvatarUrl(user.username);

  const handleAvatarUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAvatarStatus(null);
    setAvatarError(null);
    try {
      await UserService.uploadAvatar(user.username, avatarUrl);
      setAvatarStatus("Avatar updated successfully!");
      setAvatarUrl("");
    } catch (err) {
      setAvatarError((err as Error).message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    setPasswordError(null);

    if (newPassword.length < 5) {
      setPasswordError("New password must be at least 5 characters");
      return;
    }
    if (newPassword !== newPassword2) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await UserService.changePassword(user.username, currentPassword, newPassword);
      setPasswordStatus("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setNewPassword2("");
    } catch (err) {
      setPasswordError((err as Error).message);
    }
  };

  return (
    <main className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="pageTitle mb-6">My Profile</h1>

      <div className="p-6 gap-10 border rounded-xl shadow-sm grid md:grid-cols-2 items-end">


        <form onSubmit={handleAvatarUpdate} className="grid gap-3 w-full">

          <div className="w-32 h-32 rounded-full overflow-hidden border-2 mx-auto">
            <img
              src={avatarSrc}
              alt="User avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          <div className="w-full text-center">
            <p className="text-2xl font-bold">{user.username}</p>
            <p className="mt-1">Role: {user.role}</p>
          </div>

          <label className="text-sm font-medium">Update avatar from URL</label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.png"
            className="border rounded p-3 text-sm w-full"
            required
          />
          <button type="submit" className="bg-gray-700 text-white rounded px-4 py-2 text-sm hover:bg-gray-500">
            Update Avatar
          </button>
          {avatarStatus && <p>{avatarStatus}</p>}
          {avatarError && <p className="text-red-700">{avatarError}</p>}
        </form>

        <form onSubmit={handleChangePassword} className="grid gap-3 w-full h-fit">
          <label className="text-sm font-medium">Change password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="border rounded p-3 text-sm w-full"
            required
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            className="border rounded p-3 text-sm w-full"
            required
          />
          <input
            type="password"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            placeholder="Repeat new password"
            className="border rounded p-3 text-sm w-full"
            required
          />
          <button type="submit" className="bg-gray-700 text-white rounded px-4 py-2 text-sm hover:bg-gray-500">
            Change Password
          </button>
          {passwordStatus && <p className="text-green-700">{passwordStatus}</p>}
          {passwordError && <p className="text-red-700">{passwordError}</p>}
        </form>
      </div>
    </main>
  );
}
