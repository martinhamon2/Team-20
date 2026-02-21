"use client";

import React, { useContext, useEffect } from "react";
import { AuthContext } from "@context/AuthContext";
import { Role } from "@types";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const RoutePermissionWrapper = ({ children, allowedRoles }: Props) => {
    const context = useContext(AuthContext);
    const router = useRouter();
    if (!context) throw new Error("RoutePermissionWrapper must be used within an AuthProvider");
    const { user, isLoading } = context;

    // cool animation while waiting, optional because it could also just return null
    const LoadingSpinner = () => (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#133688] border-t-transparent"></div>
    </div>
);

    useEffect(() => {
        if (!isLoading) {
            if (!user || !allowedRoles.includes(user.role)) {
            router.push("/");
            }
        }
    }, [user, allowedRoles, router, isLoading]);

    if (isLoading) {
        return <LoadingSpinner />;
    }
    if (!user || !allowedRoles.includes(user.role)) {
        return <LoadingSpinner />;
    }

    return <>{children}</>;
};