import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

const mockUserData = {
  username: "cyberNinja",
  email: "ninja@example.com",
  bio: "Passionate about web security and CTFs. Always learning.",
  country: "USA",
};

const Settings = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      username: mockUserData.username,
      bio: mockUserData.bio,
      country: mockUserData.country,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

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

  const onSubmit = async (data) => {
    setErrorMessage("");
    setSuccessMessage("");

    const profileData = {
      username: data.username,
      bio: data.bio,
      country: data.country,
    };

    const passwordData = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };

    try {
      console.log("Updating profile with:", profileData);
      // Simulate API call for profile update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Only attempt password change if new password fields are filled
      if (passwordData.newPassword && passwordData.currentPassword) {
        console.log("Changing password...");
        // Simulate API call for password change
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Mock validation: fail if current password is not 'password123'
            if (passwordData.currentPassword !== "password123") {
              reject(new Error("Incorrect current password."));
            } else {
              resolve(true);
            }
          }, 1000);
        });
        console.log("Password changed successfully (mock).");
      } else if (passwordData.newPassword || passwordData.currentPassword) {
        // If only one password field is filled, it might be an error or incomplete attempt
        if (passwordData.newPassword && !passwordData.currentPassword) {
          throw new Error(
            "Current password is required to set a new password."
          );
        }
        // No error if only current password is filled but new is empty
      }

      setSuccessMessage("Settings updated successfully!");
      // Reset form state after successful submission, keeping new values
      reset(data, { keepDirty: false, keepValues: true });
      // Clear password fields after successful update for security
      reset(
        {
          ...data, // keep other fields
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        },
        { keepDirty: false, keepValues: true }
      );
    } catch (error) {
      setErrorMessage(
        error.message || "Failed to update settings. Please try again."
      );
    }
    // --- End Mock API Call Simulation ---
  };

  return (
    <div className="container relative overflow-hidden">
      {/* Optional: Animated Grid Background */}
      {/* <div className="animated-grid-background"></div> */}

      <div className="relative z-10">
        <h1 className="terminal-text text-3xl mb-6 main-title-glow">
          User Settings
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* --- Profile Information Section --- */}
          <div className="card card-enhanced p-6">
            <h2 className="terminal-text text-xl mb-4 section-title-glow">
              Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
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

              {/* Country */}
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
                {/* No error display needed unless validation is added */}
              </div>
            </div>

            {/* Bio */}
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
              {/* No error display needed unless validation is added */}
            </div>
          </div>

          {/* --- Change Password Section --- */}
          <div className="card card-enhanced p-6">
            <h2 className="terminal-text text-xl mb-4 section-title-glow">
              Change Password
            </h2>
            {/* Current Password */}
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
                    // Required only if newPassword is being set
                    validate: (value) =>
                      !watch("newPassword") ||
                      !!value ||
                      "Current password is required to set a new one",
                  })}
                  className="w-full p-2 rounded-md bg-tertiary-bg border border-border-color focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green text-text-primary"
                />
                {/* Optional: Add show/hide button if desired, requires state management */}
              </div>
              {errors.currentPassword && (
                <small className="error-message block mt-1">
                  {errors.currentPassword.message}
                </small>
              )}
            </div>

            {/* New Password */}
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

            {/* Confirm New Password */}
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

          {/* --- Submit Button & Messages --- */}
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
              disabled={isSubmitting || !isDirty} // Disable if submitting or no changes made
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
