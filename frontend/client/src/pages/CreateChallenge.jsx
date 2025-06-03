import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "../styles/Login.css";
import { getCategories } from "../services/apiCTF";
import { createChallannge } from "../services/apiCTF";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify"; // Add this import

// Mock categories data - replace with API call in production
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
  const { register, handleSubmit, formState, reset, getValues } = useForm({
    defaultValues: {
      title: "",
      category: "",
      description: "",
      difficulty: "medium",
      points: "",
      flag: "",
    },
  });

  // Remove formData state - React Hook Form handles this
  const {
    isPending: isCategoriesPending,
    isError: isCategoriesError,
    error: categoriesError,
    data: categories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const [attachments, setAttachments] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [commandPrefix, setCommandPrefix] = useState("$");

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (userData) => {
      // Create FormData for file upload
      const formData = new FormData();

      // Add form fields
      Object.keys(userData).forEach((key) => {
        if (key !== "attachments") {
          formData.append(key, userData[key]);
        }
      });

      // Add attachments
      attachments.forEach((attachment, index) => {
        formData.append(`attachment_${index}`, attachment.file);
      });

      return createChallannge(formData);
    },
    onSuccess: (responseData) => {
      console.log("Create Challenge berhasil:", responseData);
      if (responseData.error) {
        setErrorMessage(JSON.stringify(responseData.error));
        return toast.error(JSON.stringify(responseData.error));
      }

      toast.success("Challenge created successfully!");
      setSuccessMessage("Successfully Created Challenge");
      setErrorMessage("");

      // Reset form and attachments
      reset();
      setAttachments([]);
    },
    onError: (error) => {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to create challenge";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      console.error("Failed To Create Challenge", error);
    },
  });

  function onSubmit(data) {
    // Clear previous messages
    setErrorMessage("");
    setSuccessMessage("");

    // Validate attachments if needed
    // if (attachments.length === 0) {
    //   setErrorMessage("At least one attachment is required");
    //   return;
    // }

    mutation.mutate(data);
  }

  useEffect(() => {
    const commandInterval = setInterval(() => {
      setCommandPrefix((prev) => (prev === "$" ? "$ _" : "$"));
    }, 500);
    return () => clearInterval(commandInterval);
  }, []);

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

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              {/* Challenge Title */}
              <div className="form-group">
                <label htmlFor="title">{commandPrefix} challenge_title:</label>
                <input
                  type="text"
                  id="title"
                  {...register("title", {
                    required: "Challenge title is required",
                  })}
                  disabled={mutation.isPending}
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    border: "1px solid var(--terminal-green)",
                    color: "var(--terminal-white)",
                    padding: "10px 15px",
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: "16px",
                    width: "100%",
                  }}
                />
                {formState.errors.title && (
                  <span style={{ color: "red", fontSize: "14px" }}>
                    {formState.errors.title.message}
                  </span>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="form-group">
                <label htmlFor="category">{commandPrefix} category:</label>
                <select
                  id="category"
                  {...register("category", {
                    required: "Category is required",
                  })}
                  disabled={mutation.isPending || isCategoriesPending}
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
                  {isCategoriesPending ? (
                    <option value="" disabled>
                      Loading categories...
                    </option>
                  ) : isCategoriesError ? (
                    <option value="" disabled>
                      Error loading categories
                    </option>
                  ) : (
                    (categories || []).map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
                {formState.errors.category && (
                  <span style={{ color: "red", fontSize: "14px" }}>
                    {formState.errors.category.message}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">
                  {commandPrefix} description:
                </label>
                <textarea
                  id="description"
                  {...register("description", {
                    required: "Description is required",
                  })}
                  disabled={mutation.isPending}
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
                />
                {formState.errors.description && (
                  <span style={{ color: "red", fontSize: "14px" }}>
                    {formState.errors.description.message}
                  </span>
                )}
              </div>

              {/* Difficulty */}
              <div className="form-group">
                <label htmlFor="difficulty">{commandPrefix} difficulty:</label>
                <select
                  id="difficulty"
                  {...register("difficulty", {
                    required: "Difficulty is required",
                  })}
                  disabled={mutation.isPending}
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
                  <option value={1}>1 - Very Easy</option>
                  <option value={2}>2 - Easy</option>
                  <option value={3}>3 - Medium</option>
                  <option value={4}>4 - Hard</option>
                  <option value={5}>5 - Expert</option>
                </select>
                {formState.errors.difficulty && (
                  <span style={{ color: "red", fontSize: "14px" }}>
                    {formState.errors.difficulty.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="points">{commandPrefix} points:</label>
                <input
                  type="number"
                  id="points"
                  {...register("points", {
                    required: "Points is required",
                    min: { value: 1, message: "Points must be at least 1" },
                  })}
                  disabled={mutation.isPending}
                  placeholder="Enter points (e.g., 100, 250, 500)"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    border: "1px solid var(--terminal-green)",
                    color: "var(--terminal-white)",
                    padding: "10px 15px",
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: "16px",
                    width: "100%",
                  }}
                />
                {formState.errors.points && (
                  <span style={{ color: "red", fontSize: "14px" }}>
                    {formState.errors.points.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="flag">{commandPrefix} flag:</label>
                <input
                  type="text"
                  id="flag"
                  {...register("flag", {
                    required: "Flag is required",
                  })}
                  disabled={mutation.isPending}
                  placeholder="flag{example_flag_format}"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    border: "1px solid var(--terminal-green)",
                    color: "var(--terminal-white)",
                    padding: "10px 15px",
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: "16px",
                    width: "100%",
                  }}
                />
                {formState.errors.flag && (
                  <span style={{ color: "red", fontSize: "14px" }}>
                    {formState.errors.flag.message}
                  </span>
                )}
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
                    disabled={mutation.isPending}
                    multiple
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={mutation.isPending}
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
                      disabled={mutation.isPending}
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
                          disabled={mutation.isPending}
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
                className={`login-button ${
                  mutation.isPending ? "loading" : ""
                }`}
                disabled={mutation.isPending}
              >
                {mutation.isPending
                  ? "Creating Challenge..."
                  : "Create Challenge"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChallenge;
