import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../services/apiCTF";
import { useForm } from "react-hook-form";
import "../styles/global.css";

const Admin_Announcement = () => {
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [showEditAnnouncement, setShowEditAnnouncement] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const queryClient = useQueryClient();

  // Fetch announcements
  const {
    data: announcements,
    isLoading: announcementsLoading,
    isError: announcementsError,
    error: announcementsErrorData,
    refetch: refetchAnnouncements,
  } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: getAnnouncements,
    staleTime: 2 * 60 * 1000,
  });

  // Create announcement mutation
  const createAnnouncementMutation = useMutation({
    mutationFn: (data) => createAnnouncement(data),
    onSuccess: (responseData) => {
      if (responseData.error) {
        return;
      }
      setShowCreateAnnouncement(false);
      queryClient.invalidateQueries(["admin-announcements"]);
      refetchAnnouncements();
    },
    onError: (error) => {
      console.error("Failed to create announcement", error);
    },
  });

  // Update announcement mutation
  const updateAnnouncementMutation = useMutation({
    mutationFn: ({ announcementId, data }) =>
      updateAnnouncement(announcementId, data),
    onSuccess: (responseData) => {
      if (responseData.error) {
        return;
      }
      setShowEditAnnouncement(false);
      setSelectedAnnouncement(null);
      queryClient.invalidateQueries(["admin-announcements"]);
      refetchAnnouncements();
    },
    onError: (error) => {
      console.error("Failed to update announcement", error);
    },
  });

  // Delete announcement mutation
  const deleteAnnouncementMutation = useMutation({
    mutationFn: (announcementId) => deleteAnnouncement(announcementId),
    onSuccess: (responseData) => {
      if (responseData.error) {
        return;
      }
      setShowDeleteConfirm(false);
      setSelectedAnnouncement(null);
      queryClient.invalidateQueries(["admin-announcements"]);
      refetchAnnouncements();
    },
    onError: (error) => {
      console.error("Failed to delete announcement", error);
    },
  });

  // Form hooks
  const announcementForm = useForm({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const editAnnouncementForm = useForm({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  // Filter and sort announcements
  const filteredAnnouncements =
    (Array.isArray(announcements) ? announcements : [])?.filter(
      (announcement) => {
        const matchesSearch =
          announcement.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          announcement.content
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        return matchesSearch;
      }
    ) || [];

  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === "created_at") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Handle form submissions
  const handleAnnouncementSubmit = (data) => {
    createAnnouncementMutation.mutate(data);
  };

  const handleEditAnnouncementSubmit = (data) => {
    if (selectedAnnouncement) {
      updateAnnouncementMutation.mutate({
        announcementId: selectedAnnouncement.id,
        data,
      });
    }
  };

  // Handle announcement click to open edit modal
  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    editAnnouncementForm.reset({
      title: announcement.title || "",
      content: announcement.content || "",
    });
    setShowEditAnnouncement(true);
  };

  // Handle delete announcement
  const handleDeleteAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedAnnouncement) {
      deleteAnnouncementMutation.mutate(selectedAnnouncement.id);
    }
  };

  if (announcementsLoading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card">
            <div className="text-center">
              <div className="terminal-text">Loading announcements...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (announcementsError) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card">
            <div className="text-center">
              <div className="text-muted">
                Error loading data: {announcementsErrorData?.message}
              </div>
              <button
                onClick={() => refetchAnnouncements()}
                className="filter-button mt-4"
              >
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
                Announcement Management
              </h1>
              <p className="text-muted">Create and manage announcements</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateAnnouncement(true)}
                className="filter-button"
              >
                Create Announcement
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Announcement title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="challenge-search-input"
              />
            </div>
          </div>
        </div>

        {/* Announcements Table */}
        <div className="card mb-6">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-border-color">
                  <th
                    className="text-left p-4 text-sm font-medium text-muted"
                    style={{ width: "30%" }}
                  >
                    Title
                  </th>
                  <th
                    className="text-left p-4 text-sm font-medium text-muted"
                    style={{ width: "50%" }}
                  >
                    Content
                  </th>
                  <th
                    className="text-left p-4 text-sm font-medium text-muted"
                    style={{ width: "20%" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAnnouncements.map((announcement) => (
                  <tr
                    key={announcement.id}
                    className="border-b border-border-color hover:bg-secondary-bg transition-colors duration-200 cursor-pointer"
                    onClick={() => handleAnnouncementClick(announcement)}
                  >
                    <td className="p-4" style={{ width: "30%" }}>
                      <div className="font-bold text-lg text-terminal-white hover:text-terminal-green transition-colors duration-200">
                        {announcement.title}
                      </div>
                    </td>
                    <td className="p-4" style={{ width: "50%" }}>
                      <div className="text-muted">
                        {announcement.content.length > 100
                          ? `${announcement.content.substring(0, 100)}...`
                          : announcement.content}
                      </div>
                    </td>
                    <td className="p-4" style={{ width: "20%" }}>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnnouncementClick(announcement);
                          }}
                          className="filter-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnnouncement(announcement);
                          }}
                          className="filter-button bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Announcement Modal */}
        {showCreateAnnouncement && (
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
                border: "2px solid var(--terminal-green)",
                maxWidth: "800px",
                width: "95%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 0 30px rgba(0, 255, 0, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                  paddingBottom: "16px",
                  borderBottom: "2px solid rgba(0, 255, 0, 0.2)",
                }}
              >
                <h2
                  style={{
                    color: "var(--terminal-green)",
                    fontSize: "24px",
                    fontWeight: "bold",
                    textShadow: "0 0 10px rgba(0, 255, 0, 0.3)",
                    margin: 0,
                  }}
                >
                  Create Announcement
                </h2>
                <button
                  onClick={() => setShowCreateAnnouncement(false)}
                  style={{
                    color: "var(--text-muted)",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid var(--border-color)",
                    fontSize: "18px",
                    cursor: "pointer",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    e.target.style.color = "var(--terminal-white)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    e.target.style.color = "var(--text-muted)";
                  }}
                >
                  ✕
                </button>
              </div>
              <form
                onSubmit={announcementForm.handleSubmit(
                  handleAnnouncementSubmit
                )}
              >
                <div className="mb-6">
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--terminal-green)",
                      marginBottom: "10px",
                      textShadow: "0 0 5px rgba(0, 255, 0, 0.2)",
                    }}
                  >
                    Title
                  </label>
                  <input
                    {...announcementForm.register("title", {
                      required: "Title is required",
                    })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "2px solid var(--terminal-green)",
                      color: "var(--terminal-white)",
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: "16px",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                      boxShadow: "0 0 10px rgba(0, 255, 0, 0.1)",
                    }}
                    placeholder="Enter announcement title"
                  />
                  {announcementForm.formState.errors.title && (
                    <div
                      style={{
                        color: "#ff6b6b",
                        fontSize: "14px",
                        marginTop: "6px",
                        fontWeight: "500",
                      }}
                    >
                      {announcementForm.formState.errors.title.message}
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--terminal-green)",
                      marginBottom: "10px",
                      textShadow: "0 0 5px rgba(0, 255, 0, 0.2)",
                    }}
                  >
                    Content
                  </label>
                  <textarea
                    {...announcementForm.register("content", {
                      required: "Content is required",
                    })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "2px solid var(--terminal-green)",
                      color: "var(--terminal-white)",
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: "16px",
                      borderRadius: "8px",
                      minHeight: "200px",
                      resize: "vertical",
                      transition: "all 0.3s ease",
                      boxShadow: "0 0 10px rgba(0, 255, 0, 0.1)",
                    }}
                    placeholder="Enter announcement content"
                  />
                  {announcementForm.formState.errors.content && (
                    <div
                      style={{
                        color: "#ff6b6b",
                        fontSize: "14px",
                        marginTop: "6px",
                        fontWeight: "500",
                      }}
                    >
                      {announcementForm.formState.errors.content.message}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "14px 20px",
                      backgroundColor: "var(--terminal-green)",
                      color: "var(--terminal-black)",
                      border: "2px solid var(--terminal-green)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "16px",
                      opacity: createAnnouncementMutation.isPending ? 0.5 : 1,
                      transition: "all 0.3s ease",
                      boxShadow: "0 0 15px rgba(0, 255, 0, 0.2)",
                    }}
                    disabled={createAnnouncementMutation.isPending}
                  >
                    {createAnnouncementMutation.isPending
                      ? "Creating..."
                      : "Create Announcement"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateAnnouncement(false)}
                    style={{
                      padding: "14px 20px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "var(--text-primary)",
                      border: "2px solid var(--border-color)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "16px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Announcement Modal */}
        {showEditAnnouncement && selectedAnnouncement && (
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
                border: "2px solid var(--terminal-green)",
                maxWidth: "800px",
                width: "95%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 0 30px rgba(0, 255, 0, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px",
                  paddingBottom: "16px",
                  borderBottom: "2px solid rgba(0, 255, 0, 0.2)",
                }}
              >
                <h2
                  style={{
                    color: "var(--terminal-green)",
                    fontSize: "24px",
                    fontWeight: "bold",
                    textShadow: "0 0 10px rgba(0, 255, 0, 0.3)",
                    margin: 0,
                  }}
                >
                  Edit Announcement
                </h2>
                <button
                  onClick={() => {
                    setShowEditAnnouncement(false);
                    setSelectedAnnouncement(null);
                  }}
                  style={{
                    color: "var(--text-muted)",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid var(--border-color)",
                    fontSize: "18px",
                    cursor: "pointer",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    e.target.style.color = "var(--terminal-white)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    e.target.style.color = "var(--text-muted)";
                  }}
                >
                  ✕
                </button>
              </div>
              <form
                onSubmit={editAnnouncementForm.handleSubmit(
                  handleEditAnnouncementSubmit
                )}
              >
                <div className="mb-6">
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--terminal-green)",
                      marginBottom: "10px",
                      textShadow: "0 0 5px rgba(0, 255, 0, 0.2)",
                    }}
                  >
                    Title
                  </label>
                  <input
                    {...editAnnouncementForm.register("title", {
                      required: "Title is required",
                    })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "2px solid var(--terminal-green)",
                      color: "var(--terminal-white)",
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: "16px",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                      boxShadow: "0 0 10px rgba(0, 255, 0, 0.1)",
                    }}
                    placeholder="Enter announcement title"
                  />
                  {editAnnouncementForm.formState.errors.title && (
                    <div
                      style={{
                        color: "#ff6b6b",
                        fontSize: "14px",
                        marginTop: "6px",
                        fontWeight: "500",
                      }}
                    >
                      {editAnnouncementForm.formState.errors.title.message}
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--terminal-green)",
                      marginBottom: "10px",
                      textShadow: "0 0 5px rgba(0, 255, 0, 0.2)",
                    }}
                  >
                    Content
                  </label>
                  <textarea
                    {...editAnnouncementForm.register("content", {
                      required: "Content is required",
                    })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "2px solid var(--terminal-green)",
                      color: "var(--terminal-white)",
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: "16px",
                      borderRadius: "8px",
                      minHeight: "200px",
                      resize: "vertical",
                      transition: "all 0.3s ease",
                      boxShadow: "0 0 10px rgba(0, 255, 0, 0.1)",
                    }}
                    placeholder="Enter announcement content"
                  />
                  {editAnnouncementForm.formState.errors.content && (
                    <div
                      style={{
                        color: "#ff6b6b",
                        fontSize: "14px",
                        marginTop: "6px",
                        fontWeight: "500",
                      }}
                    >
                      {editAnnouncementForm.formState.errors.content.message}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "14px 20px",
                      backgroundColor: "var(--terminal-green)",
                      color: "var(--terminal-black)",
                      border: "2px solid var(--terminal-green)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "16px",
                      opacity: updateAnnouncementMutation.isPending ? 0.5 : 1,
                      transition: "all 0.3s ease",
                      boxShadow: "0 0 15px rgba(0, 255, 0, 0.2)",
                    }}
                    disabled={updateAnnouncementMutation.isPending}
                  >
                    {updateAnnouncementMutation.isPending
                      ? "Updating..."
                      : "Update Announcement"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditAnnouncement(false);
                      setSelectedAnnouncement(null);
                    }}
                    style={{
                      padding: "14px 20px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "var(--text-primary)",
                      border: "2px solid var(--border-color)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "16px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedAnnouncement && (
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
                textAlign: "center",
                boxShadow: "0 0 30px rgba(255, 107, 107, 0.3)",
              }}
            >
              <h2
                style={{
                  color: "#ff6b6b",
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                }}
              >
                Delete Announcement
              </h2>
              <p
                style={{
                  color: "var(--text-primary)",
                  marginBottom: "24px",
                  fontSize: "16px",
                }}
              >
                Are you sure you want to delete this announcement? This action
                cannot be undone.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#ff6b6b",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "16px",
                    transition: "all 0.3s ease",
                  }}
                  disabled={deleteAnnouncementMutation.isPending}
                >
                  {deleteAnnouncementMutation.isPending
                    ? "Deleting..."
                    : "Delete"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedAnnouncement(null);
                  }}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "var(--text-primary)",
                    border: "2px solid var(--border-color)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "16px",
                    transition: "all 0.3s ease",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin_Announcement;
