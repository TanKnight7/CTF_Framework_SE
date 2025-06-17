import { useEffect, useState } from "react";
import Terminal from "../components/Terminal";

const Home = () => {
  const formatEventInfoForTerminal = () => {
    return [
      "$ cat /etc/ctf/event_info.txt",
      "Loading event data...",
      "----------------------------",
      `EVENT: ${config.name}`,
      `LOCATION: ${config.location}`,
      `START: ${config.start_time}`,
      `END: ${config.end_time}`,
      "----------------------------",
      "$ _",
    ];
  };

  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch("/config/ctf")
      .then((res) => res.json())
      .then((data) => setConfig(data));
  }, []);

  if (!config) return <div>Loading config...</div>;
  return (
    <div className="container">
      <div className="py-6">
        <h1 className="text-center terminal-text text-3xl mb-6">
          {config.name}
        </h1>

        {/* Event Description */}
        <div className="card mb-8">
          <h2 className="terminal-text text-xl mb-4">About This Event</h2>
          <p className="mb-4">{config.description}</p>
          <p className="text-sm text-muted">
            Remember to follow the rules and code of conduct. Happy hacking!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card col-span-2">
            <Terminal
              title="event_info.sh"
              lines={formatEventInfoForTerminal()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
