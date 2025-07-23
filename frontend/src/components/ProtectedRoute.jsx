import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // If token not found, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, allow route
  return children;
};

export default ProtectedRoute;
