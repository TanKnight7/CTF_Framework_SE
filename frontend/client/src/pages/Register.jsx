import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Ensure this file contains the new CSS
import { registerUser } from "../services/apiCTF";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const password = watch("password");
  const [commandPrefix, setCommandPrefix] = useState("$");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (userData) => registerUser(userData),
    onSuccess: (responseData) => {
      console.log("Registrasi berhasil:", responseData);
      if (responseData.error) {
        return toast.error(JSON.stringify(responseData.error));
      }

      toast.success(JSON.stringify(responseData));
      navigate("/login");
      setSuccessMessage("Registrasi berhasil!");
    },
    onError: (error) => {
      toast.error(JSON.stringify(error));
      console.error("Registrasi gagal:", error);
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
            <span className="terminal-button"></span>
            <span className="terminal-button"></span>
            <span className="terminal-title">secure_register.sh</span>
          </div>
          <div className="terminal-content">
            <div className="command-line">
              $ ./register --secure --protocol=CTF
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <div className="form-group">
                <label htmlFor="username">{commandPrefix} Username:</label>
                <input
                  type="text"
                  id="username"
                  {...register("username", {
                    required: "Username is Required",
                    minLength: {
                      value: 3,
                      message: "Username must be at least 3 characters.",
                    },
                  })}
                  disabled={isLoading}
                />
                {errors.username && (
                  <small className="text-red-700 block">
                    {errors.username.message}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">{commandPrefix} Email:</label>
                <input
                  type="email"
                  id="email"
                  {...register("email", {
                    required: "Email is Required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  disabled={isLoading}
                />
                {errors.email && (
                  <small className="text-red-700 block">
                    {errors.email.message}
                  </small>
                )}
              </div>

              <div className="form-group password-group">
                <label htmlFor="password">{commandPrefix} Password:</label>
                <div className="password-input-container">
                  {" "}
                  {/* Added this wrapper */}
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    {...register("password", {
                      required: "Password is Required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters.",
                      },
                    })}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="show-hide-password"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <small className="text-red-700 block">
                    {errors.password.message}
                  </small>
                )}
              </div>

              <div className="form-group password-group">
                <label htmlFor="confirmPassword">
                  {commandPrefix} Confirm Password:
                </label>
                <div className="password-input-container">
                  {" "}
                  {/* Added this wrapper */}
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    {...register("confirmPassword", {
                      required: "Confirm Password is Required",
                      validate: (value) =>
                        value === password || "Passwords do not match",
                    })}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="show-hide-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <small className="text-red-700 block">
                    {errors.confirmPassword.message}
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
                {isLoading ? "Creating Account..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
