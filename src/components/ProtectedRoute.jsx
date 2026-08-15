import React from "react";
import {
  Navigate,
  Outlet,
} from "react-router-dom";

const getUser = () => {
  try {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Invalid user data in localStorage:",
      error
    );

    return null;
  }
};

const ProtectedRoute = ({ allowedRoles }) => {
  const user = getUser();

  // User login nahi hai
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Role ko lowercase mein normalize karna
  const userRole = String(
    user.role || ""
  )
    .trim()
    .toLowerCase();

  const normalizedAllowedRoles =
    allowedRoles?.map((role) =>
      String(role)
        .trim()
        .toLowerCase()
    );

  // Invalid role par logout nahi karna
  if (
    normalizedAllowedRoles?.length &&
    !normalizedAllowedRoles.includes(userRole)
  ) {
    return (
      <Navigate
        to="/app/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
