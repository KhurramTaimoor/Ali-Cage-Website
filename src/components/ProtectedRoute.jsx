import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// In a real app, you'd get this from your Auth Context or Redux store
// For now, we simulate it with a simple function or localStorage
const getUser = () => {
  // Example: Retrieve user info from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  return user;
};

const ProtectedRoute = ({ allowedRoles }) => {
  const user = getUser();

  // 1. Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if user has the required role (if roles are specified)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is logged in but doesn't have permission (e.g. Employee trying to access Admin)
    return <Navigate to="/unauthorized" replace />; // Or redirect to dashboard
  }

  // 3. If all checks pass, render the child routes (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;