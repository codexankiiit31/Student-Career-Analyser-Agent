// ==============================================================
// ProtectedRoute.jsx  —  Route Guard Component
// ==============================================================
//
// PURPOSE:
//   This component "wraps" any page that requires the user to be
//   logged in. If the user is NOT logged in, they are sent to /login.
//   If they ARE logged in, the requested page is shown normally.
//
// HOW TO USE:
//   <ProtectedRoute>
//     <Dashboard />
//   </ProtectedRoute>
//
// HOW IT WORKS:
//   - We check if 'access_token' exists in localStorage
//   - If yes  → render children (the protected page)
//   - If no   → redirect to /login using React Router's <Navigate>
// ==============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Read the JWT token stored in localStorage by the login function
  const token = localStorage.getItem('access_token');

  // If there is NO token, the user is not logged in.
  // Redirect them to the login page. "replace" prevents them from
  // pressing Back to bypass the redirect.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists — render the requested page normally
  return children;
}

export default ProtectedRoute;
