import Terminal from "../components/Terminal";
import { useQuery } from "@tanstack/react-query";
import { getProfile, getChallengeSolvedByMe } from "../services/apiCTF";

const ProfileEnhanced = () => {
  const {
    isPending: isProfilePending,
    isError: isProfileError,
    error: profileError,
    data: profile,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const {
    isPending: isSolvedChallengesPending,
    isError: isSolvedChallengesError,
    error: solvedChallengesError,
    data: solved_challenges,
  } = useQuery({
    queryKey: ["solved_challenges"],
    queryFn: getChallengeSolvedByMe,
  });

  if (isProfilePending || isSolvedChallengesPending) {
    return "Data loading..";
  }

  const activityLog = [
    "$ tail -10 /var/log/user/CaptainCyber_activity.log",
    "Loading user activity...",
    "----------------------------",
    ...(solved_challenges && Array.isArray(solved_challenges)
      ? solved_challenges.map(({ challenge, solved_at }) => {
          const date = new Date(solved_at).toLocaleString();
          return `[${date}] Solved '${challenge.title}' for ${challenge.point} points`;
        })
      : ["No user activity yet."]),
    "----------------------------",
    "$ _",
  ];
  const calculatePercentage = (solved, total) => {
    return (solved / total) * 100;
  };

  return (
    <div className="container">
      <h1 className="terminal-text text-2xl mb-6">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="card sticky top-4">
            <div className="flex flex-col items-center text-center mb-6">
              <h2 className="text-xl mb-1">{profile.username}</h2>
              <p className="text-sm text-muted mb-4">{profile.role}</p>
              <div className="terminal-text text-2xl mb-1">
                {profile.total_point}
              </div>
              <p className="text-sm text-muted">Total Points</p>
            </div>

            <div className="border-t border-border-color pt-4 mb-4">
              <h3 className="terminal-text text-lg mb-2 mt-2">Bio</h3>
              <p className="text-sm mb-4">{profile.bio}</p>
            </div>

            <div className="border-t border-border-color pt-4 mb-4">
              <div className="flex justify-between mb-2 mt-2">
                <span className="text-muted">Team</span>
                <span>{profile.team?.name}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-muted">Country</span>
                <span>{profile.country}</span>
              </div>
            </div>

            {/* <div className="border-t border-border-color pt-4">
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
            </div> */}
          </div>
        </div>

        {/* Solved Challenges & Activity */}
        <div className="md:col-span-2">
          <div className="card mb-6">
            <h2 className="terminal-text text-xl mb-4">Solved Challenges</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                {solved_challenges && (
                  <thead>
                    <tr className="border-b border-border-color">
                      <th className="text-left py-2 px-4 text-muted">
                        Challenge
                      </th>
                      <th className="text-left py-2 px-4 text-muted">
                        Category
                      </th>
                      <th className="text-left py-2 px-4 text-muted">Points</th>
                    </tr>
                  </thead>
                )}
                {!solved_challenges && (
                  <div className="flex justify-between mb-1">
                    <span className="capitalize">
                      You haven't solved any challenge yet.
                    </span>
                  </div>
                )}
                <tbody>
                  {solved_challenges &&
                    Array.isArray(solved_challenges) &&
                    solved_challenges.map((challenge) => (
                      <tr
                        key={challenge.challenge.id}
                        className="border-b border-border-color cursor-pointer"
                        onClick={() =>
                          (window.location.href = `/challenges#${challenge.challenge.title}`)
                        }
                        style={{ transition: "background-color 0.3s ease" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#004d00")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "")
                        }
                      >
                        <td className="py-3 px-4">
                          {challenge.challenge.title}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 rounded-full text-xs">
                            {challenge.challenge.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 terminal-text">
                          {challenge.challenge.point}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <h2 className="terminal-text text-xl mb-4">Activity Log</h2>
          <Terminal title="user_activity.log" lines={activityLog} />
        </div>
      </div>
    </div>
  );
};

export default ProfileEnhanced;
