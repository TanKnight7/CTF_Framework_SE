import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "../services/apiCTF";
import { toast } from "react-toastify";
import "../styles/global.css";

const Admin_Leaderboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRank, setFilterRank] = useState("all");
  const [sortBy, setSortBy] = useState("rank");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch leaderboard data
  const {
    data: leaderboard,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-leaderboard"],
    queryFn: getLeaderboard,
    staleTime: 2 * 60 * 1000,
  });

  // Filter and sort leaderboard
  const filteredLeaderboard =
    leaderboard?.filter((team) => {
      const matchesSearch = team.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesRank =
        filterRank === "all" ||
        (filterRank === "top3" && team.rank <= 3) ||
        (filterRank === "top10" && team.rank <= 10) ||
        (filterRank === "top50" && team.rank <= 50);

      return matchesSearch && matchesRank;
    }) || [];

  // Sort leaderboard
  const sortedLeaderboard = [...filteredLeaderboard].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (
      sortBy === "rank" ||
      sortBy === "total_point" ||
      sortBy === "solve_count"
    ) {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Get rank badge with appropriate styling
  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span
          className="badge badge-gold"
          style={{
            backgroundColor: "#ffd700",
            color: "#000",
            boxShadow: "0 0 10px rgba(255, 215, 0, 0.5)",
          }}
        >
          🥇 {rank}
        </span>
      );
    } else if (rank === 2) {
      return (
        <span
          className="badge badge-silver"
          style={{
            backgroundColor: "#c0c0c0",
            color: "#000",
            boxShadow: "0 0 10px rgba(192, 192, 192, 0.5)",
          }}
        >
          🥈 {rank}
        </span>
      );
    } else if (rank === 3) {
      return (
        <span
          className="badge badge-bronze"
          style={{
            backgroundColor: "#cd7f32",
            color: "#fff",
            boxShadow: "0 0 10px rgba(205, 127, 50, 0.5)",
          }}
        >
          🥉 {rank}
        </span>
      );
    } else if (rank <= 10) {
      return (
        <span
          className="badge badge-blue"
          style={{
            backgroundColor: "#3b82f6",
            color: "#fff",
            boxShadow: "0 0 8px rgba(59, 130, 246, 0.3)",
          }}
        >
          #{rank}
        </span>
      );
    } else {
      return (
        <span
          className="badge"
          style={{
            backgroundColor: "var(--tertiary-bg)",
            color: "var(--text-muted)",
            border: "1px solid var(--border-color)",
          }}
        >
          #{rank}
        </span>
      );
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 1000) {
      return (
        <span
          className="badge badge-purple"
          style={{
            backgroundColor: "#8b5cf6",
            color: "#fff",
            boxShadow: "0 0 8px rgba(139, 92, 246, 0.3)",
          }}
        >
          {score} pts
        </span>
      );
    } else if (score >= 500) {
      return (
        <span
          className="badge badge-green"
          style={{
            backgroundColor: "#10b981",
            color: "#fff",
            boxShadow: "0 0 8px rgba(16, 185, 129, 0.3)",
          }}
        >
          {score} pts
        </span>
      );
    } else if (score >= 100) {
      return (
        <span
          className="badge badge-blue"
          style={{
            backgroundColor: "#3b82f6",
            color: "#fff",
            boxShadow: "0 0 8px rgba(59, 130, 246, 0.3)",
          }}
        >
          {score} pts
        </span>
      );
    } else {
      return (
        <span
          className="badge"
          style={{
            backgroundColor: "var(--tertiary-bg)",
            color: "var(--text-muted)",
            border: "1px solid var(--border-color)",
          }}
        >
          {score} pts
        </span>
      );
    }
  };

  // Calculate statistics
  const totalTeams = leaderboard?.length || 0;
  const totalPoints =
    leaderboard?.reduce((sum, team) => sum + (team.total_point || 0), 0) || 0;
  const averagePoints =
    totalTeams > 0 ? Math.round(totalPoints / totalTeams) : 0;
  const topTeam = leaderboard?.[0];
  const activeTeams =
    leaderboard?.filter((team) => team.total_point > 0).length || 0;

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card">
            <div className="text-center">
              <div className="terminal-text">Loading leaderboard...</div>
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
                Error loading leaderboard: {error?.message}
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
                Leaderboard Management
              </h1>
              <p className="text-muted">
                Monitor team rankings and competition statistics
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-terminal-green">
                {sortedLeaderboard.length}
              </div>
              <div className="text-muted">teams found</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Search Teams
              </label>
              <input
                type="text"
                placeholder="Team name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="challenge-search-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Rank Filter
              </label>
              <select
                value={filterRank}
                onChange={(e) => setFilterRank(e.target.value)}
                className="challenge-search-input"
              >
                <option value="all">All Teams</option>
                <option value="top3">Top 3</option>
                <option value="top10">Top 10</option>
                <option value="top50">Top 50</option>
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
                <option value="rank-asc">Rank (Low to High)</option>
                <option value="rank-desc">Rank (High to Low)</option>
                <option value="total_point-desc">Points (High to Low)</option>
                <option value="total_point-asc">Points (Low to High)</option>
                <option value="solve_count-desc">Solves (High to Low)</option>
                <option value="solve_count-asc">Solves (Low to High)</option>
                <option value="name-asc">Team Name (A-Z)</option>
                <option value="name-desc">Team Name (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboard && leaderboard.length >= 3 && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold terminal-text mb-4">
              🏆 Top Performers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="relative">
                  <div
                    className="w-24 h-24 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl font-bold"
                    style={{
                      background: "linear-gradient(135deg, #c0c0c0, #a0a0a0)",
                      boxShadow: "0 8px 16px rgba(192, 192, 192, 0.3)",
                      border: "3px solid #d0d0d0",
                    }}
                  >
                    🥈
                  </div>
                  <div className="text-lg font-bold text-terminal-white mb-1">
                    {leaderboard[1]?.name || "N/A"}
                  </div>
                  <div className="text-sm text-muted mb-2">2nd Place</div>
                  <div className="text-xl font-bold text-terminal-green">
                    {leaderboard[1]?.total_point || 0} pts
                  </div>
                  <div className="text-sm text-muted">
                    {leaderboard[1]?.solve_count || 0} solves
                  </div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="relative">
                  <div
                    className="w-32 h-32 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl font-bold"
                    style={{
                      background: "linear-gradient(135deg, #ffd700, #ffed4e)",
                      boxShadow: "0 12px 24px rgba(255, 215, 0, 0.4)",
                      border: "4px solid #ffed4e",
                    }}
                  >
                    🥇
                  </div>
                  <div className="text-xl font-bold text-terminal-white mb-1">
                    {leaderboard[0]?.name || "N/A"}
                  </div>
                  <div className="text-sm text-muted mb-2">🏆 Champion</div>
                  <div className="text-2xl font-bold text-terminal-green">
                    {leaderboard[0]?.total_point || 0} pts
                  </div>
                  <div className="text-sm text-muted">
                    {leaderboard[0]?.solve_count || 0} solves
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="relative">
                  <div
                    className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{
                      background: "linear-gradient(135deg, #cd7f32, #b8860b)",
                      boxShadow: "0 6px 12px rgba(205, 127, 50, 0.3)",
                      border: "3px solid #daa520",
                    }}
                  >
                    🥉
                  </div>
                  <div className="text-lg font-bold text-terminal-white mb-1">
                    {leaderboard[2]?.name || "N/A"}
                  </div>
                  <div className="text-sm text-muted mb-2">3rd Place</div>
                  <div className="text-xl font-bold text-terminal-green">
                    {leaderboard[2]?.total_point || 0} pts
                  </div>
                  <div className="text-sm text-muted">
                    {leaderboard[2]?.solve_count || 0} solves
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold terminal-text mb-4">
            📊 Full Rankings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Rank
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Team
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Score
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Challenges Solved
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedLeaderboard.map((team) => (
                  <tr
                    key={team.id}
                    className="border-b border-border-color hover:bg-secondary-bg transition-colors duration-200"
                  >
                    <td className="p-4">{getRankBadge(team.rank)}</td>
                    <td className="p-4">
                      <div className="font-medium text-terminal-white">
                        {team.name}
                      </div>
                      <div className="text-sm text-muted">
                        Team ID: {team.id}
                      </div>
                    </td>
                    <td className="p-4">{getScoreBadge(team.total_point)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-terminal-green font-medium">
                          {team.solve_count}
                        </span>
                        <span className="text-muted text-sm">challenges</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-tertiary-bg rounded-full h-2">
                          <div
                            className="bg-terminal-green h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                (team.total_point /
                                  (topTeam?.total_point || 1)) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted">
                          {Math.round(
                            (team.total_point / (topTeam?.total_point || 1)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedLeaderboard.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted text-lg">No teams found</div>
              <div className="text-sm text-muted mt-2">
                Try adjusting your search or filter criteria
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-terminal-green mb-2">
              {totalTeams}
            </div>
            <div className="text-muted">Total Teams</div>
          </div>
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-accent-blue mb-2">
              {activeTeams}
            </div>
            <div className="text-muted">Active Teams</div>
          </div>
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-accent-purple mb-2">
              {totalPoints}
            </div>
            <div className="text-muted">Total Points</div>
          </div>
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-accent-red mb-2">
              {averagePoints}
            </div>
            <div className="text-muted">Avg Points</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin_Leaderboard;
