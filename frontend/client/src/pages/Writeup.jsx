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

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };

  const processedWriteups = useMemo(() => {
    if (!writeups) return [];
    let filteredData = writeups;

    if (searchTerm) {
      filteredData = filteredData.filter(
        (writeup) =>
          writeup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          writeup.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        if (sortConfig.key === "submission_time") {
          const dateA = new Date(a.submission_time);
          const dateB = new Date(b.submission_time);
          if (dateA < dateB)
            return sortConfig.direction === "ascending" ? -1 : 1;
          if (dateA > dateB)
            return sortConfig.direction === "ascending" ? 1 : -1;
          return 0;
        }

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
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url, { method: "HEAD" });

      if (response.ok) {
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
        <div className="relative z-10">
          <h1 className="terminal-text text-3xl mb-6 glow-terminal">
            Writeup Archive
          </h1>

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
          </div>

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

                    <th
                      className="text-left py-3 px-4 terminal-text cursor-pointer hover:text-white"
                      onClick={() => requestSort("submission_time")}
                    >
                      Date{getSortIndicator("submission_time")}
                    </th>

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

                        <td className="py-3 px-4 text-muted text-sm">
                          {formatDate(writeup.submission_time)}
                        </td>

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
