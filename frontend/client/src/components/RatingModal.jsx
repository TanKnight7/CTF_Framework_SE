// In: frontend/client/src/components/RatingModal.jsx

import React, { useState, useEffect } from "react";

// Using inline SVGs for stars to avoid dependency issues.
const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
      filled ? "text-terminal-green" : "text-gray-500"
    }`}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.16c.969 0 1.371 1.24.588 1.81l-3.363 2.444a1 1 0 00-.364 1.118l1.287 3.956c.3.921-.755 1.688-1.54 1.118l-3.363-2.444a1 1 0 00-1.175 0l-3.363 2.444c-.784.57-1.838-.197-1.539-1.118l1.287-3.956a1 1 0 00-.364-1.118L2.24 9.383c-.783-.57-.38-1.81.588-1.81h4.16a1 1 0 00.95-.69l1.286-3.956z" />
  </svg>
);

export default function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  challengeId,
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  // Reset state when the modal is closed or the challenge changes
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setHoverRating(0);
      setFeedback("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }
    onSubmit(challengeId, { rating, feedback });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50"
      style={{
        zIndex: 9999,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="bg-secondary-bg border border-border-color rounded-lg p-8 shadow-2xl w-full max-w-md mx-4"
        style={{
          backgroundColor: "var(--secondary-bg)",
          borderColor: "var(--border-color)",
          maxWidth: "500px",
          width: "90%",
        }}
      >
        <h2 className="text-2xl font-bold text-terminal-green mb-4">
          Rate this Challenge
        </h2>

        <div className="mb-6">
          <p className="text-terminal-white mb-2">Your rating:</p>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                filled={star <= (hoverRating || rating)}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>
          <p className="text-sm text-muted mt-2">
            {rating > 0 && (
              <span className="text-terminal-green font-semibold">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </span>
            )}
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="feedback" className="block text-terminal-white mb-2">
            Feedback (optional):
          </label>
          <textarea
            id="feedback"
            rows="4"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full bg-tertiary-bg text-terminal-white border border-border-color rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-terminal-green transition-all duration-200"
            placeholder="How was the challenge? Any thoughts on the difficulty or quality?"
          ></textarea>
        </div>

        <div className="flex justify-between space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-12 py-3 rounded-md font-semibold transition-all duration-200 border-2 hover:scale-105"
            style={{
              backgroundColor: "var(--tertiary-bg)",
              color: "var(--terminal-white)",
              borderColor: "var(--border-color)",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "var(--secondary-bg)";
              e.target.style.borderColor = "var(--terminal-green)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "var(--tertiary-bg)";
              e.target.style.borderColor = "var(--border-color)";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-12 py-3 rounded-md font-semibold transition-all duration-200 border-2 hover:scale-105"
            style={{
              backgroundColor: "var(--terminal-green)",
              color: "var(--terminal-black)",
              borderColor: "var(--terminal-green)",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "var(--accent-blue)";
              e.target.style.borderColor = "var(--accent-blue)";
              e.target.style.color = "var(--terminal-white)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "var(--terminal-green)";
              e.target.style.borderColor = "var(--terminal-green)";
              e.target.style.color = "var(--terminal-black)";
            }}
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}
