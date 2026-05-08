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

  return (
    <main className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="pageTitle mb-6">My Profile</h1>

      <div className="flex flex-col items-center gap-6 p-6 border rounded-xl shadow-sm">
        <div className="w-32 h-32 rounded-full overflow-hidden border-2">
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

        <form onSubmit={handleAvatarUpdate} className="grid gap-3">
          <label className="text-sm">Update avatar from URL</label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.png"
            className="border rounded p-3 text-sm w-64"
            required
          />
          <button
            type="submit"
            className="bg-gray-700 text-white rounded px-4 py-2 text-sm hover:bg-gray-500"
          >
            Update Avatar
          </button>
          {avatarStatus && <p>{avatarStatus}</p>}
          {avatarError && <p className="text-red-700">{avatarError}</p>}
        </form>
      </div>
    </main>
  );
}
