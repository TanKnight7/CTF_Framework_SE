import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getChallenges, getCategories } from "../services/apiCTF";

const Challenges = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedChallenge, setSelectedChallenge] = useState(null);

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
    isPending: isCategoriesPending,
    isError: isCategoriesError,
    error: categoriesError,
    data: challengeCategories,
  } = useQuery({
    queryKey: ["getCategories"],
    queryFn: getCategories,
  });

  if (isChallengesPending || isCategoriesPending) {
    return "Data loading..";
  }
  const filteredChallenges = challenges.filter((challenge) => {
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
  });

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
                      {/* {challenge.solved && (
                      <span className="text-xs px-2 py-1 rounded-full bg-terminal-green text-terminal-black">
                        Solved
                      </span>
                    )} */}
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
                        <div className="flex items-center mt-4">
                          <span className="terminal-text text-lg mr-4">
                            {selectedChallenge.point} pts
                          </span>
                          <span className="text-sm text-muted">
                            Category: {selectedChallenge.category}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4 p-3 bg-tertiary-bg rounded-md">
                        <h3 className="text-sm text-muted mb-2">Attachment</h3>
                        <div className="flex items-center">
                          <i className="fas fa-file-download mr-2"></i>
                          <span className="terminal-text">
                            {selectedChallenge.attachment}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-sm text-muted mb-2">Submit Flag</h3>
                        <div className="flex">
                          <input
                            type="text"
                            placeholder="CTF{your_flag_here}"
                            className="bg-tertiary-bg border border-border-color p-2 rounded-l-md flex-1 text-terminal-white"
                          />
                          <button className="bg-terminal-green text-terminal-black p-2 rounded-r-md">
                            Submit
                          </button>
                        </div>
                      </div>

                      {/* {selectedChallenge.solved && (
                      <div className="p-3 bg-tertiary-bg rounded-md">
                        <div className="flex items-center text-terminal-green">
                          <i className="fas fa-check-circle mr-2"></i>
                          <span>Challenge Solved!</span>
                        </div>
                      </div>
                    )} */}
                    </div>
                  )}
                </div>
              ))}

            {filteredChallenges && filteredChallenges.length === 0 && (
              <div className="col-span-2 text-center p-8">
                <p className="terminal-text">
                  No challenges match your filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;
