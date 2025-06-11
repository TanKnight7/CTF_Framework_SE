import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllSubmissions } from "../services/apiCTF";
import { toast } from "react-toastify";
import "../styles/global.css";

const Admin_Submissions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterChallenge, setFilterChallenge] = useState("all");
  const [sortBy, setSortBy] = useState("submittion_time");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch all submissions
  const {
    data: submissions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-submissions"],
    queryFn: getAllSubmissions,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get unique challenges for filter
  const uniqueChallenges = submissions
    ? [...new Set(submissions.map((sub) => sub.challenge.title))]
    : [];

  // Filter and sort submissions
  const filteredSubmissions =
    submissions?.filter((submission) => {
      const matchesSearch =
        submission.submitted_by?.username
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        submission.challenge?.title
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        submission.flag?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || submission.status === filterStatus;
      const matchesChallenge =
        filterChallenge === "all" ||
        submission.challenge?.title === filterChallenge;

      return matchesSearch && matchesStatus && matchesChallenge;
    }) || [];

  // Sort submissions
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === "submittion_time") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortBy === "challenge.point") {
      aValue = a.challenge?.point || 0;
      bValue = b.challenge?.point || 0;
    } else if (sortBy === "challenge.difficulty") {
      aValue = a.challenge?.difficulty || 0;
      bValue = b.challenge?.difficulty || 0;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      correct: { className: "badge-blue", text: "Correct" },
      incorrect: { className: "badge-red", text: "Incorrect" },
      pending: { className: "badge-purple", text: "Pending" },
    };

    const config = statusConfig[status] || { className: "badge", text: status };

    return <span className={`badge ${config.className}`}>{config.text}</span>;
  };

  // Get difficulty badge
  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      1: { className: "badge-blue", text: "Easy" },
      2: { className: "badge-purple", text: "Medium" },
      3: { className: "badge-red", text: "Hard" },
      4: { className: "badge-red", text: "Expert" },
      5: { className: "badge-red", text: "Master" },
    };

    const config = difficultyConfig[difficulty] || {
      className: "badge",
      text: `Level ${difficulty}`,
    };

    return <span className={`badge ${config.className}`}>{config.text}</span>;
  };

  // Get category badge
  const getCategoryBadge = (category) => {
    return (
      <span className="badge badge-blue">
        {category?.toUpperCase() || "Unknown"}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card">
            <div className="text-center">
              <div className="terminal-text">Loading submissions...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card">
            <div className="text-center">
              <div className="text-muted">
                Error loading submissions: {error?.message}
              </div>
              <button onClick={() => refetch()} className="filter-button mt-4">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold terminal-text mb-2">
                Submission Management
              </h1>
              <p className="text-muted">
                Monitor and analyze challenge submissions in real-time
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-terminal-green">
                {sortedSubmissions.length}
              </div>
              <div className="text-muted">submissions found</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Username, challenge, or flag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="challenge-search-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="challenge-search-input"
              >
                <option value="all">All Status</option>
                <option value="correct">Correct</option>
                <option value="incorrect">Incorrect</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Challenge
              </label>
              <select
                value={filterChallenge}
                onChange={(e) => setFilterChallenge(e.target.value)}
                className="challenge-search-input"
              >
                <option value="all">All Challenges</option>
                {uniqueChallenges.map((challenge) => (
                  <option key={challenge} value={challenge}>
                    {challenge}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Sort By
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="challenge-search-input"
              >
                <option value="submittion_time-desc">Newest First</option>
                <option value="submittion_time-asc">Oldest First</option>
                <option value="challenge.point-desc">
                  Points (High to Low)
                </option>
                <option value="challenge.point-asc">
                  Points (Low to High)
                </option>
                <option value="challenge.difficulty-desc">
                  Difficulty (High to Low)
                </option>
                <option value="challenge.difficulty-asc">
                  Difficulty (Low to High)
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="card mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Submission
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Challenge
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Submitted By
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Flag
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSubmissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="border-b border-border-color interactive-row hover:bg-secondary-bg transition-colors duration-200"
                  >
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-tertiary-bg flex items-center justify-center mr-4 border-2 border-border-color">
                          <span className="text-lg font-bold text-terminal-green">
                            #{submission.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-lg mb-2">
                          {submission.challenge?.title}
                        </div>
                        <div className="flex gap-2 mb-2">
                          {getCategoryBadge(submission.challenge?.category)}
                          {getDifficultyBadge(submission.challenge?.difficulty)}
                        </div>
                        <div className="text-lg font-bold text-terminal-green">
                          {submission.challenge?.point || 0} points
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-lg">
                          {submission.submitted_by?.username}
                        </div>
                        <div className="text-sm text-muted">
                          {submission.submitted_by?.total_point || 0} pts
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-sm bg-tertiary-bg p-3 rounded-lg border border-border-color max-w-xs overflow-hidden">
                        <div className="truncate" title={submission.flag}>
                          {submission.flag}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        {getStatusBadge(submission.status)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted">
                        {formatDate(submission.submittion_time)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedSubmissions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted text-lg">No submissions found</div>
              <div className="text-sm text-muted mt-2">
                Try adjusting your search or filter criteria
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-terminal-green mb-2">
              {submissions?.length || 0}
            </div>
            <div className="text-muted">Total Submissions</div>
          </div>
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-accent-blue mb-2">
              {submissions?.filter((s) => s.status === "correct").length || 0}
            </div>
            <div className="text-muted">Correct</div>
          </div>
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-accent-red mb-2">
              {submissions?.filter((s) => s.status === "incorrect").length || 0}
            </div>
            <div className="text-muted">Incorrect</div>
          </div>
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-accent-purple mb-2">
              {uniqueChallenges.length}
            </div>
            <div className="text-muted">Challenges</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin_Submissions;
