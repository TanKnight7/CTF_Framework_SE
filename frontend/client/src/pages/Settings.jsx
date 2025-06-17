import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { getProfile, updateProfile } from "../services/apiCTF";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { isPending: isProfilePending, data: profile } = useQuery({
    queryKey: ["getProfile"],
    queryFn: getProfile,
  });

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      username: "",
      bio: "",
      country: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username || "",
        bio: profile.bio || "",
        country: profile.country || "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    }
  }, [profile, reset]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [commandPrefix, setCommandPrefix] = useState("$");

  const newPassword = watch("newPassword");

  useEffect(() => {
    const commandInterval = setInterval(() => {
      setCommandPrefix((prev) => (prev === "$" ? "$ _" : "$"));
    }, 500);
    return () => clearInterval(commandInterval);
  }, []);

  const cleanData = (obj) =>
    Object.fromEntries(
      Object.entries(obj).filter(
        ([_, value]) => value !== null && value !== undefined && value !== ""
      )
    );

  const mutation = useMutation({
    mutationFn: (userData) => updateProfile(userData),
    onSuccess: (responseData) => {
      if (responseData?.error) {
        return;
      }
      navigate("/profile");
    },
    onError: (error) => {},
  });
  const onSubmit = async (data) => {
    setErrorMessage("");
    setSuccessMessage("");

    const profileData = cleanData({
      username: data.username,
      bio: data.bio,
      country: data.country,
    });

    const passwordData = cleanData({
      old_password: data.currentPassword,
      password: data.newPassword,
      confirmPassword: data.confirmNewPassword,
    });

    if (passwordData.password) {
      if (passwordData.password !== passwordData.confirmPassword) {
        toast.error("New password does not match.");
        return;
      }
    }

    const submittedData = { ...profileData, ...passwordData, id: profile.id };
    mutation.mutate(submittedData);
  };

  if (isProfilePending) {
    return "Data loading..";
  }

  return (
    <div className="container relative overflow-hidden">
      <div className="relative z-10">
        <h1 className="terminal-text text-3xl mb-6 main-title-glow">
          User Settings
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="card card-enhanced p-6">
            <h2 className="terminal-text text-xl mb-4 section-title-glow">
              Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="username" className="block terminal-text mb-1">
                  {commandPrefix} Username:
                </label>
                <input
                  type="text"
                  id="username"
                  {...register("username", {
                    required: "Username is required",
                  })}
                  className="w-full p-2 rounded-md bg-tertiary-bg border border-border-color focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green text-text-primary"
                />
                {errors.username && (
                  <small className="error-message block mt-1">
                    {errors.username.message}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="country" className="block terminal-text mb-1">
                  {commandPrefix} Country:
                </label>
                <input
                  type="text"
                  id="country"
                  {...register("country")}
                  className="w-full p-2 rounded-md bg-tertiary-bg border border-border-color focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green text-text-primary"
                />
              </div>
            </div>

            <div className="form-group mt-6">
              <label htmlFor="bio" className="block terminal-text mb-1">
                {commandPrefix} Bio:
              </label>
              <textarea
                id="bio"
                {...register("bio")}
                rows="4"
                className="w-full p-2 rounded-md bg-tertiary-bg border border-border-color focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green text-text-primary resize-none"
              ></textarea>
            </div>
          </div>

          <div className="card card-enhanced p-6">
            <h2 className="terminal-text text-xl mb-4 section-title-glow">
              Change Password
            </h2>

            <div className="form-group mb-4 password-group">
              <label
                htmlFor="currentPassword"
                className="block terminal-text mb-1"
              >
                {commandPrefix} Current Password:
              </label>
              <div className="password-input-container">
                <input
                  type="password"
                  id="currentPassword"
                  {...register("currentPassword", {
                    validate: (value) =>
                      !watch("newPassword") ||
                      !!value ||
                      "Current password is required to set a new one",
                  })}
                  className="w-full p-2 rounded-md bg-tertiary-bg border border-border-color focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green text-text-primary"
                />
              </div>
              {errors.currentPassword && (
                <small className="error-message block mt-1">
                  {errors.currentPassword.message}
                </small>
              )}
            </div>

            <div className="form-group mb-4 password-group">
              <label htmlFor="newPassword" className="block terminal-text mb-1">
                {commandPrefix} New Password:
              </label>
              <div className="password-input-container">
                <input
                  type="password"
                  id="newPassword"
                  {...register("newPassword", {
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  className="w-full p-2 rounded-md bg-tertiary-bg border border-border-color focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green text-text-primary"
                />
              </div>
              {errors.newPassword && (
                <small className="error-message block mt-1">
                  {errors.newPassword.message}
                </small>
              )}
            </div>

            <div className="form-group mb-6 password-group">
              <label
                htmlFor="confirmNewPassword"
                className="block terminal-text mb-1"
              >
                {commandPrefix} Confirm New Password:
              </label>
              <div className="password-input-container">
                <input
                  type="password"
                  id="confirmNewPassword"
                  {...register("confirmNewPassword", {
                    validate: (value) =>
                      value === newPassword || "New passwords do not match",
                  })}
                  className="w-full p-2 rounded-md bg-tertiary-bg border border-border-color focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green text-text-primary"
                />
              </div>
              {errors.confirmNewPassword && (
                <small className="error-message block mt-1">
                  {errors.confirmNewPassword.message}
                </small>
              )}
            </div>
          </div>

          <div className="mt-6 text-right">
            {errorMessage && (
              <div className="error-message text-left mb-4">{errorMessage}</div>
            )}
            {successMessage && (
              <div className="success-message text-left mb-4">
                {successMessage}
              </div>
            )}
            <button
              type="submit"
              className={`filter-button active create-ticket-button scale-on-hover ${
                isSubmitting || !isDirty ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
