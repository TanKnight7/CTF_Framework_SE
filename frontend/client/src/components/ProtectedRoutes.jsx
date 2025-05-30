import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoute = () => {
  const Token = localStorage.getItem("Token");

  return Token ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
