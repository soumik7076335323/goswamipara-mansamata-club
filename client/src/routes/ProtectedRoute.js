import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/ui';

export default function ProtectedRoute() {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking) return <Spinner />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
