import Terminal from "../components/Terminal";
import { userProfile } from "../data/mockData";

const ProfileEnhanced = () => {
  const calculatePercentage = (solved, total) => {
    return (solved / total) * 100;
  };

  // Mock data for the new fields (in a real app, this would come from userProfile)
  const userBio =
    "Cybersecurity enthusiast with a passion for CTF competitions. Specializing in web exploitation and cryptography challenges.";
  const userCountry = "Singapore";

  return (
    <div className="container">
      <h1 className="terminal-text text-2xl mb-6">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="md:col-span-1">
          <div className="card sticky top-4">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="text-5xl mb-4">{userProfile.avatar}</div>
              <h2 className="text-xl mb-1">{userProfile.username}</h2>
              <p className="text-sm text-muted mb-4">{userProfile.role}</p>
              <div className="terminal-text text-2xl mb-1">
                {userProfile.score}
              </div>
              <p className="text-sm text-muted">Total Points</p>
            </div>

            {/* Bio Section - New */}
            <div className="border-t border-border-color pt-4 mb-4">
              <h3 className="terminal-text text-lg mb-2 mt-2">Bio</h3>
              <p className="text-sm mb-4">{userBio}</p>
            </div>

            <div className="border-t border-border-color pt-4 mb-4">
              <div className="flex justify-between mb-2 mt-2">
                <span className="text-muted">Team</span>
                <span>{userProfile.team}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted">Rank</span>
                <span>#{userProfile.rank}</span>
              </div>
              {/* Country Field - New */}
              <div className="flex justify-between mb-2">
                <span className="text-muted">Country</span>
                <span>{userCountry}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted">Joined</span>
                <span>{userProfile.joinDate}</span>
              </div>
            </div>

            <div className="border-t border-border-color pt-4">
              <h3 className="terminal-text text-lg mb-3 mt-2">Stats</h3>

              {Object.entries(userProfile.stats.categories).map(
                ([category, data]) => (
                  <div key={category} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="capitalize">{category}</span>
                      <span className="terminal-text">
                        {data.solved}/{data.total}
                      </span>
                    </div>
                    <div className="w-full bg-tertiary-bg h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-terminal-green"
                        style={{
                          width: `${calculatePercentage(
                            data.solved,
                            data.total
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Solved Challenges & Activity */}
        <div className="md:col-span-2">
          <div className="card mb-6">
            <h2 className="terminal-text text-xl mb-4">Solved Challenges</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-color">
                    <th className="text-left py-2 px-4 text-muted">
                      Challenge
                    </th>
                    <th className="text-left py-2 px-4 text-muted">Category</th>
                    <th className="text-left py-2 px-4 text-muted">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {userProfile.solvedChallenges.map((challenge) => (
                    <tr
                      key={challenge.id}
                      className="border-b border-border-color"
                    >
                      <td className="py-3 px-4">{challenge.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-block px-2 py-1 rounded-full text-xs"
                          style={{ backgroundColor: "var(--secondary-bg)" }}
                        >
                          {challenge.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 terminal-text">
                        {challenge.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h2 className="terminal-text text-xl mb-4">Activity Log</h2>
          <Terminal
            title="user_activity.log"
            lines={[
              "$ tail -10 /var/log/user/CaptainCyber_activity.log",
              "Loading user activity...",
              "----------------------------",
              "[2023-05-11 12:45] Solved 'Hidden Message' for 200 points",
              "[2023-05-11 10:30] Attempted 'Memory Dump'",
              "[2023-05-11 09:15] Downloaded 'Memory Dump' challenge files",
              "[2023-05-10 22:10] Viewed hints for 'Caesar's Secret'",
              "[2023-05-10 20:45] Solved 'Caesar's Secret' for 100 points",
              "[2023-05-10 18:20] Attempted 'Caesar's Secret'",
              "[2023-05-10 16:55] Downloaded 'Caesar's Secret' challenge files",
              "----------------------------",
              "$ _",
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileEnhanced;
