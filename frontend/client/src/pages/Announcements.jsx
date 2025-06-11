import { useState } from "react";
import Terminal from "../components/Terminal";
import { announcements } from "../data/mockData";

const Announcements = () => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const formatAnnouncementsForTerminal = () => {
    return [
      "$ cat /announcements/all.log",
      "Loading announcements database...",
      "----------------------------",
      ...announcements.map(
        (announcement) =>
          `[${announcement.date} ${announcement.time}] ${announcement.title}`
      ),
      "----------------------------",
      "$ _",
    ];
  };

  const formatSelectedAnnouncementForTerminal = () => {
    if (!selectedAnnouncement) return [];

    return [
      `$ cat /announcements/${selectedAnnouncement.id}.txt`,
      `Loading announcement #${selectedAnnouncement.id}...`,
      "----------------------------",
      `[${selectedAnnouncement.date} ${selectedAnnouncement.time}]`,
      `TITLE: ${selectedAnnouncement.title}`,
      "",
      selectedAnnouncement.content,
      "----------------------------",
      "$ _",
    ];
  };

  return (
    <div className="container">
      <h1 className="terminal-text text-2xl mb-6">System Announcements</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Terminal
            title="announcements.sh"
            lines={formatAnnouncementsForTerminal()}
          />

          <div className="mt-4">
            <ul className="bg-secondary-bg border border-terminal-green p-4 rounded-md">
              {announcements.map((announcement) => (
                <li
                  key={announcement.id}
                  className={`p-2 cursor-pointer hover:bg-tertiary-bg mb-2 border-b border-border-color ${
                    selectedAnnouncement &&
                    selectedAnnouncement.id === announcement.id
                      ? "bg-tertiary-bg terminal-text"
                      : ""
                  }`}
                  onClick={() => setSelectedAnnouncement(announcement)}
                >
                  <div className="flex justify-between">
                    <span>{announcement.title}</span>
                    <span className="text-sm text-muted">
                      {announcement.date}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          {selectedAnnouncement ? (
            <Terminal
              title={`announcement_${selectedAnnouncement.id}.txt`}
              lines={formatSelectedAnnouncementForTerminal()}
              typing={true}
            />
          ) : (
            <div className="card flex items-center justify-center h-full">
              <p className="terminal-text">
                Select an announcement to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
