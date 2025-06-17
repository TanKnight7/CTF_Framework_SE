import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getChallenges,
  getCategories,
  getSolved,
  submitChallengeReview,
  getProfile,
} from "../services/apiCTF";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { submitFlag } from "../services/apiCTF";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import RatingModal from "../components/RatingModal";
import Reviews from "../components/Reviews";
import ReviewsModal from "../components/ReviewsModal";

const Challenges = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewChallengeId, setReviewChallengeId] = useState(null);
  const [solvedChallengesState, setSolvedChallengesState] = useState([]);
  const [justSolvedChallenge, setJustSolvedChallenge] = useState(null);
  const [reviewedChallenges, setReviewedChallenges] = useState([]);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [selectedChallengeForReviews, setSelectedChallengeForReviews] =
    useState(null);
  const queryClient = useQueryClient();
  const {
    isPending: isChallengesPending,
    isError: isChallengesError,
    error: challengesError,
    data: challenges,
  } = useQuery({
    queryKey: ["getChallenges"],
    queryFn: getChallenges,
  });

  const {
    isPending: isSolvedPending,
    isError: isSolvedError,
    error: solvedError,
    data: solved,
  } = useQuery({
    queryKey: ["getSolved"],
    queryFn: getSolved,
  });

  const {
    isPending: isCategoriesPending,
    isError: isCategoriesError,
    error: categoriesError,
    data: challengeCategories,
  } = useQuery({
    queryKey: ["getCategories"],
    queryFn: getCategories,
  });

  const {
    isPending: isProfilePending,
    isError: isProfileError,
    error: profileError,
    data: profile,
  } = useQuery({
    queryKey: ["getProfile"],
    queryFn: getProfile,
  });
  const isChallengeSolved = (challengeId) => {
    // Check both the API data and the local state
    const apiSolved =
      Array.isArray(solvedChallenges) &&
      solvedChallenges.some((item) => item.challenge.id === challengeId);
    const stateSolved = solvedChallengesState.some(
      (item) => item.challenge.id === challengeId
    );
    return apiSolved || stateSolved;
  };

  const hasUserReviewed = (challenge) => {
    if (!profile) return false;

    // Check if reviewed in current session
    const reviewedInSession = reviewedChallenges.includes(challenge.id);
    if (reviewedInSession) return true;

    // Check if reviewed in API data

    if (challenge.reviews) {
      return challenge.reviews.some(
        (review) => review.user === profile.username
      );
    }

    return false;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const mutation = useMutation({
    mutationFn: (flagData) => submitFlag(flagData),
    onSuccess: (responseData) => {
      if (responseData.error) {
        return;
      }

      const message = responseData.message?.toLowerCase();
      const success = responseData.success?.toLowerCase();

      if (message === "wrong answer.") {
        // toast.error("❌ Wrong answer.");
      } else if (message === "correct." || success === "correct.") {
        toast.success("✅ Correct flag! You can now review this challenge.");
        // Immediately add the challenge to solved challenges
        if (selectedChallenge) {
          const newSolvedChallenge = {
            challenge: {
              id: selectedChallenge.id,
              title: selectedChallenge.title,
              point: selectedChallenge.point,
              category: selectedChallenge.category,
            },
            solved_at: new Date().toISOString(),
          };
          // Update the solved challenges state
          setSolvedChallengesState((prev) => [...prev, newSolvedChallenge]);
          setJustSolvedChallenge(selectedChallenge);

          // Clear the success message after 10 seconds
          setTimeout(() => {
            setJustSolvedChallenge(null);
          }, 10000);
        }
        // Don't reload the page immediately, let user see the review button
        setTimeout(() => {
          window.location.reload();
        }, 30000); // Give user 30 seconds to review
      } else {
        // toast.info(message || "⚠️ Unexpected response.");
      }

      reset();
    },
    onError: (error) => {
      // toast.error("🚨 Submission failed.");
      console.error("Flag submission error:", error);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ challengeId, reviewData }) =>
      submitChallengeReview(challengeId, reviewData),
    onSuccess: (responseData, variables) => {
      if (responseData.error) {
        toast.error(`❌ ${responseData.error}`);
        return;
      }
      toast.success("✅ Review submitted successfully!");

      // Add to reviewed challenges state using the challengeId from the mutation
      setReviewedChallenges((prev) => [...prev, variables.challengeId]);

      setIsReviewModalOpen(false);
      setReviewChallengeId(null);
      setJustSolvedChallenge(null); // Clear the success message

      // Invalidate challenges query to refresh the data without page reload
      queryClient.invalidateQueries({ queryKey: ["getChallenges"] });
    },
    onError: (error) => {
      toast.error("🚨 Failed to submit review.");
      console.error("Review submission error:", error);
    },
  });

  const handleReviewSubmit = (challengeId, reviewData) => {
    reviewMutation.mutate({ challengeId, reviewData });
  };

  const openReviewModal = (challengeId) => {
    setReviewChallengeId(challengeId);
    setIsReviewModalOpen(true);
  };

  const openReviewsModal = (challenge) => {
    setSelectedChallengeForReviews(challenge);
    setIsReviewsModalOpen(true);
  };

  function onSubmit(data) {
    if (!selectedChallenge) {
      toast.warn("⚠️ Please select a challenge first.");
      return;
    }

    const payload = {
      challenge_id: selectedChallenge.id,
      flag: data.flag,
    };

    mutation.mutate(payload);
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "var(--terminal-green)";
      case "medium":
        return "var(--accent-blue)";
      case "hard":
        return "var(--accent-purple)";
      default:
        return "var(--terminal-green)";
    }
  };

  // Use state for solved challenges and update it when solved data changes
  useEffect(() => {
    if (!solved?.message && solved) {
      setSolvedChallengesState(solved);
    }
  }, [solved]);

  // Initialize reviewed challenges from API data
  useEffect(() => {
    if (challenges && profile && !challenges.error) {
      const reviewedFromAPI = challenges
        .filter(
          (challenge) =>
            challenge.reviews &&
            challenge.reviews.some((review) => review.user === profile.username)
        )
        .map((challenge) => challenge.id);

      setReviewedChallenges(reviewedFromAPI);
    }
  }, [challenges, profile]);

  if (
    isChallengesPending ||
    isCategoriesPending ||
    isProfilePending ||
    isSolvedPending
  ) {
    return "Data loading..";
  }

  let solvedChallenges = [];
  if (!solved?.message) {
    solvedChallenges = solved;
  }

  let filteredChallenges = [];
  if (challenges.error !== "CTF NOT STARTED YET.") {
    filteredChallenges = challenges
      ? challenges.filter((challenge) => {
          const category = challenge.category.toLowerCase();
          if (
            selectedCategory !== "all" &&
            !category.includes(selectedCategory.toLowerCase())
          )
            return false;
          if (
            selectedDifficulty !== "all" &&
            challenge.difficulty !== selectedDifficulty
          )
            return false;
          return true;
        })
      : [];
  }

  return (
    <div className="container">
      <h1 className="terminal-text text-2xl mb-6">Challenges</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-wrap gap-4 mb-4">
              <button
                className={`px-3 py-2 rounded-md text-sm ${
                  selectedCategory === "all"
                    ? "bg-terminal-green text-terminal-black"
                    : "bg-secondary-bg text-terminal-green border border-border-color"
                }`}
                onClick={() => setSelectedCategory("all")}
              >
                All Categories
              </button>

              {challengeCategories &&
                challengeCategories.map((category) => (
                  <button
                    key={category.name}
                    className={`px-3 py-2 rounded-md text-sm ${
                      selectedCategory === category.name
                        ? "bg-terminal-green text-terminal-black"
                        : "bg-secondary-bg text-terminal-green border border-border-color"
                    }`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <i className={`fas ${category.icon} mr-2`}></i>

                    {category.name}
                  </button>
                ))}
            </div>

            <div className="flex gap-4">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-secondary-bg p-2 rounded-md border border-border-color text-sm bg-secondary-bg text-terminal-green border-border-color"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Challenge Grid */}
          <div className="flex flex-col gap-4">
            {filteredChallenges &&
              filteredChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="flex flex-col md:flex-row gap-4"
                >
                  {/* Challenge Card */}
                  <div
                    className={`card cursor-pointer w-full md:w-1/2 ${
                      selectedChallenge?.id === challenge.id
                        ? "border-terminal-green"
                        : ""
                    }`}
                    id={challenge.title}
                    onClick={() =>
                      setSelectedChallenge(
                        selectedChallenge?.id === challenge.id
                          ? null
                          : challenge
                      )
                    }
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs text-white"
                        style={{
                          backgroundColor:
                            challengeCategories.find(
                              (category) => category.name === challenge.category
                            )?.color || "#607d8b", // fallback color,
                        }}
                      >
                        {challenge.category}
                      </span>
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: "var(--secondary-bg)",
                          color: getDifficultyColor(challenge.difficulty),
                        }}
                      >
                        {challenge.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg mb-2">{challenge.title}</h3>
                    <p className="text-sm text-muted mb-3">
                      {challenge.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="terminal-text">
                        {challenge.point} pts
                      </span>
                      {isChallengeSolved(challenge.id) && (
                        <span className="text-xs px-2 py-1 rounded-full bg-terminal-green text-terminal-black">
                          Solved
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Challenge Detail (sebelah kanan) */}
                  {selectedChallenge?.id === challenge.id && (
                    <div className="card w-full md:w-1/2 animate-fadeIn">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="terminal-text text-xl">
                          {selectedChallenge.title}
                        </h2>
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: "var(--secondary-bg)",
                            color: getDifficultyColor(
                              selectedChallenge.difficulty
                            ),
                          }}
                        >
                          {selectedChallenge.difficulty}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="mb-2">{selectedChallenge.description}</p>

                        {/* Success message when challenge is just solved */}
                        {justSolvedChallenge?.id === selectedChallenge.id && (
                          <div className="mb-4 p-3 bg-opacity-20 rounded-md">
                            <p className="text-terminal-green text-sm font-semibold">
                              <i className="fas fa-check-circle mr-2"></i>
                              Challenge solved successfully! You can now review
                              this challenge.
                            </p>
                          </div>
                        )}

                        <div className="flex items-center mt-4">
                          <span className="terminal-text text-lg mr-4">
                            {selectedChallenge.point} pts
                          </span>
                          <span className="text-sm text-muted mr-4">
                            Category: {selectedChallenge.category}
                          </span>
                          {selectedChallenge.rating > 0 && (
                            <div className="flex items-center">
                              <span className="text-sm text-muted mr-1">
                                Rating:
                              </span>
                              <span className="text-terminal-green text-sm mr-1">
                                {selectedChallenge.rating.toFixed(1)}
                              </span>
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, index) => (
                                  <span
                                    key={index}
                                    className={`text-xs ${
                                      index <
                                      Math.round(selectedChallenge.rating)
                                        ? "text-terminal-green"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reviews Section
                      <Reviews reviews={selectedChallenge.reviews} /> */}
                      {/* Reviews Button */}
                      <div className="mb-4">
                        <button
                          onClick={() => openReviewsModal(selectedChallenge)}
                          className="w-full p-2 rounded-md hover:opacity-80 transition-colors duration-200 flex items-center justify-center"
                          style={{
                            backgroundColor: "var(--tertiary-bg)",
                            color: "var(--terminal-white)",
                            border: "1px solid var(--border-color)",
                          }}
                        >
                          <i className="fas fa-comments mr-2"></i>
                          View Reviews ({selectedChallenge.reviews?.length || 0}
                          )
                        </button>
                      </div>

                      <div className="mb-4 p-3 bg-tertiary-bg rounded-md">
                        <h3 className="text-sm text-muted mb-2">Attachment</h3>
                        <div className="flex items-center">
                          <span className="terminal-text">
                            {selectedChallenge.attachments &&
                            selectedChallenge.attachments.length > 0 ? (
                              selectedChallenge.attachments.map(
                                (attachment) => (
                                  <div
                                    key={attachment.file}
                                    className="attachment-item"
                                  >
                                    <i className="fas fa-file-download mr-2"></i>
                                    <strong>{attachment.name}</strong>:{" "}
                                    <a
                                      href={attachment.file}
                                      download
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-terminal-green underline"
                                    >
                                      Download
                                    </a>
                                  </div>
                                )
                              )
                            ) : (
                              <span>No attachments available.</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                          {!isChallengeSolved(selectedChallenge.id) ? (
                            <>
                              <h3 className="text-sm text-muted mb-2">
                                Submit Flag
                              </h3>
                              <div className="flex">
                                <input
                                  type="text"
                                  placeholder="CTF{your_flag_here}"
                                  className="bg-tertiary-bg border border-border-color p-2 rounded-l-md flex-1 text-terminal-white"
                                  {...register("flag", {
                                    required: "Flag is Required",
                                  })}
                                />
                                <button className="bg-terminal-green text-terminal-black p-2 rounded-r-md">
                                  Submit
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="p-3 bg-opacity-20 rounded-md">
                              <p className="text-terminal-green text-sm font-semibold">
                                <i className="fas fa-check-circle mr-2"></i>
                                Challenge already solved!
                              </p>
                            </div>
                          )}
                        </div>
                      </form>

                      {/* Review Button - Only show if challenge is solved and not already reviewed */}
                      {isChallengeSolved(selectedChallenge.id) &&
                        !hasUserReviewed(selectedChallenge) && (
                          <div className="mb-4">
                            <button
                              onClick={() =>
                                openReviewModal(selectedChallenge.id)
                              }
                              className={`w-full p-2 rounded-md hover:opacity-80 transition-colors duration-200 flex items-center justify-center ${
                                justSolvedChallenge?.id === selectedChallenge.id
                                  ? "animate-pulse"
                                  : ""
                              }`}
                              style={{
                                backgroundColor: "var(--accent-blue)",
                                color: "var(--terminal-white)",
                              }}
                            >
                              <i className="fas fa-star mr-2"></i>
                              Review Challenge
                            </button>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))}

            {challenges && challenges?.error && (
              <div className="col-span-2 text-center p-8">
                <p className="terminal-text">{challenges.error}</p>
              </div>
            )}
            {!challenges?.error &&
              filteredChallenges &&
              filteredChallenges.length === 0 && (
                <div className="col-span-2 text-center p-8">
                  <p className="terminal-text">
                    No challenges match your filters
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewChallengeId(null);
        }}
        onSubmit={handleReviewSubmit}
        challengeId={reviewChallengeId}
      />

      {/* Reviews Modal */}
      <ReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={() => {
          setIsReviewsModalOpen(false);
          setSelectedChallengeForReviews(null);
        }}
        challenge={selectedChallengeForReviews}
      />
    </div>
  );
};

export default Challenges;
