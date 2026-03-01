import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleGuard({ allowedRoles = [], children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RoleGuard;
