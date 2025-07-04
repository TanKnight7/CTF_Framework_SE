import React, { useState, FormEvent } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { login } from "../services/apiCTF";

const Login = () => {
  const { register, handleSubmit, formState } = useForm();
  const { errors } = formState;
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commandPrefix, setCommandPrefix] = useState("$");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (userData) => login(userData),
    onSuccess: (responseData) => {
      if (responseData.error) {
        return;
      }

      localStorage.setItem("Token", responseData.token);
      navigate("/");
      window.location.href = "/";
    },
    onError: (error) => {
      console.error("Login gagal:", error);
    },
  });

  function onSubmit(data) {
    mutation.mutate(data);
  }

  React.useEffect(() => {
    const commandInterval = setInterval(() => {
      setCommandPrefix((prev) => (prev === "$" ? "$ _" : "$"));
    }, 500);

    return () => clearInterval(commandInterval);
  }, []);

  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch("/config/ctf")
      .then((res) => res.json())
      .then((data) => setConfig(data));
  }, []);

  if (!config) return <div>Loading config...</div>;
  return (
    <div className="login-page">
      <div className="content">
        <div className="header">
          <div className="logo">{config.name}</div>
        </div>

        <div className="terminal">
          <div className="terminal-header">
            <span className="terminal-button terminal-button-close"></span>
            <span className="terminal-button terminal-button-minimize"></span>
            <span className="terminal-button terminal-button-maximize"></span>
            <span className="terminal-title">secure_login.sh</span>
          </div>
          <div className="terminal-content">
            <div className="command-line">
              $ ./authenticate --secure --protocol=CTF
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <div className="form-group">
                <label htmlFor="username">{commandPrefix} username:</label>
                <input
                  type="text"
                  id="username"
                  {...register("username", {
                    required: "Username is Required",
                  })}
                />
                {errors?.username?.message && (
                  <small className="text-red-700 block">
                    {errors.username.message}
                  </small>
                )}
              </div>

              <div className="form-group password-group">
                <label htmlFor="password">{commandPrefix} Password:</label>

                <div className="password-input-container">
                  {" "}
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    {...register("password", {
                      required: "Password is Required",
                    })}
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
                {errors?.password?.message && (
                  <small className="text-red-700 block">
                    {errors.password.message}
                  </small>
                )}
              </div>

              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}

              <button
                type="submit"
                className={`login-button ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
