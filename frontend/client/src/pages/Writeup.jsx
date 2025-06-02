import { useState, useEffect, useMemo } from "react";
import { getWriteups } from "../services/apiCTF";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import SubmitPage from "./Submit";

const Writeup = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "submission_time",
    direction: "descending",
  });

  const {
    isPending: isWriteupsPending,
    isError: isWriteupsError,
    error: writeupsError,
    data: writeups,
  } = useQuery({
    queryKey: ["getWriteups"],
    queryFn: getWriteups,
  });

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

  // Memoized filtered and sorted data
  const processedWriteups = useMemo(() => {
    if (!writeups) return [];
    let filteredData = writeups;

    // Apply search term filter (removed category from search)
    if (searchTerm) {
      filteredData = filteredData.filter(
        (writeup) =>
          writeup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          writeup.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        // Handle date sorting specifically if needed, otherwise assume string comparison works
        if (sortConfig.key === "submission_time") {
          // Basic date string comparison, might need refinement for robust date sorting
          const dateA = new Date(a.submission_time);
          const dateB = new Date(b.submission_time);
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

  if (isWriteupsPending) {
    return "Data loading..";
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const pad = (num) => num.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are zero-based
    const day = pad(date.getDate());

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleDownload = async (url, filename) => {
    try {
      // Check if file exists with a HEAD request
      const response = await fetch(url, { method: "HEAD" });

      if (response.ok) {
        // File exists — trigger download
        const link = document.createElement("a");
        link.href = url;
        link.download = filename || "";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Successfully downloaded ${filename}`);
      } else {
        toast.error("File not found or unavailable for download.");
      }
    } catch (error) {
      toast.error("An error occurred while checking the file.");
      console.error(error);
    }
  };
  return (
    <>
      <SubmitPage />
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
                      onClick={() => requestSort("submission_time")}
                    >
                      Date{getSortIndicator("submission_time")}
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
                          {formatDate(writeup.submission_time)}
                        </td>
                        {/* Removed File Type Cell */}
                        <td className="py-3 px-4 text-center">
                          <a
                            onClick={() =>
                              handleDownload(writeup.attachment, writeup.title)
                            }
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
    </>
  );
};

export default Writeup;
