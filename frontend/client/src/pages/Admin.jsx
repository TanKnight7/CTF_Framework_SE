import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/admin/challenges");
  }, [navigate]);

  return null; // or a loading indicator
};

export default Admin;
