import React from "react";

const ReviewsModal = ({ isOpen, onClose, challenge }) => {
  if (!isOpen || !challenge) {
    return null;
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
        className="bg-secondary-bg border border-border-color rounded-lg p-8 shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
        style={{
          backgroundColor: "var(--secondary-bg)",
          borderColor: "var(--border-color)",
          maxWidth: "600px",
          width: "90%",
        }}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-terminal-green">
            Reviews for {challenge.title}
          </h2>
        </div>

        {!challenge.reviews || challenge.reviews.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-comments text-4xl text-muted mb-4"></i>
            <p className="text-muted text-lg">No reviews yet</p>
            <p className="text-sm text-muted mt-2">
              Be the first to review this challenge!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {challenge.reviews.map((review) => (
              <div
                key={review.id}
                className="border border-border-color rounded-md p-4 mb-3"
                style={{
                  backgroundColor: "var(--tertiary-bg)",
                }}
              >
                <div className="flex justify-between items-start mb-3">
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
                  <p className="text-sm text-terminal-white leading-relaxed">
                    {review.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex w-full">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md font-semibold transition-all duration-200 border-2 hover:scale-105 w-full mt-2"
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;
