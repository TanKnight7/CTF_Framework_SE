import Terminal from "../components/Terminal";
import CreateTeam from "./CreateTeam";
import JoinTeam from "./JoinTeam";
import { useQuery } from "@tanstack/react-query";
import {
  isJoinedTeam,
  getTeamDetails,
  getCategories,
} from "../services/apiCTF";

const Team = () => {
  const {
    isPending: isTeamDetailsPending,
    isError: isTeamDetailsError,
    error: TeamDetailsError,
    data: TeamDetails,
  } = useQuery({
    queryKey: ["TeamDetails"],
    queryFn: getTeamDetails,
  });

  const {
    isPending: isJoinedTeamPending,
    isError: isJoinedTeamError,
    error: JoinedTeamError,
    data: isJoinedTeamStatus,
  } = useQuery({
    queryKey: ["isJoinedTeam"],
    queryFn: isJoinedTeam,
  });

  const {
    isPending: isCategoriesPending,
    isError: isCategoriesError,
    error: CategoriesError,
    data: Categories,
  } = useQuery({
    queryKey: ["getCategories"],
    queryFn: getCategories,
  });

  if (isJoinedTeamPending || isTeamDetailsPending || isCategoriesPending) {
    return "Data loading..";
  }

  const calculatePercentage = (solved, total) => {
    return (solved / total) * 100;
  };

  return (
    <div className="container">
      {!isJoinedTeamStatus && (
        <div className="flex justify-center">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 w-full max-w-5xl mx-auto px-4">
            <CreateTeam />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 w-full max-w-5xl mx-auto px-4">
            <JoinTeam />
          </div>
        </div>
      )}
      {isJoinedTeamStatus && (
        <>
          <h1 className="terminal-text text-2xl mb-6">Team</h1>

          <div className="card mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h2 className="text-2xl mb-2">{TeamDetails.name}</h2>
                <p className="text-muted">Rank: #{TeamDetails.rank}</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <div className="terminal-text text-3xl mb-1">
                  {TeamDetails.total_point}
                </div>
                <div className="text-muted">Total Score</div>
              </div>
            </div>

            <h3 className="terminal-text text-lg mb-3">Challenge Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {Categories &&
                Categories.map((category) => {
                  if (category.total_chall === 0) return null;
                  return (
                    <div
                      key={category.name}
                      className="bg-secondary-bg p-4 rounded-md"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="capitalize">{category.name}</span>
                        <span className="terminal-text">
                          {category.total_solved_by_team}/{category.total_chall}
                        </span>
                      </div>
                      <div className="w-full bg-tertiary-bg h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-terminal-green"
                          style={{
                            width: `${calculatePercentage(
                              category.total_solved_by_team,
                              category.total_chall
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <h2 className="terminal-text text-xl mb-4">Team Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {TeamDetails &&
              TeamDetails.members.map((member) => (
                <div key={member.id} className="card">
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-lg mb-1">{member.username}</h3>
                    <div className="terminal-text text-2xl mb-2">
                      {member.total_point}
                    </div>
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
              ...(TeamDetails.solves && TeamDetails.solves.length > 0
                ? TeamDetails.solves.map((solves) => {
                    const date = new Date(solves.solved_at).toLocaleString();
                    return `[${date}] '${solves.username}' Solved '${solves.challenge.category} - ${solves.challenge.title}' for ${solves.challenge.point} points`;
                  })
                : ["No team activity yet."]),
              "----------------------------",
              "$ _",
            ]}
          />
        </>
      )}
    </div>
  );
};

export default Team;
