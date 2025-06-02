import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/Login.css";

const mockCategories = [
  { id: 1, name: "Web" },
  { id: 2, name: "Crypto" },
  { id: 3, name: "Forensics" },
  { id: 4, name: "Reverse Engineering" },
  { id: 5, name: "Pwn" },
  { id: 6, name: "OSINT" },
  { id: 7, name: "Misc" },
];

const CreateChallenge = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    difficulty: "medium",
    point: "",
    flag: "",
  });

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Multiple file attachment state
  const [attachments, setAttachments] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commandPrefix, setCommandPrefix] = useState("$");

  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const commandInterval = setInterval(() => {
      setCommandPrefix((prev) => (prev === "$" ? "$ _" : "$"));
    }, 500);
    return () => clearInterval(commandInterval);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setCategories(mockCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setErrorMessage("Failed to load categories. Please refresh the page.");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAttachments((prevAttachments) => [
        ...prevAttachments,
        ...files.map((file) => ({
          id: Date.now() + Math.random(),
          file: file,
          name: file.name,
          size: file.size,
        })),
      ]);

      e.target.value = "";
    }
  };

  const removeAttachment = (attachmentId) => {
    setAttachments((prevAttachments) =>
      prevAttachments.filter((attachment) => attachment.id !== attachmentId)
    );
  };

  const clearAllAttachments = () => {
    setAttachments([]);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setErrorMessage("Error: Challenge title is required");
      return;
    }

    if (!formData.category) {
      setErrorMessage("Error: Category is required");
      return;
    }

    if (!formData.description.trim()) {
      setErrorMessage("Error: Description is required");
      return;
    }

    if (
      !formData.points ||
      isNaN(formData.points) ||
      parseInt(formData.points) <= 0
    ) {
      setErrorMessage("Error: Points must be a positive number");
      return;
    }

    if (!formData.flag.trim()) {
      setErrorMessage("Error: Flag is required");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create FormData object for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      // Add all attachments
      attachments.forEach((attachment, index) => {
        submitData.append(`attachment_${index}`, attachment.file);
      });

      // Mock API call - replace with actual API call in production
      console.log("Creating challenge:", formData);
      console.log("With attachments:", attachments);

      setSuccessMessage(`Challenge "${formData.title}" created successfully!`);

      setFormData({
        title: "",
        category: "",
        description: "",
        difficulty: "medium",
        points: "",
        flag: "",
      });
      setAttachments([]);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to create challenge. Please try again."
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

        <div className="terminal" style={{ maxWidth: "800px" }}>
          <div className="terminal-header">
            <span className="terminal-button"></span>
            <span className="terminal-button"></span>
            <span className="terminal-title">create_challenge.sh</span>
          </div>
          <div className="terminal-content">
            <div className="command-line">
              $ ./create_challenge --interactive
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Challenge Title */}
              <div className="form-group">
                <label htmlFor="title">{commandPrefix} challenge_title:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>

              {/* Category Dropdown */}
              <div className="form-group">
                <label htmlFor="category">{commandPrefix} category:</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isLoading || isLoadingCategories}
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    border: "1px solid var(--terminal-green)",
                    color: "var(--terminal-white)",
                    padding: "10px 15px",
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: "16px",
                    width: "100%",
                  }}
                >
                  <option value="">-- Select Category --</option>
                  {isLoadingCategories ? (
                    <option value="" disabled>
                      Loading categories...
                    </option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">
                  {commandPrefix} description:
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows="4"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    border: "1px solid var(--terminal-green)",
                    color: "var(--terminal-white)",
                    padding: "10px 15px",
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: "16px",
                    width: "100%",
                    resize: "vertical",
                  }}
                ></textarea>
              </div>

              {/* Difficulty */}
              <div className="form-group">
                <label htmlFor="difficulty">{commandPrefix} difficulty:</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  disabled={isLoading}
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    border: "1px solid var(--terminal-green)",
                    color: "var(--terminal-white)",
                    padding: "10px 15px",
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: "16px",
                    width: "100%",
                  }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="points">{commandPrefix} points:</label>
                <input
                  type="text"
                  id="points"
                  name="points"
                  value={formData.points}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter points (e.g., 100, 250, 500)"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>

              <div className="form-group">
                <label htmlFor="flag">{commandPrefix} flag:</label>
                <input
                  type="text"
                  id="flag"
                  name="flag"
                  value={formData.flag}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="flag{example_flag_format}"
                />
              </div>

              <div className="form-group">
                <label>{commandPrefix} attachments:</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isLoading}
                    multiple
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={isLoading}
                    style={{
                      backgroundColor: "var(--dark-green)",
                      color: "var(--neon-green)",
                      border: "1px solid var(--neon-green)",
                      padding: "8px 12px",
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: "14px",
                      cursor: "pointer",
                      marginRight: "10px",
                    }}
                  >
                    Select Files
                  </button>
                  {attachments.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllAttachments}
                      disabled={isLoading}
                      style={{
                        backgroundColor: "var(--dark-red, #660000)",
                        color: "var(--neon-red, #ff6666)",
                        border: "1px solid var(--neon-red, #ff6666)",
                        padding: "8px 12px",
                        fontFamily: "'Roboto Mono', monospace",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Display selected files */}
                {attachments.length > 0 && (
                  <div
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      border: "1px solid var(--terminal-green)",
                      padding: "10px",
                      borderRadius: "4px",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{
                        color: "var(--terminal-white)",
                        marginBottom: "8px",
                        fontSize: "14px",
                      }}
                    >
                      Selected files ({attachments.length}):
                    </div>
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "4px 0",
                          borderBottom: "1px solid rgba(0, 255, 0, 0.2)",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--terminal-white)",
                            fontSize: "14px",
                            flex: 1,
                          }}
                        >
                          {attachment.name} ({formatFileSize(attachment.size)})
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.id)}
                          disabled={isLoading}
                          style={{
                            backgroundColor: "transparent",
                            color: "var(--neon-red, #ff6666)",
                            border: "1px solid var(--neon-red, #ff6666)",
                            padding: "2px 6px",
                            fontFamily: "'Roboto Mono', monospace",
                            fontSize: "12px",
                            cursor: "pointer",
                            marginLeft: "10px",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {attachments.length === 0 && (
                  <span
                    style={{ color: "var(--terminal-white)", fontSize: "14px" }}
                  >
                    No files selected
                  </span>
                )}
              </div>

              {/* Error and Success Messages */}
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={`login-button ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Creating Challenge..." : "Create Challenge"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChallenge;
