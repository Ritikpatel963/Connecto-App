import React from "react";
import { Icon } from "@iconify/react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AdminPermission } from "../types";
import { useAuth } from "./AuthContext";

interface Props {
  require: AdminPermission;
}

const PermissionRoute = ({ require }: Props) => {
  const { admin, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!admin) return <Navigate to="/login" replace state={{ from: location }} />;

  if (!admin.permissions.includes(require)) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-center py-80 px-24">
        <span className="w-80-px h-80-px radius-full bg-danger-focus d-flex align-items-center justify-content-center mb-24">
          <Icon icon="solar:shield-warning-outline" className="text-danger-main text-4xl" />
        </span>
        <h5 className="fw-semibold mb-8">Access Denied</h5>
        <p className="text-secondary-light mb-0 max-w-400-px">
          You don't have permission to view this page. Contact your administrator to request access.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export default PermissionRoute;
