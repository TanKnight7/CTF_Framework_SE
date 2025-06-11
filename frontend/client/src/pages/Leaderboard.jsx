import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Terminal from "../components/Terminal";
import { getLeaderboard } from "../services/apiCTF";

const LeaderboardV2 = () => {
  const {
    isPending: isLeaderboardPending,
    isError: isLeaderboardError,
    error: leaderboardError,
    data: leaderboard,
  } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboard,
  });

  if (isLeaderboardPending) {
    return "Data loading..";
  }

  return (
    <div className="container relative overflow-hidden">
      <div className="animated-grid-background"></div>

      <div className="relative z-10">
        <h1 className="terminal-text text-3xl mb-6 main-title-glow">
          Leaderboard
        </h1>

        <div className="card card-enhanced mb-8 p-6">
          <div className="podium-container">
            <div className="podium-block podium-block-2 animate-rise-2">
              <div className="podium-team podium-team-2">
                {leaderboard[1]?.name}
              </div>
              <div className="podium-rank podium-rank-2">2</div>
              <div className="podium-team podium-team-2 text-3xl font-bold">
                {leaderboard[1]?.total_point || 0} Points
              </div>
            </div>

            <div className="podium-block podium-block-1 animate-rise-1">
              <div className="podium-team podium-team-1">
                {leaderboard[0]?.name}
              </div>
              <div className="podium-rank podium-rank-1">1</div>
              <div className="podium-team podium-team-1">
                {leaderboard[0]?.total_point || 0} Points
              </div>
            </div>

            <div className="podium-block podium-block-3 animate-rise-3">
              <div className="podium-team podium-team-3 text-3xl font-bold">
                {leaderboard[2]?.name}
              </div>
              <div className="podium-rank podium-rank-3">3</div>
              <div className="podium-team podium-team-3">
                {leaderboard[2]?.total_point || 0} Points
              </div>
            </div>

            <div className="podium-base"></div>
          </div>
        </div>

        <div className="card card-enhanced mb-8 p-4">
          <h2 className="terminal-text text-xl mb-4 table-header-glow">
            Full Rankings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="text-left py-2 px-4 terminal-text table-header-glow">
                    #
                  </th>
                  <th className="text-left py-2 px-4 terminal-text table-header-glow">
                    Team
                  </th>
                  <th className="text-left py-2 px-4 terminal-text table-header-glow">
                    Score
                  </th>
                  <th className="text-left py-2 px-4 terminal-text table-header-glow">
                    Solved
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard &&
                  leaderboard.map((team) => (
                    <tr
                      key={team.id}
                      className="border-b border-border-color table-row-enhanced"
                    >
                      <td className="py-3 px-4">
                        {team.rank <= 3 ? (
                          <span
                            className={`font-bold ${
                              team.rank === 1
                                ? "text-gold glow-gold"
                                : team.rank === 2
                                ? "text-silver glow-silver"
                                : "text-bronze glow-bronze"
                            }`}
                          >
                            {team.rank}
                          </span>
                        ) : (
                          <span className="text-text-primary">{team.rank}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-text-primary">
                        {team.name}
                      </td>
                      <td className="py-3 px-4 text-text-primary">
                        {team.total_point}
                      </td>
                      <td className="py-3 px-4 text-text-primary">
                        {team.solve_count}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardV2;
