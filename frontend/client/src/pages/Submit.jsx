import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/submit.css";
import { submitWriteup } from "../services/apiCTF";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

const SubmitPage = () => {
  const [writeup, setWriteup] = useState("");
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commandPrefix, setCommandPrefix] = useState("$");
  const navigate = useNavigate();

  React.useEffect(() => {
    const commandInterval = setInterval(() => {
      setCommandPrefix((prev) => (prev === "$" ? "$ _" : "$"));
    }, 500);

    return () => clearInterval(commandInterval);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const mutation = useMutation({
    mutationFn: (userData) => submitWriteup(userData),
    onSuccess: (responseData) => {
      console.log(responseData);
      if (responseData?.error) {
        return toast.error(JSON.stringify(responseData?.error));
      }
      toast.success(JSON.stringify(responseData));
      setFile(null);
      reset();
    },
    onError: (error) => {
      console.log(error);
      toast.error("Error occured");
    },
  });

  function onSubmit(data) {
    const fileList = data.attachment; // this is a FileList
    if (!fileList || fileList.length === 0) {
      toast.error("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("attachment", fileList[0]); // grab the actual File object

    mutation.mutate(formData);
  }

  return (
    <div className="submit-writeup-page">
      <div className="content">
        <div className="terminal">
          <div className="terminal-header">
            <span className="terminal-button"></span>
            <span className="terminal-button"></span>
            <span className="terminal-title">submit_writeup.sh</span>
          </div>
          <div className="terminal-content">
            <div className="command-line">$ ./submit --writeup</div>

            <form onSubmit={handleSubmit(onSubmit)} className="writeup-form">
              <div className="form-group">
                <label htmlFor="file">{commandPrefix} attach file:</label>
                <div className="file-input-container">
                  <input
                    type="file"
                    id="file"
                    disabled={isLoading}
                    className="file-input"
                    {...register("attachment", {
                      required: "Attachment is required",
                      onChange: (e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) {
                          setFile(selectedFile); // ✅ update state to show filename
                        }
                      },
                    })}
                  />

                  <div className="file-input-text">
                    {file ? file.name : "No file selected"}
                  </div>
                  {errors?.attachment?.message && (
                    <small className="text-red-700 block">
                      {errors.attachment.message}
                    </small>
                  )}
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
