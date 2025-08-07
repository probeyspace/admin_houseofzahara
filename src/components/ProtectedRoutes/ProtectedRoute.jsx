import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles }) => {
  const user = useSelector((state) => state.user); // Assuming user is stored in Redux

  if (!user) {
    return <Navigate to="/login" />;
  }
  if (!allowedRoles.includes(user.role)) {
    // console.log("Access denied: User role not allowed.");
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
