import Terminal from "../components/Terminal";
import { teamInfo } from "../data/mockData";

const Team = () => {
  const calculatePercentage = (solved, total) => {
    return (solved / total) * 100;
  };

  return (
    <div className="container">
      <h1 className="terminal-text text-2xl mb-6">Team</h1>

      <div className="card mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl mb-2">{teamInfo.name}</h2>
            <p className="text-muted">Rank: #{teamInfo.rank}</p>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <div className="terminal-text text-3xl mb-1">{teamInfo.score}</div>
            <div className="text-muted">Total Score</div>
          </div>
        </div>

        <h3 className="terminal-text text-lg mb-3">Challenge Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.entries(teamInfo.stats).map(([category, data]) => (
            <div key={category} className="bg-secondary-bg p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="capitalize">{category}</span>
                <span className="terminal-text">
                  {data.solved}/{data.total}
                </span>
              </div>
              <div className="w-full bg-tertiary-bg h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-terminal-green"
                  style={{
                    width: `${calculatePercentage(data.solved, data.total)}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="terminal-text text-xl mb-4">Team Members</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {teamInfo.members.map((member) => (
          <div key={member.id} className="card">
            <div className="flex flex-col items-center text-center">
              <div className="text-4xl mb-3">{member.avatar}</div>
              <h3 className="text-lg mb-1">{member.username}</h3>
              <p className="text-sm text-muted mb-3">{member.role}</p>
              <div className="terminal-text text-2xl mb-2">{member.score}</div>
              <div className="text-sm text-muted">Points</div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="terminal-text text-xl mb-4">Team Activity</h2>
      <Terminal
        title="team_activity.log"
        lines={[
          "$ tail -10 /var/log/team_activity.log",
          "Loading activity log...",
          "----------------------------",
          "[2023-05-11 12:45] CaptainCyber solved 'Hidden Message' for 200 points",
          "[2023-05-11 11:30] BinaryNinja attempted 'Buffer Overflow'",
          "[2023-05-11 09:15] WebWizard solved 'XSS Challenge' for 200 points",
          "[2023-05-10 22:10] CryptoQueen attempted 'Caesar's Secret'",
          "[2023-05-10 20:45] CaptainCyber solved 'Caesar's Secret' for 100 points",
          "[2023-05-10 18:20] BinaryNinja downloaded 'Buffer Overflow' challenge files",
          "[2023-05-10 16:55] WebWizard downloaded 'XSS Challenge' challenge files",
          "----------------------------",
          "$ _",
        ]}
      />
    </div>
  );
};

export default Team;
