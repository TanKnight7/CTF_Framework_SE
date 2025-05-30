import { Link } from "react-router-dom";
import Terminal from "../components/Terminal";
import { eventInfo } from "../data/mockData";

const Home = () => {
  // Format event info for terminal display
  const formatEventInfoForTerminal = () => {
    return [
      "$ cat /etc/ctf/event_info.txt",
      "Loading event data...",
      "----------------------------",
      `EVENT: ${eventInfo.name}`,
      `STATUS: ${eventInfo.status}`,
      `START: ${eventInfo.startDate} ${eventInfo.startTime}`,
      `END: ${eventInfo.endDate} ${eventInfo.endTime}`,
      `LOCATION: ${eventInfo.location}`,
      `PARTICIPANTS: ${eventInfo.participants}`,
      "----------------------------",
      "$ _",
    ];
  };

  return (
    <div className="container">
      <div className="py-6">
        <h1 className="text-center terminal-text text-3xl mb-6">
          {eventInfo.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Event Status Card */}
          <div className="card col-span-1">
            <h2 className="terminal-text text-xl mb-4">Event Status</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-muted">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    eventInfo.status === "Active"
                      ? "bg-terminal-green text-terminal-black"
                      : "bg-accent-red text-terminal-white"
                  }`}
                >
                  {eventInfo.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Start:</span>
                <span>
                  {eventInfo.startDate} {eventInfo.startTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">End:</span>
                <span>
                  {eventInfo.endDate} {eventInfo.endTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Location:</span>
                <span>{eventInfo.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Participants:</span>
                <span>{eventInfo.participants}</span>
              </div>
            </div>
          </div>

          {/* Terminal View Card */}
          <div className="card col-span-2">
            <Terminal
              title="event_info.sh"
              lines={formatEventInfoForTerminal()}
            />
          </div>
        </div>

        {/* Quick Access Cards */}
        <h2 className="terminal-text text-xl mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/challenges"
            className="card hover:bg-secondary-bg transition-colors no-underline"
          >
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg mb-2 terminal-text">Challenges</h3>
              <p className="text-sm text-muted">
                Solve hacking challenges and earn points
              </p>
            </div>
          </Link>

          <Link
            to="/leaderboard"
            className="card hover:bg-secondary-bg transition-colors no-underline"
          >
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-lg mb-2 terminal-text">Leaderboard</h3>
              <p className="text-sm text-muted">See top teams and rankings</p>
            </div>
          </Link>

          <Link
            to="/team"
            className="card hover:bg-secondary-bg transition-colors no-underline"
          >
            <div className="text-center p-4">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-lg mb-2 terminal-text">Team</h3>
              <p className="text-sm text-muted">
                Manage your team and view progress
              </p>
            </div>
          </Link>

          <Link
            to="/announcements"
            className="card hover:bg-secondary-bg transition-colors no-underline"
          >
            <div className="text-center p-4">
              <div className="text-4xl mb-3">📢</div>
              <h3 className="text-lg mb-2 terminal-text">Announcements</h3>
              <p className="text-sm text-muted">View important event updates</p>
            </div>
          </Link>
        </div>

        {/* Event Description */}
        <div className="card mb-8">
          <h2 className="terminal-text text-xl mb-4">About This Event</h2>
          <p className="mb-4">{eventInfo.description}</p>
          <p className="text-sm text-muted">
            Remember to follow the rules and code of conduct. Happy hacking!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
