import React from "react";

const Reviews = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="mb-4 p-3 bg-tertiary-bg rounded-md">
        <h3 className="text-sm text-muted mb-2">Reviews</h3>
        <p className="text-sm text-muted">
          No reviews yet. Be the first to review this challenge!
        </p>
      </div>
    );
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-sm ${
          index < rating ? "text-terminal-green" : "text-gray-500"
        }`}
      >
        ★
      </span>
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mb-4 p-3 bg-tertiary-bg rounded-md">
      <h3 className="text-sm text-muted mb-3">Reviews ({reviews.length})</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-border-color pb-3 last:border-b-0 p-3"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <span className="text-terminal-green text-sm font-semibold mr-2">
                  {review.user}
                </span>
                <div className="flex items-center">
                  {renderStars(review.rating)}
                </div>
              </div>
              <span className="text-xs text-muted">
                {formatDate(review.created_at)}
              </span>
            </div>
            {review.feedback && (
              <p className="text-sm text-terminal-white">{review.feedback}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
