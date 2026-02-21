"use client";

import "@styles/globals.css";
import AdminHeader from "@components/layout/adminHeader";
import { RoutePermissionWrapper } from "@components/permissions/RoutePermissionWrapper"
import { Role } from "@types";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoutePermissionWrapper allowedRoles={[Role.ADMIN, Role.STAFF]}>
      <AdminHeader />
      <main>{children}</main>
    </RoutePermissionWrapper>
  );
}
