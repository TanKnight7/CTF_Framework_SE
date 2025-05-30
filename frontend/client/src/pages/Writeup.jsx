import React, { useState, useEffect, useMemo } from "react";

// Mock data for writeups - replace with actual data fetching
const mockWriteupData = [
  {
    id: 1,
    title: "Web Exploitation Mastery",
    author: "cyberNinja",
    challenge: "Login Bypass",
    category: "Web",
    date: "2024-05-28",
    fileType: "PDF",
    filePath: "/path/to/writeups/web_mastery.pdf",
  },
  {
    id: 2,
    title: "Cracking the Code",
    author: "rootKit",
    challenge: "Caesar Cipher Advanced",
    category: "Crypto",
    date: "2024-05-27",
    fileType: "MD",
    filePath: "/path/to/writeups/cracking_code.md",
  },
  {
    id: 3,
    title: "Forensic Files: Memory Dump Analysis",
    author: "dataDigger",
    challenge: "Memory Forensics 101",
    category: "Forensics",
    date: "2024-05-29",
    fileType: "PDF",
    filePath: "/path/to/writeups/memory_dump.pdf",
  },
  {
    id: 4,
    title: "Reverse Engineering a Simple Binary",
    author: "pwn3r",
    challenge: "Beginner Reversing",
    category: "Reverse",
    date: "2024-05-26",
    fileType: "TXT",
    filePath: "/path/to/writeups/reversing_binary.txt",
  },
  {
    id: 5,
    title: "OSINT Techniques for Geolocation",
    author: "secOps",
    challenge: "Find the Location",
    category: "OSINT",
    date: "2024-05-25",
    fileType: "MD",
    filePath: "/path/to/writeups/osint_geo.md",
  },
  {
    id: 6,
    title: "Advanced SQL Injection",
    author: "hacker404",
    challenge: "Database Takeover",
    category: "Web",
    date: "2024-05-29",
    fileType: "PDF",
    filePath: "/path/to/writeups/advanced_sqli.pdf",
  },
  {
    id: 7,
    title: "Steganography Secrets",
    author: "packetWizard",
    challenge: "Hidden in Plain Sight",
    category: "Stego",
    date: "2024-05-24",
    fileType: "MD",
    filePath: "/path/to/writeups/stego_secrets.md",
  },
];

const Writeup = () => {
  const [writeups, setWriteups] = useState(mockWriteupData);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "descending",
  });

  // Memoized filtered and sorted data
  const processedWriteups = useMemo(() => {
    let filteredData = writeups;

    // Apply search term filter (removed category from search)
    if (searchTerm) {
      filteredData = filteredData.filter(
        (writeup) =>
          writeup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          writeup.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          writeup.challenge.toLowerCase().includes(searchTerm.toLowerCase()) // Keep challenge search? User didn't explicitly remove it, but it's not displayed.
        // Let's keep it for now, but it might be confusing.
        // Alternative: Remove challenge search too.
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        // Handle date sorting specifically if needed, otherwise assume string comparison works
        if (sortConfig.key === "date") {
          // Basic date string comparison, might need refinement for robust date sorting
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA < dateB)
            return sortConfig.direction === "ascending" ? -1 : 1;
          if (dateA > dateB)
            return sortConfig.direction === "ascending" ? 1 : -1;
          return 0;
        }
        // Default string/number comparison
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [writeups, searchTerm, sortConfig]);

  // Handle sorting request
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Get sort direction indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };

  return (
    <div className="container relative overflow-hidden">
      {/* Optional: Matrix rain background */}
      {/* <canvas className="matrix-rain" id="matrixRain"></canvas> */}

      <div className="relative z-10">
        <h1 className="terminal-text text-3xl mb-6 glow-terminal">
          Writeup Archive
        </h1>

        {/* Search Control Only */}
        <div className="card mb-6 bg-secondary-bg border border-border-color rounded-md p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-grow w-full">
            <input
              type="text"
              placeholder="Search by title, author"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 rounded-md bg-tertiary-bg border border-border-color focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green text-text-primary text-terminal-green"
            />
          </div>
          {/* Removed Filter Controls */}
        </div>

        {/* Simplified Writeups Table */}
        <div className="card bg-secondary-bg border border-border-color rounded-md p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-color bg-tertiary-bg">
                  <th
                    className="text-left py-3 px-4 terminal-text cursor-pointer hover:text-white"
                    onClick={() => requestSort("title")}
                  >
                    Title{getSortIndicator("title")}
                  </th>
                  <th
                    className="text-left py-3 px-4 terminal-text cursor-pointer hover:text-white"
                    onClick={() => requestSort("author")}
                  >
                    Team / User{getSortIndicator("author")}
                  </th>
                  {/* Removed Challenge Header */}
                  {/* Removed Category Header */}
                  <th
                    className="text-left py-3 px-4 terminal-text cursor-pointer hover:text-white"
                    onClick={() => requestSort("date")}
                  >
                    Date{getSortIndicator("date")}
                  </th>
                  {/* Removed File Type Header - User didn't explicitly ask to keep it, let's remove for simplicity */}
                  <th className="text-center py-3 px-4 terminal-text">
                    Download
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedWriteups.length > 0 ? (
                  processedWriteups.map((writeup) => (
                    <tr
                      key={writeup.id}
                      className="interactive-row border-b border-border-color"
                    >
                      <td className="py-3 px-4 text-text-primary">
                        {writeup.title}
                      </td>
                      <td className="py-3 px-4 text-text-primary">
                        {writeup.author}
                      </td>
                      {/* Removed Challenge Cell */}
                      {/* Removed Category Cell */}
                      <td className="py-3 px-4 text-muted text-sm">
                        {writeup.date}
                      </td>
                      {/* Removed File Type Cell */}
                      <td className="py-3 px-4 text-center">
                        <a
                          href={writeup.filePath} // In real app, ensure this path is correct/secure
                          download
                          className="filter-button active text-sm py-1 px-2 scale-on-hover inline-block no-underline"
                          title={`Download ${writeup.title}`}
                        >
                          💾 Download
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    {/* Adjusted colSpan */}
                    <td colSpan="4" className="text-center py-6 text-muted">
                      No writeups found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Writeup;
