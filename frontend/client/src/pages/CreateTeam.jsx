import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { createTeam } from "../services/apiCTF";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

const CreateTeam = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commandPrefix, setCommandPrefix] = useState("$");
  const navigate = useNavigate();

  useEffect(() => {
    const commandInterval = setInterval(() => {
      setCommandPrefix((prev) => (prev === "$" ? "$ _" : "$"));
    }, 500);
    return () => clearInterval(commandInterval);
  }, []);

  const { register, handleSubmit, formState } = useForm();
  const { errors } = formState;

  const mutation = useMutation({
    mutationFn: (userData) => createTeam(userData),
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
        <span className="terminal-title">create_team.sh</span>
      </div>
      <div className="terminal-content">
        <div className="command-line">
          $ ./create_team --name="&lt;your_team_name&gt;"
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <label htmlFor="teamName">{commandPrefix} team_name:</label>
            {/* <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
              spellCheck="false"
              required
            /> */}
            <input
              type="text"
              id="name"
              {...register("name", {
                required: "Team name is Required",
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
            {isLoading ? "Creating Team..." : "Create Team"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;
