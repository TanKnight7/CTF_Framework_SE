import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const CreateCategory = () => {
  const [categoryName, setCategoryName] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setErrorMessage("Error: Category name is required");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Creating category:", categoryName);
      setSuccessMessage(`Category "${categoryName}" created successfully!`);
      setCategoryName("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to create category. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
            <span className="terminal-title">create_category.sh</span>
          </div>
          <div className="terminal-content">
            <div className="command-line">$ ./create_category --name=</div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="categoryName">
                  {commandPrefix} category_name:
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  disabled={isLoading}
                  autoComplete="off"
                  spellCheck="false"
                />
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
