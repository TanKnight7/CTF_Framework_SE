// In: frontend/client/src/components/RatingModal.jsx

import React, { useState, useEffect } from 'react';

// Using inline SVGs for stars to avoid dependency issues.
const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`w-8 h-8 cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-400'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.16c.969 0 1.371 1.24.588 1.81l-3.363 2.444a1 1 0 00-.364 1.118l1.287 3.956c.3.921-.755 1.688-1.54 1.118l-3.363-2.444a1 1 0 00-1.175 0l-3.363 2.444c-.784.57-1.838-.197-1.539-1.118l1.287-3.956a1 1 0 00-.364-1.118L2.24 9.383c-.783-.57-.38-1.81.588-1.81h4.16a1 1 0 00.95-.69l1.286-3.956z" />
  </svg>
);

export default function RatingModal({ isOpen, onClose, onSubmit, challengeId }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Reset state when the modal is closed or the challenge changes
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setHoverRating(0);
      setFeedback('');
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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 shadow-2xl w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Rate this Challenge</h2>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-2">Your rating:</p>
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
        </div>
        
        <div className="mb-6">
          <label htmlFor="feedback" className="block text-gray-300 mb-2">Feedback (optional):</label>
          <textarea
            id="feedback"
            rows="4"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full bg-gray-900 text-white border border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="How was the challenge? Any thoughts on the difficulty or quality?"
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-md bg-cyan-600 text-white font-semibold hover:bg-cyan-500 transition-colors"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

