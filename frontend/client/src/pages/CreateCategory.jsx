import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createCategory } from "../services/apiCTF";

const CreateCategory = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commandPrefix, setCommandPrefix] = useState("$");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const mutation = useMutation({
    mutationFn: (userData) => createCategory(userData),
    onSuccess: (responseData) => {
      console.log("Create Category berhasil:", responseData);
      if (responseData.error) {
        return toast.error(JSON.stringify(responseData.error));
      }

      toast.success(JSON.stringify(responseData));
      setSuccessMessage("Succesfully Created Category");
    },
    onError: (error) => {
      toast.error(JSON.stringify(error));
      console.error("Failed To Create Categroy", error);
    },
  });

  function onSubmit(data) {
    mutation.mutate(data);
  }

  useEffect(() => {
    const commandInterval = setInterval(() => {
      setCommandPrefix((prev) => (prev === "$" ? "$ _" : "$"));
    }, 500);
    return () => clearInterval(commandInterval);
  }, []);

  return (
    <div className="login-page">
      <div className="content">
        <div className="header">
          <div className="logo">TANCTF</div>
          <h1>CyberSec CTF Challenge 2025</h1>
        </div>

        <div className="terminal">
          <div className="terminal-header">
            <span className="terminal-button terminal-button-close"></span>
            <span className="terminal-button terminal-button-minimize"></span>
            <span className="terminal-button terminal-button-maximize"></span>
            <span className="terminal-title">create_category.sh</span>
          </div>
          <div className="terminal-content">
            <div className="command-line">$ ./create_category --name=</div>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <div className="form-group">
                <label htmlFor="name">{commandPrefix} category_name:</label>
                <input
                  {...register("name", {
                    required: "categoryName is Required",
                  })}
                  disabled={isLoading}
                />
                {errors.name && (
                  <small className="text-red-700 block">
                    {errors.name.message}
                  </small>
                )}
              </div>

              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}

              <button
                type="submit"
                className={`login-button ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Creating Category..." : "Create Category"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;
