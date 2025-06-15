import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { joinTeam } from "../services/apiCTF";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

const JoinTeam = () => {
  const [teamName, setTeamName] = useState("");
  const [token, setToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const cursor = document.querySelector(".blinking-cursor");
      if (cursor) cursor.classList.toggle("hidden");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const { register, handleSubmit, formState } = useForm();
  const { errors } = formState;

  const mutation = useMutation({
    mutationFn: (userData) => joinTeam(userData),
    onSuccess: (responseData) => {
      console.log(responseData);
      if (responseData?.error) {
        return toast.error(JSON.stringify(responseData?.error));
      }
      toast.success(JSON.stringify(responseData));
      navigate("/");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Error occured");
    },
  });

  function onSubmit(data) {
    mutation.mutate(data);
  }

  return (
    <div className="terminal">
      <div className="terminal-header">
        <span className="terminal-button terminal-button-close"></span>
        <span className="terminal-button terminal-button-minimize"></span>
        <span className="terminal-button terminal-button-maximize"></span>
        <span className="terminal-title">join_team.sh</span>
      </div>
      <div className="terminal-content">
        <div className="command-line">
          $ ./join_team --token="&lt;team_token&gt;"
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <label htmlFor="teamName">
              $ team_token:<span className="blinking-cursor">_</span>
            </label>
            <input
              type="text"
              id="teamToken"
              {...register("teamToken", {
                required: "Team token is Required",
              })}
            />
            {errors?.name?.message && (
              <small className="text-red-700 block">
                {errors.name.message}
              </small>
            )}
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <button
            type="submit"
            className={`login-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Joining Team..." : "Join Team"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinTeam;
