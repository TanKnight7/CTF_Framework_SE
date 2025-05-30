import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/submit.css";

const SubmitPage = () => {
  const [writeup, setWriteup] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commandPrefix, setCommandPrefix] = useState("$");
  const navigate = useNavigate();

  // Sample

  // Command prompt animation
  React.useEffect(() => {
    const commandInterval = setInterval(() => {
      setCommandPrefix((prev) => (prev === "$" ? "$ _" : "$"));
    }, 500);

    return () => clearInterval(commandInterval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo purposes, always succeed
      setSuccessMessage(
        "Writeup submitted successfully! Your solution is being reviewed."
      );

      // Could navigate to a success page if needed
      // navigate('/success');
    } catch (error) {
      setErrorMessage("Error: Connection failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="submit-writeup-page">
      <div className="content">
        <div className="header">
          <div className="logo">TANCTF</div>
        </div>

        <div className="terminal">
          <div className="terminal-header">
            <span className="terminal-button"></span>
            <span className="terminal-button"></span>
            <span className="terminal-title">submit_writeup.sh</span>
          </div>
          <div className="terminal-content">
            <div className="command-line">$ ./submit --writeup</div>

            <form onSubmit={handleSubmit} className="writeup-form">
              <div className="form-group">
                <label htmlFor="file">{commandPrefix} attach file:</label>
                <div className="file-input-container">
                  <input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="file-input"
                  />
                  <div className="file-input-text">
                    {file ? file.name : "No file selected"}
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}

              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}

              <button
                type="submit"
                className={`submit-button ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Writeup"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitPage;
