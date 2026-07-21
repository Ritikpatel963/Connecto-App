import React from "react";
import { Icon } from "@iconify/react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AdminPermission } from "../types";
import { useAuth } from "./AuthContext";

interface Props {
  require: AdminPermission;
}

// Map legacy permission keys to their module.action equivalents
const permissionAliases: Record<string, string[]> = {
  manage_users:               ["users.view", "users.edit", "users.create"],
  manage_admins:              ["admin_roles.view"],
  verify_id:                  ["id_verifications.view"],
  verify_voice:               ["voice_verifications.view"],
  approve_wallet_recharge:    ["wallet.view"],
  approve_referral_redemption:["referrals.approve"],
};

export const isSuperAdmin = (role: string) => role.toLowerCase().includes("super");

export const hasPermission = (permissions: AdminPermission[], require: AdminPermission): boolean => {
  if (permissions.includes(require)) return true;
  // Check matrix aliases
  const aliases = permissionAliases[require as string] || [];
  return aliases.some((alias) => permissions.includes(alias as AdminPermission));
};

const PermissionRoute = ({ require }: Props) => {
  const { admin, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!admin) return <Navigate to="/login" replace state={{ from: location }} />;

  // Super Admin bypasses all permission checks
  if (isSuperAdmin(admin.role)) return <Outlet />;

  if (!hasPermission(admin.permissions, require)) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-center py-80 px-24">
        <span className="w-80-px h-80-px radius-full bg-danger-focus d-flex align-items-center justify-content-center mb-24">
          <Icon icon="solar:shield-warning-outline" className="text-danger-main text-4xl" />
        </span>
        <h5 className="fw-semibold mb-8">Access Denied</h5>
        <p className="text-secondary-light mb-0 max-w-400-px">
          You don&apos;t have permission to view this page. Contact your administrator to request access.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export default PermissionRoute;
