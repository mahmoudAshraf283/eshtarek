import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// This component checks if the user is authenticated
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 