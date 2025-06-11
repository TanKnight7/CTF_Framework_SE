import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getProfile } from "../services/apiCTF";

const AdminRoute = () => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("Token");
      if (!token) {
        setIsAdmin(false);
        return;
      }

      try {
        const profile = await getProfile();
        setIsAdmin(profile.role === "admin");
      } catch (err) {
        setError(true);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  if (isAdmin === null) return <div>Loading...</div>;

  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
