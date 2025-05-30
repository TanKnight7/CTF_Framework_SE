import { useState, useEffect, useRef } from "react";
import Terminal from "../components/Terminal"; // Assuming Terminal component exists
import { leaderboardData } from "../data/mockData"; // Assuming mockData exists

// Helper function to format a single team line
const formatTeamLine = (team) => {
  return `${team.rank.toString().padEnd(5)}| ${team.team.padEnd(
    20
  )}| ${team.score.toString().padEnd(8)}| ${team.solved}`;
};

const LeaderboardV2 = () => {
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLines, setTerminalLines] = useState([
    "$ cat /leaderboard/top_10.log",
  ]);
  const terminalContentRef = useRef([
    "Loading leaderboard data...",
    "----------------------------",
    "RANK | TEAM               | SCORE  | SOLVED",
    "-----+--------------------+--------+-------",
    ...leaderboardData.slice(0, 10).map(formatTeamLine),
    "----------------------------",
    "$ _",
  ]);
  const typingIntervalRef = useRef(null);
  const lineIndexRef = useRef(0);
  const charIndexRef = useRef(0);

  // Effect for scroll-triggered terminal display
  useEffect(() => {
    const handleScroll = () => {
      // Show terminal slightly earlier
      if (window.scrollY > 150 && !showTerminal) {
        setShowTerminal(true);
      } else if (window.scrollY <= 150 && showTerminal) {
        // Option to hide terminal when scrolling back up, though original didn't
        // setShowTerminal(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showTerminal]);

  // Effect for terminal typing animation
  useEffect(() => {
    if (showTerminal) {
      // Clear any existing interval
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }

      // Reset state if terminal was previously hidden/completed
      if (lineIndexRef.current >= terminalContentRef.current.length) {
        setTerminalLines(["$ cat /leaderboard/top_10.log"]);
        lineIndexRef.current = 0;
        charIndexRef.current = 0;
      }

      typingIntervalRef.current = setInterval(() => {
        setTerminalLines((prevLines) => {
          // Check if all lines are typed
          if (lineIndexRef.current >= terminalContentRef.current.length) {
            clearInterval(typingIntervalRef.current);
            return prevLines;
          }

          const currentLine = terminalContentRef.current[lineIndexRef.current];

          // Add line by line for brevity
          if (charIndexRef.current === 0) {
            const newLine = currentLine;
            lineIndexRef.current++;
            return [...prevLines, newLine];
          } else {
            // This block isn't reached with line-by-line typing
            lineIndexRef.current++;
            return prevLines;
          }
        });
      }, 150); // Adjust typing speed
    } else {
      // Clear interval if terminal is hidden
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    }

    // Cleanup interval
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [showTerminal]);

  return (
    <div className="container relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="animated-grid-background"></div>

      {/* Ensure content is above the background */}
      <div className="relative z-10">
        <h1 className="terminal-text text-3xl mb-6 main-title-glow">
          Leaderboard
        </h1>

        {/* Redesigned Visual Podium */}
        <div className="card card-enhanced mb-8 p-6">
          <div className="podium-container">
            {/* Second Place */}
            <div className="podium-block podium-block-2 animate-rise-2">
              <div className="podium-team podium-team-2">
                {leaderboardData[1].team}
              </div>
              <div className="podium-rank podium-rank-2">2</div>
            </div>
            {/* First Place */}
            <div className="podium-block podium-block-1 animate-rise-1">
              <div className="podium-team podium-team-1">
                {leaderboardData[0].team}
              </div>
              <div className="podium-rank podium-rank-1">1</div>
            </div>
            {/* Third Place */}
            <div className="podium-block podium-block-3 animate-rise-3">
              <div className="podium-team podium-team-3">
                {leaderboardData[2].team}
              </div>
              <div className="podium-rank podium-rank-3">3</div>
            </div>
            {/* Podium Base */}
            <div className="podium-base"></div>
          </div>

          {/* Top 3 team info - Kept original simple display below podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 border-t border-border-color pt-4">
            {/* First Place Info */}
            <div className="text-center p-2">
              <div className="text-gold text-xl font-bold">
                {leaderboardData[0].team}
              </div>
              <div className="text-gold">{leaderboardData[0].score} pts</div>
              <div className="text-sm text-muted">
                {leaderboardData[0].solved} challenges
              </div>
            </div>
            {/* Second Place Info */}
            <div className="text-center p-2">
              <div className="text-silver text-xl font-bold">
                {leaderboardData[1].team}
              </div>
              <div className="text-silver">{leaderboardData[1].score} pts</div>
              <div className="text-sm text-muted">
                {leaderboardData[1].solved} challenges
              </div>
            </div>
            {/* Third Place Info */}
            <div className="text-center p-2">
              <div className="text-bronze text-xl font-bold">
                {leaderboardData[2].team}
              </div>
              <div className="text-bronze">{leaderboardData[2].score} pts</div>
              <div className="text-sm text-muted">
                {leaderboardData[2].solved} challenges
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Leaderboard Table */}
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
                {leaderboardData.map((team) => (
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
                    <td className="py-3 px-4 text-text-primary">{team.team}</td>
                    <td className="py-3 px-4 text-text-primary">
                      {team.score}
                    </td>
                    <td className="py-3 px-4 text-text-primary">
                      {team.solved}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enhanced Terminal view */}
      <div
        className={`fixed bottom-5 right-5 w-96 transition-opacity duration-500 z-50 terminal-enhanced ${
          showTerminal ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Terminal title="top_teams.sh" lines={terminalLines} />
      </div>
    </div>
  );
};

export default LeaderboardV2;
