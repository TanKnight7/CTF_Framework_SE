import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWriteups, deleteWriteup } from "../services/apiCTF";
import { toast } from "react-toastify";
import "../styles/global.css";

const Admin_Writeups = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("all");
  const [sortBy, setSortBy] = useState("submission_time");
  const [sortOrder, setSortOrder] = useState("desc");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const queryClient = useQueryClient();

  // Fetch all writeups
  const {
    data: writeups,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-writeups"],
    queryFn: getWriteups,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Delete writeup mutation
  const deleteWriteupMutation = useMutation({
    mutationFn: async (writeupId) => {
      return await deleteWriteup(writeupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-writeups"]);
      setDeleteConfirm(null);
    },
    onError: (error) => {
      setDeleteConfirm(null);
    },
  });

  // Filter and sort writeups
  const filteredWriteups =
    writeups?.filter((writeup) => {
      const matchesSearch =
        writeup.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        writeup.author?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAuthor =
        filterAuthor === "all" || writeup.author === filterAuthor;

      return matchesSearch && matchesAuthor;
    }) || [];

  // Sort writeups
  const sortedWriteups = [...filteredWriteups].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === "submission_time") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle file download
  const handleDownload = (attachmentUrl, title) => {
    if (attachmentUrl) {
      const link = document.createElement("a");
      link.href = attachmentUrl;
      link.download = title || "writeup";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error("No attachment available for download");
    }
  };

  // Get unique authors for filter
  const uniqueAuthors = [
    ...new Set(writeups?.map((w) => w.author).filter(Boolean) || []),
  ];

  // Handle delete confirmation
  const handleDelete = (writeup) => {
    setDeleteConfirm(writeup);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteWriteupMutation.mutate(deleteConfirm.id);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card">
            <div className="text-center">
              <div className="terminal-text">Loading writeups...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card">
            <div className="text-center">
              <div className="text-muted">
                Error loading writeups: {error?.message}
              </div>
              <button onClick={() => refetch()} className="filter-button mt-4">
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold terminal-text mb-2">
                Writeup Management
              </h1>
              <p className="text-muted">
                Monitor and manage challenge writeups and solutions
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-terminal-green">
                {sortedWriteups.length}
              </div>
              <div className="text-muted">writeups found</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="challenge-search-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Author
              </label>
              <select
                value={filterAuthor}
                onChange={(e) => setFilterAuthor(e.target.value)}
                className="challenge-search-input"
              >
                <option value="all">All Authors</option>
                {uniqueAuthors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Sort By
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="challenge-search-input"
              >
                <option value="submission_time-desc">Newest First</option>
                <option value="submission_time-asc">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="author-asc">Author (A-Z)</option>
                <option value="author-desc">Author (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Writeups Table */}
        <div className="card mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Title
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Author
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Submission Time
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedWriteups.map((writeup) => (
                  <tr
                    key={writeup.id}
                    className="border-b border-border-color hover:bg-secondary-bg transition-colors duration-200"
                  >
                    <td className="p-4">
                      <div className="font-medium text-terminal-white">
                        {writeup.title}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-terminal-green font-medium">
                        {writeup.author}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted">
                        {formatDate(writeup.submission_time)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleDownload(writeup.attachment, writeup.title)
                          }
                          className="filter-button text-sm"
                          title={`Download ${writeup.title}`}
                        >
                          <i className="fas fa-download mr-1"></i>
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(writeup)}
                          className="filter-button text-sm"
                          title="Delete"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedWriteups.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted text-lg mt-2">No writeups found</div>
              <div className="text-sm text-muted mt-2">
                Try adjusting your search or filter criteria
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-terminal-green mb-2">
              {writeups?.length || 0}
            </div>
            <div className="text-muted">Total Writeups</div>
          </div>
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-accent-blue mb-2">
              {uniqueAuthors.length}
            </div>
            <div className="text-muted">Unique Authors</div>
          </div>
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-accent-purple mb-2">
              {writeups?.filter((w) => w.attachment).length || 0}
            </div>
            <div className="text-muted">With Attachments</div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "var(--secondary-bg)",
              padding: "30px",
              borderRadius: "12px",
              border: "2px solid #ff6b6b",
              maxWidth: "500px",
              width: "90%",
              boxShadow:
                "0 20px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 107, 107, 0.2)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <h3
                style={{
                  color: "#ff6b6b",
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                }}
              >
                Confirm Delete
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
                Are you sure you want to delete the writeup "
                {deleteConfirm.title}" by {deleteConfirm.author}?
              </p>
              <p
                style={{ color: "#ff6b6b", fontSize: "14px", marginTop: "8px" }}
              >
                This action cannot be undone.
              </p>
            </div>
            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <button
                onClick={confirmDelete}
                disabled={deleteWriteupMutation.isPending}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ff6b6b",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  opacity: deleteWriteupMutation.isPending ? 0.5 : 1,
                }}
              >
                {deleteWriteupMutation.isPending ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={cancelDelete}
                disabled={deleteWriteupMutation.isPending}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "var(--tertiary-bg)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin_Writeups;
