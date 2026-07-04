import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = () => {
  const { session, admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-vh-100 d-flex align-items-center justify-content-center bg-neutral-50"><div className="spinner-border text-primary-600" role="status" /></div>;
  }

  if (!session || !admin) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
};

export default ProtectedRoute;
