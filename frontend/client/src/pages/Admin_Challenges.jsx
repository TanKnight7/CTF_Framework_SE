import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChallenges,
  getCategories,
  createCategory,
  createChallannge,
  getChallengeDetail,
  updateChallenge,
  deleteChallenge,
} from "../services/apiCTF";
import { useForm } from "react-hook-form";
import "../styles/global.css";

const Admin_Challenges = () => {
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [showEditChallenge, setShowEditChallenge] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [commandPrefix, setCommandPrefix] = useState("$");
  const [attachments, setAttachments] = useState([]);
  const [editAttachments, setEditAttachments] = useState([]);

  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Fetch challenges and categories
  const {
    data: challenges,
    isLoading: challengesLoading,
    isError: challengesError,
    error: challengesErrorData,
    refetch: refetchChallenges,
  } = useQuery({
    queryKey: ["admin-challenges"],
    queryFn: getChallenges,
    staleTime: 2 * 60 * 1000,
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorData,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data) => createCategory(data),
    onSuccess: (responseData) => {
      if (responseData.error) {
        return;
      }
      setShowCreateCategory(false);
      queryClient.invalidateQueries(["admin-categories"]);
      refetchCategories();
    },
    onError: (error) => {
      console.error("Failed to create category", error);
    },
  });

  // Create challenge mutation
  const createChallengeMutation = useMutation({
    mutationFn: (data) => createChallannge(data),
    onSuccess: (responseData) => {
      if (responseData.error) {
        return;
      }
      setShowCreateChallenge(false);
      queryClient.invalidateQueries(["admin-challenges"]);
      refetchChallenges();
    },
    onError: (error) => {
      console.error("Failed to create challenge", error);
    },
  });

  // Update challenge mutation
  const updateChallengeMutation = useMutation({
    mutationFn: ({ challengeId, data }) => updateChallenge(challengeId, data),
    onSuccess: (responseData) => {
      if (responseData.error) {
        return;
      }
      setShowEditChallenge(false);
      setSelectedChallenge(null);
      queryClient.invalidateQueries(["admin-challenges"]);
      refetchChallenges();
    },
    onError: (error) => {
      console.error("Failed to update challenge", error);
    },
  });

  // Delete challenge mutation
  const deleteChallengeMutation = useMutation({
    mutationFn: (challengeId) => deleteChallenge(challengeId),
    onSuccess: (responseData) => {
      if (responseData.error) {
        return;
      }
      setShowDeleteConfirm(false);
      setSelectedChallenge(null);
      queryClient.invalidateQueries(["admin-challenges"]);
      refetchChallenges();
    },
    onError: (error) => {
      console.error("Failed to delete challenge", error);
    },
  });

  // Form hooks
  const categoryForm = useForm({
    defaultValues: {
      name: "",
    },
  });

  const challengeForm = useForm({
    defaultValues: {
      title: "",
      category: "",
      description: "",
      difficulty: "3",
      point: "",
      flag: "",
    },
  });

  const editChallengeForm = useForm({
    defaultValues: {
      title: "",
      category: "",
      description: "",
      difficulty: "3",
      point: "",
      flag: "",
    },
  });

  // Filter and sort challenges
  const filteredChallenges =
    challenges?.filter((challenge) => {
      const matchesSearch =
        challenge.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        filterCategory === "all" || challenge.category === filterCategory;
      const matchesDifficulty =
        filterDifficulty === "all" ||
        challenge.difficulty === parseInt(filterDifficulty);

      return matchesSearch && matchesCategory && matchesDifficulty;
    }) || [];

  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === "point" || sortBy === "difficulty") {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Handle form submissions
  const handleCategorySubmit = (data) => {
    createCategoryMutation.mutate(data);
  };

  const handleChallengeSubmit = (data) => {
    // Create FormData for file upload
    const formData = new FormData();

    // Add form fields
    Object.keys(data).forEach((key) => {
      if (key !== "attachments") {
        formData.append(key, data[key]);
      }
    });

    // Add attachments
    attachments.forEach((attachment, index) => {
      formData.append(`attachments`, attachment.file);
    });

    createChallengeMutation.mutate(formData);
  };

  const handleEditChallengeSubmit = (data) => {
    // Create FormData for file upload
    const formData = new FormData();

    // Add form fields
    Object.keys(data).forEach((key) => {
      if (key !== "attachments") {
        formData.append(key, data[key]);
      }
    });

    // Add new attachments only
    editAttachments
      .filter((attachment) => !attachment.isExisting && attachment.file)
      .forEach((attachment) => {
        formData.append(`attachments`, attachment.file);
      });

    // Add information about existing attachments to keep
    const existingAttachmentsToKeep = editAttachments
      .filter(
        (attachment) =>
          attachment.isExisting &&
          !attachment.id.toString().startsWith("existing-")
      )
      .map((attachment) => attachment.id);

    if (existingAttachmentsToKeep.length > 0) {
      formData.append(
        "keep_attachments",
        JSON.stringify(existingAttachmentsToKeep)
      );
    }

    // Debug logging
    console.log("Edit challenge data:", {
      challengeId: selectedChallenge.id,
      formData: Object.fromEntries(formData.entries()),
      editAttachments,
      existingAttachmentsToKeep,
    });

    updateChallengeMutation.mutate({
      challengeId: selectedChallenge.id,
      data: formData,
    });
  };

  // Attachment handling functions
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAttachments((prevAttachments) => [
        ...prevAttachments,
        ...files.map((file) => ({
          id: Date.now() + Math.random(),
          file: file,
          name: file.name,
          size: file.size,
        })),
      ]);

      e.target.value = "";
    }
  };

  const removeAttachment = (attachmentId) => {
    setAttachments((prevAttachments) =>
      prevAttachments.filter((attachment) => attachment.id !== attachmentId)
    );
  };

  const clearAllAttachments = () => {
    setAttachments([]);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Edit attachment handling functions
  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setEditAttachments((prevAttachments) => [
        ...prevAttachments,
        ...files.map((file) => ({
          id: Date.now() + Math.random(),
          file: file,
          name: file.name,
          size: file.size,
          isExisting: false,
        })),
      ]);

      e.target.value = "";
    }
  };

  const removeEditAttachment = (attachmentId) => {
    setEditAttachments((prevAttachments) =>
      prevAttachments.filter((attachment) => attachment.id !== attachmentId)
    );
  };

  const clearAllEditAttachments = () => {
    setEditAttachments([]);
  };

  const triggerEditFileInput = () => {
    editFileInputRef.current.click();
  };

  // Get difficulty badge
  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      1: { className: "badge-blue", text: "Easy" },
      2: { className: "badge-purple", text: "Medium" },
      3: { className: "badge-red", text: "Hard" },
      4: { className: "badge-red", text: "Expert" },
      5: { className: "badge-red", text: "Master" },
    };

    const config = difficultyConfig[difficulty] || {
      className: "badge",
      text: `Level ${difficulty}`,
    };

    return <span className={`badge ${config.className}`}>{config.text}</span>;
  };

  // Get category badge
  const getCategoryBadge = (category) => {
    return (
      <span className="badge badge-blue">
        {category?.toUpperCase() || "Unknown"}
      </span>
    );
  };

  // Terminal animation
  useEffect(() => {
    const commandInterval = setInterval(() => {
      setCommandPrefix((prev) => (prev === "$" ? "$ _" : "$"));
    }, 500);
    return () => clearInterval(commandInterval);
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log("showCreateCategory changed:", showCreateCategory);
  }, [showCreateCategory]);

  useEffect(() => {
    console.log("showCreateChallenge changed:", showCreateChallenge);
  }, [showCreateChallenge]);

  // Clear attachments when modal is closed
  useEffect(() => {
    if (!showCreateChallenge) {
      setAttachments([]);
    }
  }, [showCreateChallenge]);

  // Clear edit attachments when edit modal is closed
  useEffect(() => {
    if (!showEditChallenge) {
      setEditAttachments([]);
    }
  }, [showEditChallenge]);

  // Handle challenge click to open edit modal
  const handleChallengeClick = async (challenge) => {
    setSelectedChallenge(challenge);

    // Fetch full challenge details including flag
    try {
      const challengeDetail = await getChallengeDetail(challenge.id);
      if (challengeDetail.error) {
        return;
      }

      // Set form values - use category ID from the detail response
      editChallengeForm.reset({
        title: challengeDetail.title || "",
        category: challengeDetail.category || "",
        description: challengeDetail.description || "",
        difficulty: challengeDetail.difficulty?.toString() || "3",
        point: challengeDetail.point?.toString() || "",
        flag: challengeDetail.flag || "",
      });

      // Set attachments with actual database IDs
      setEditAttachments(
        challengeDetail.attachments?.map((att, index) => ({
          id: att.id || `existing-${index}`,
          name: att.name,
          file: null,
          size: 0,
          isExisting: true,
          url: att.file,
        })) || []
      );

      setShowEditChallenge(true);
    } catch (error) {
      console.error("Error loading challenge details:", error);
    }
  };

  // Handle delete challenge
  const handleDeleteChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedChallenge) {
      deleteChallengeMutation.mutate(selectedChallenge.id);
    }
  };

  if (challengesLoading || categoriesLoading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card">
            <div className="text-center">
              <div className="terminal-text">Loading challenges...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (challengesError || categoriesError) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card">
            <div className="text-center">
              <div className="text-muted">
                Error loading data:{" "}
                {challengesErrorData?.message || categoriesErrorData?.message}
              </div>
              <button
                onClick={() => {
                  refetchChallenges();
                  refetchCategories();
                }}
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
                Challenge Management
              </h1>
              <p className="text-muted">
                Create and manage challenges and categories
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  console.log("Create Category button clicked");
                  setShowCreateCategory(true);
                }}
                className="filter-button"
              >
                Create Category
              </button>
              <button
                onClick={() => {
                  console.log("Create Challenge button clicked");
                  setShowCreateChallenge(true);
                }}
                className="filter-button"
              >
                Create Challenge
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Challenge title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="challenge-search-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="challenge-search-input"
              >
                <option value="all">All Categories</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Difficulty
              </label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="challenge-search-input"
              >
                <option value="all">All Difficulties</option>
                <option value="1">Easy</option>
                <option value="2">Medium</option>
                <option value="3">Hard</option>
                <option value="4">Expert</option>
                <option value="5">Master</option>
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
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="points-desc">Points (High to Low)</option>
                <option value="points-asc">Points (Low to High)</option>
                <option value="difficulty-desc">
                  Difficulty (High to Low)
                </option>
                <option value="difficulty-asc">Difficulty (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Challenges Table */}
        <div className="card mb-6">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-border-color">
                  <th
                    className="text-left p-4 text-sm font-medium text-muted"
                    style={{ width: "30%" }}
                  >
                    Challenge
                  </th>
                  <th
                    className="text-left p-4 text-sm font-medium text-muted"
                    style={{ width: "20%" }}
                  >
                    Category
                  </th>
                  <th
                    className="text-left p-4 text-sm font-medium text-muted"
                    style={{ width: "15%" }}
                  >
                    Difficulty
                  </th>
                  <th
                    className="text-left p-4 text-sm font-medium text-muted"
                    style={{ width: "15%" }}
                  >
                    Points
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
                {sortedChallenges.map((challenge) => (
                  <tr
                    key={challenge.id}
                    className="border-b border-border-color hover:bg-secondary-bg transition-colors duration-200 cursor-pointer"
                    onClick={() => handleChallengeClick(challenge)}
                  >
                    <td className="p-4" style={{ width: "30%" }}>
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-tertiary-bg flex items-center justify-center mr-4 border-2 border-border-color hover:border-terminal-green transition-colors duration-200">
                          <span className="text-lg font-bold text-terminal-green">
                            #{challenge.id}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-lg text-terminal-white hover:text-terminal-green transition-colors duration-200">
                            {challenge.title}
                          </div>
                          <div className="text-sm text-muted">
                            ID: {challenge.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4" style={{ width: "20%" }}>
                      <div className="flex justify-center">
                        {getCategoryBadge(challenge.category)}
                      </div>
                    </td>
                    <td className="p-4" style={{ width: "15%" }}>
                      <div className="flex justify-center">
                        {getDifficultyBadge(challenge.difficulty)}
                      </div>
                    </td>
                    <td className="p-4" style={{ width: "15%" }}>
                      <div className="text-lg font-bold text-terminal-green">
                        {challenge.point || 0}
                      </div>
                    </td>
                    <td className="p-4" style={{ width: "20%" }}>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChallengeClick(challenge);
                          }}
                          className="px-3 py-1 bg-terminal-green text-black rounded text-sm font-medium hover:bg-green-400 transition-colors duration-200"
                          title="Edit Challenge"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChallenge(challenge);
                          }}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                          title="Delete Challenge"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedChallenges.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted text-lg">No challenges found</div>
              <div className="text-sm text-muted mt-2">
                Try adjusting your search or filter criteria
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-terminal-green mb-2">
              {challenges?.length || 0}
            </div>
            <div className="text-muted">Total Challenges</div>
          </div>
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-accent-blue mb-2">
              {categories?.length || 0}
            </div>
            <div className="text-muted">Categories</div>
          </div>
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-accent-purple mb-2">
              {challenges?.reduce(
                (sum, challenge) => sum + (challenge.point || 0),
                0
              ) || 0}
            </div>
            <div className="text-muted">Total Points</div>
          </div>
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-accent-red mb-2">
              {challenges?.filter((c) => c.difficulty >= 4).length || 0}
            </div>
            <div className="text-muted">Expert+ Challenges</div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="card mt-4">
          <div className="text-sm text-muted">
            Debug Info: showCreateCategory = {showCreateCategory.toString()},
            showCreateChallenge = {showCreateChallenge.toString()}
          </div>
        </div>

        {/* Create Category Modal */}
        {showCreateCategory && (
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
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                maxWidth: "400px",
                width: "90%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h2
                  style={{
                    color: "var(--terminal-green)",
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                >
                  Create Category
                </h2>
                <button
                  onClick={() => {
                    console.log("Closing category modal");
                    setShowCreateCategory(false);
                  }}
                  style={{
                    color: "var(--text-muted)",
                    background: "none",
                    border: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)}>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--text-muted)",
                      marginBottom: "8px",
                    }}
                  >
                    {commandPrefix} category_name:
                  </label>
                  <input
                    {...categoryForm.register("name", {
                      required: "Category name is required",
                    })}
                    style={{
                      width: "100%",
                      padding: "10px 15px",
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      border: "1px solid var(--terminal-green)",
                      color: "var(--terminal-white)",
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: "16px",
                      borderRadius: "4px",
                    }}
                    placeholder="Enter category name"
                  />
                  {categoryForm.formState.errors.name && (
                    <div
                      style={{
                        color: "#ef4444",
                        fontSize: "14px",
                        marginTop: "4px",
                      }}
                    >
                      {categoryForm.formState.errors.name.message}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "8px 16px",
                      backgroundColor: "var(--terminal-green)",
                      color: "var(--terminal-black)",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      opacity: createCategoryMutation.isPending ? 0.5 : 1,
                    }}
                    disabled={createCategoryMutation.isPending}
                  >
                    {createCategoryMutation.isPending
                      ? "Creating..."
                      : "Create Category"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log("Cancel category modal");
                      setShowCreateCategory(false);
                    }}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "var(--tertiary-bg)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Challenge Modal */}
        {showCreateChallenge && (
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
                maxWidth: "1000px",
                width: "95%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow:
                  "0 20px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 255, 0, 0.1)",
                backdropFilter: "blur(10px)",
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
                  Create Challenge
                </h2>
                <button
                  onClick={() => {
                    console.log("Closing challenge modal");
                    setShowCreateChallenge(false);
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
                onSubmit={challengeForm.handleSubmit(handleChallengeSubmit)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "30px",
                }}
              >
                {/* Left Column - Form Inputs */}
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
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
                        {commandPrefix} challenge_title:
                      </label>
                      <input
                        {...challengeForm.register("title", {
                          required: "Challenge name is required",
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
                        onFocus={(e) => {
                          e.target.style.boxShadow =
                            "0 0 15px rgba(0, 255, 0, 0.3)";
                          e.target.style.borderColor = "var(--terminal-green)";
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow =
                            "0 0 10px rgba(0, 255, 0, 0.1)";
                        }}
                        placeholder="Enter challenge name"
                      />
                      {challengeForm.formState.errors.title && (
                        <div
                          style={{
                            color: "#ff6b6b",
                            fontSize: "14px",
                            marginTop: "6px",
                            fontWeight: "500",
                          }}
                        >
                          {challengeForm.formState.errors.title.message}
                        </div>
                      )}
                    </div>
                    <div>
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
                        {commandPrefix} category:
                      </label>
                      <select
                        {...challengeForm.register("category", {
                          required: "Category is required",
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
                        onFocus={(e) => {
                          e.target.style.boxShadow =
                            "0 0 15px rgba(0, 255, 0, 0.3)";
                          e.target.style.borderColor = "var(--terminal-green)";
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow =
                            "0 0 10px rgba(0, 255, 0, 0.1)";
                        }}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {challengeForm.formState.errors.category && (
                        <div
                          style={{
                            color: "#ff6b6b",
                            fontSize: "14px",
                            marginTop: "6px",
                            fontWeight: "500",
                          }}
                        >
                          {challengeForm.formState.errors.category.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
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
                        {commandPrefix} difficulty:
                      </label>
                      <select
                        {...challengeForm.register("difficulty", {
                          required: "Difficulty is required",
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
                        onFocus={(e) => {
                          e.target.style.boxShadow =
                            "0 0 15px rgba(0, 255, 0, 0.3)";
                          e.target.style.borderColor = "var(--terminal-green)";
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow =
                            "0 0 10px rgba(0, 255, 0, 0.1)";
                        }}
                      >
                        <option value="1">1 - Very Easy</option>
                        <option value="2">2 - Easy</option>
                        <option value="3">3 - Medium</option>
                        <option value="4">4 - Hard</option>
                        <option value="5">5 - Expert</option>
                      </select>
                      {challengeForm.formState.errors.difficulty && (
                        <div
                          style={{
                            color: "#ff6b6b",
                            fontSize: "14px",
                            marginTop: "6px",
                            fontWeight: "500",
                          }}
                        >
                          {challengeForm.formState.errors.difficulty.message}
                        </div>
                      )}
                    </div>
                    <div>
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
                        {commandPrefix} points:
                      </label>
                      <input
                        type="number"
                        {...challengeForm.register("point", {
                          required: "Point are required",
                          min: {
                            value: 1,
                            message: "Point must be at least 1",
                          },
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
                        onFocus={(e) => {
                          e.target.style.boxShadow =
                            "0 0 15px rgba(0, 255, 0, 0.3)";
                          e.target.style.borderColor = "var(--terminal-green)";
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow =
                            "0 0 10px rgba(0, 255, 0, 0.1)";
                        }}
                        placeholder="Enter point value"
                      />
                      {challengeForm.formState.errors.point && (
                        <div
                          style={{
                            color: "#ff6b6b",
                            fontSize: "14px",
                            marginTop: "6px",
                            fontWeight: "500",
                          }}
                        >
                          {challengeForm.formState.errors.point.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ marginBottom: "20px" }}>
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
                      {commandPrefix} description:
                    </label>
                    <textarea
                      {...challengeForm.register("description", {
                        required: "Description is required",
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
                        minHeight: "120px",
                        resize: "vertical",
                        transition: "all 0.3s ease",
                        boxShadow: "0 0 10px rgba(0, 255, 0, 0.1)",
                        wordWrap: "break-word",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "break-word",
                      }}
                      onFocus={(e) => {
                        e.target.style.boxShadow =
                          "0 0 15px rgba(0, 255, 0, 0.3)";
                        e.target.style.borderColor = "var(--terminal-green)";
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow =
                          "0 0 10px rgba(0, 255, 0, 0.1)";
                      }}
                      placeholder="Enter challenge description"
                    />
                    {challengeForm.formState.errors.description && (
                      <div
                        style={{
                          color: "#ff6b6b",
                          fontSize: "14px",
                          marginTop: "6px",
                          fontWeight: "500",
                        }}
                      >
                        {challengeForm.formState.errors.description.message}
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: "20px" }}>
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
                      {commandPrefix} flag:
                    </label>
                    <input
                      {...challengeForm.register("flag", {
                        required: "Flag is required",
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
                      onFocus={(e) => {
                        e.target.style.boxShadow =
                          "0 0 15px rgba(0, 255, 0, 0.3)";
                        e.target.style.borderColor = "var(--terminal-green)";
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow =
                          "0 0 10px rgba(0, 255, 0, 0.1)";
                      }}
                      placeholder="Enter flag"
                    />
                    {challengeForm.formState.errors.flag && (
                      <div
                        style={{
                          color: "#ff6b6b",
                          fontSize: "14px",
                          marginTop: "6px",
                          fontWeight: "500",
                        }}
                      >
                        {challengeForm.formState.errors.flag.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Attachments and Submit */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
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
                      {commandPrefix} attachments:
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "15px",
                      }}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={createChallengeMutation.isPending}
                        multiple
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        disabled={createChallengeMutation.isPending}
                        style={{
                          backgroundColor: "var(--terminal-green)",
                          color: "var(--terminal-black)",
                          border: "2px solid var(--terminal-green)",
                          padding: "10px 16px",
                          fontFamily: "'Roboto Mono', monospace",
                          fontSize: "14px",
                          cursor: "pointer",
                          marginRight: "12px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          transition: "all 0.3s ease",
                          boxShadow: "0 0 10px rgba(0, 255, 0, 0.2)",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.boxShadow =
                            "0 0 15px rgba(0, 255, 0, 0.4)";
                          e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.boxShadow =
                            "0 0 10px rgba(0, 255, 0, 0.2)";
                          e.target.style.transform = "translateY(0)";
                        }}
                      >
                        Select Files
                      </button>
                      {attachments.length > 0 && (
                        <button
                          type="button"
                          onClick={clearAllAttachments}
                          disabled={createChallengeMutation.isPending}
                          style={{
                            backgroundColor: "rgba(255, 107, 107, 0.1)",
                            color: "#ff6b6b",
                            border: "2px solid #ff6b6b",
                            padding: "10px 16px",
                            fontFamily: "'Roboto Mono', monospace",
                            fontSize: "14px",
                            cursor: "pointer",
                            borderRadius: "8px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                            boxShadow: "0 0 10px rgba(255, 107, 107, 0.2)",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.boxShadow =
                              "0 0 15px rgba(255, 107, 107, 0.4)";
                            e.target.style.transform = "translateY(-2px)";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.boxShadow =
                              "0 0 10px rgba(255, 107, 107, 0.2)";
                            e.target.style.transform = "translateY(0)";
                          }}
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Display selected files */}
                    {attachments.length > 0 && (
                      <div
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          border: "2px solid var(--terminal-green)",
                          padding: "15px",
                          borderRadius: "10px",
                          maxHeight: "350px",
                          overflowY: "auto",
                          marginBottom: "25px",
                          boxShadow: "0 0 20px rgba(0, 255, 0, 0.1)",
                        }}
                      >
                        <div
                          style={{
                            color: "var(--terminal-green)",
                            marginBottom: "12px",
                            fontSize: "14px",
                            fontWeight: "600",
                            textShadow: "0 0 5px rgba(0, 255, 0, 0.3)",
                          }}
                        >
                          Selected files ({attachments.length}):
                        </div>
                        {attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 12px",
                              marginBottom: "6px",
                              backgroundColor: "rgba(0, 255, 0, 0.05)",
                              border: "1px solid rgba(0, 255, 0, 0.2)",
                              borderRadius: "6px",
                              transition: "all 0.2s ease",
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor =
                                "rgba(0, 255, 0, 0.1)";
                              e.target.style.borderColor =
                                "rgba(0, 255, 0, 0.3)";
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor =
                                "rgba(0, 255, 0, 0.05)";
                              e.target.style.borderColor =
                                "rgba(0, 255, 0, 0.2)";
                            }}
                          >
                            <span
                              style={{
                                color: "var(--terminal-white)",
                                fontSize: "14px",
                                flex: 1,
                                fontWeight: "500",
                              }}
                            >
                              {attachment.name} (
                              {formatFileSize(attachment.size)})
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(attachment.id)}
                              disabled={createChallengeMutation.isPending}
                              style={{
                                backgroundColor: "rgba(255, 107, 107, 0.1)",
                                color: "#ff6b6b",
                                border: "1px solid #ff6b6b",
                                padding: "4px 8px",
                                fontFamily: "'Roboto Mono', monospace",
                                fontSize: "12px",
                                cursor: "pointer",
                                marginLeft: "10px",
                                borderRadius: "4px",
                                fontWeight: "600",
                                transition: "all 0.2s ease",
                              }}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor =
                                  "rgba(255, 107, 107, 0.2)";
                                e.target.style.boxShadow =
                                  "0 0 8px rgba(255, 107, 107, 0.3)";
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor =
                                  "rgba(255, 107, 107, 0.1)";
                                e.target.style.boxShadow = "none";
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {attachments.length === 0 && (
                      <div
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.4)",
                          border: "2px dashed rgba(0, 255, 0, 0.3)",
                          padding: "20px",
                          borderRadius: "10px",
                          marginBottom: "25px",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "14px",
                            fontStyle: "italic",
                          }}
                        >
                          No files selected
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "auto" }}
                  >
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
                        opacity: createChallengeMutation.isPending ? 0.5 : 1,
                        transition: "all 0.3s ease",
                        boxShadow: "0 0 15px rgba(0, 255, 0, 0.2)",
                      }}
                      disabled={createChallengeMutation.isPending}
                      onMouseOver={(e) => {
                        if (!createChallengeMutation.isPending) {
                          e.target.style.boxShadow =
                            "0 0 20px rgba(0, 255, 0, 0.4)";
                          e.target.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseOut={(e) => {
                        e.target.style.boxShadow =
                          "0 0 15px rgba(0, 255, 0, 0.2)";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      {createChallengeMutation.isPending
                        ? "Creating..."
                        : "Create Challenge"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        console.log("Cancel challenge modal");
                        setShowCreateChallenge(false);
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
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(255, 255, 255, 0.2)";
                        e.target.style.borderColor = "var(--terminal-white)";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(255, 255, 255, 0.1)";
                        e.target.style.borderColor = "var(--border-color)";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Challenge Modal */}
        {showEditChallenge && selectedChallenge && (
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
                maxWidth: "1200px",
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
                  marginBottom: "25px",
                }}
              >
                <h2
                  style={{
                    color: "var(--terminal-green)",
                    fontSize: "24px",
                    fontWeight: "bold",
                    textShadow: "0 0 10px rgba(0, 255, 0, 0.3)",
                  }}
                >
                  ✏️ Edit Challenge: {selectedChallenge.title}
                </h2>
                <button
                  onClick={() => {
                    setShowEditChallenge(false);
                    setSelectedChallenge(null);
                    setEditAttachments([]);
                  }}
                  style={{
                    color: "var(--text-muted)",
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    padding: "5px",
                    borderRadius: "5px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.color = "var(--terminal-white)";
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "var(--text-muted)";
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={editChallengeForm.handleSubmit(
                  handleEditChallengeSubmit
                )}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "30px",
                }}
              >
                {/* Left Column - Form Inputs */}
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
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
                        {commandPrefix} challenge_title:
                      </label>
                      <input
                        {...editChallengeForm.register("title", {
                          required: "Challenge name is required",
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
                        onFocus={(e) => {
                          e.target.style.boxShadow =
                            "0 0 15px rgba(0, 255, 0, 0.3)";
                          e.target.style.borderColor = "var(--terminal-green)";
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow =
                            "0 0 10px rgba(0, 255, 0, 0.1)";
                        }}
                        placeholder="Enter challenge name"
                      />
                      {editChallengeForm.formState.errors.title && (
                        <div
                          style={{
                            color: "#ff6b6b",
                            fontSize: "14px",
                            marginTop: "6px",
                            fontWeight: "500",
                          }}
                        >
                          {editChallengeForm.formState.errors.title.message}
                        </div>
                      )}
                    </div>
                    <div>
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
                        {commandPrefix} category:
                      </label>
                      <select
                        {...editChallengeForm.register("category", {
                          required: "Category is required",
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
                        onFocus={(e) => {
                          e.target.style.boxShadow =
                            "0 0 15px rgba(0, 255, 0, 0.3)";
                          e.target.style.borderColor = "var(--terminal-green)";
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow =
                            "0 0 10px rgba(0, 255, 0, 0.1)";
                        }}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {editChallengeForm.formState.errors.category && (
                        <div
                          style={{
                            color: "#ff6b6b",
                            fontSize: "14px",
                            marginTop: "6px",
                            fontWeight: "500",
                          }}
                        >
                          {editChallengeForm.formState.errors.category.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
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
                        {commandPrefix} difficulty:
                      </label>
                      <select
                        {...editChallengeForm.register("difficulty", {
                          required: "Difficulty is required",
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
                        onFocus={(e) => {
                          e.target.style.boxShadow =
                            "0 0 15px rgba(0, 255, 0, 0.3)";
                          e.target.style.borderColor = "var(--terminal-green)";
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow =
                            "0 0 10px rgba(0, 255, 0, 0.1)";
                        }}
                      >
                        <option value="1">1 - Very Easy</option>
                        <option value="2">2 - Easy</option>
                        <option value="3">3 - Medium</option>
                        <option value="4">4 - Hard</option>
                        <option value="5">5 - Expert</option>
                      </select>
                      {editChallengeForm.formState.errors.difficulty && (
                        <div
                          style={{
                            color: "#ff6b6b",
                            fontSize: "14px",
                            marginTop: "6px",
                            fontWeight: "500",
                          }}
                        >
                          {
                            editChallengeForm.formState.errors.difficulty
                              .message
                          }
                        </div>
                      )}
                    </div>
                    <div>
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
                        {commandPrefix} points:
                      </label>
                      <input
                        type="number"
                        {...editChallengeForm.register("point", {
                          required: "Point are required",
                          min: 1,
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
                        onFocus={(e) => {
                          e.target.style.boxShadow =
                            "0 0 15px rgba(0, 255, 0, 0.3)";
                          e.target.style.borderColor = "var(--terminal-green)";
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow =
                            "0 0 10px rgba(0, 255, 0, 0.1)";
                        }}
                        placeholder="Enter point value"
                      />
                      {editChallengeForm.formState.errors.point && (
                        <div
                          style={{
                            color: "#ff6b6b",
                            fontSize: "14px",
                            marginTop: "6px",
                            fontWeight: "500",
                          }}
                        >
                          {editChallengeForm.formState.errors.point.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ marginBottom: "20px" }}>
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
                      {commandPrefix} description:
                    </label>
                    <textarea
                      {...editChallengeForm.register("description", {
                        required: "Description is required",
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
                        minHeight: "120px",
                        resize: "vertical",
                        transition: "all 0.3s ease",
                        boxShadow: "0 0 10px rgba(0, 255, 0, 0.1)",
                        wordWrap: "break-word",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "break-word",
                      }}
                      onFocus={(e) => {
                        e.target.style.boxShadow =
                          "0 0 15px rgba(0, 255, 0, 0.3)";
                        e.target.style.borderColor = "var(--terminal-green)";
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow =
                          "0 0 10px rgba(0, 255, 0, 0.1)";
                      }}
                      placeholder="Enter challenge description"
                    />
                    {editChallengeForm.formState.errors.description && (
                      <div
                        style={{
                          color: "#ff6b6b",
                          fontSize: "14px",
                          marginTop: "6px",
                          fontWeight: "500",
                        }}
                      >
                        {editChallengeForm.formState.errors.description.message}
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: "20px" }}>
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
                      {commandPrefix} flag:
                    </label>
                    <input
                      {...editChallengeForm.register("flag", {
                        required: "Flag is required",
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
                      onFocus={(e) => {
                        e.target.style.boxShadow =
                          "0 0 15px rgba(0, 255, 0, 0.3)";
                        e.target.style.borderColor = "var(--terminal-green)";
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow =
                          "0 0 10px rgba(0, 255, 0, 0.1)";
                      }}
                      placeholder="Enter flag"
                    />
                    {editChallengeForm.formState.errors.flag && (
                      <div
                        style={{
                          color: "#ff6b6b",
                          fontSize: "14px",
                          marginTop: "6px",
                          fontWeight: "500",
                        }}
                      >
                        {editChallengeForm.formState.errors.flag.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Attachments and Submit */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
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
                      {commandPrefix} attachments:
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "15px",
                      }}
                    >
                      <input
                        type="file"
                        ref={editFileInputRef}
                        onChange={handleEditFileChange}
                        disabled={updateChallengeMutation.isPending}
                        multiple
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        onClick={triggerEditFileInput}
                        disabled={updateChallengeMutation.isPending}
                        style={{
                          backgroundColor: "var(--terminal-green)",
                          color: "var(--terminal-black)",
                          border: "2px solid var(--terminal-green)",
                          padding: "10px 16px",
                          fontFamily: "'Roboto Mono', monospace",
                          fontSize: "14px",
                          cursor: "pointer",
                          marginRight: "12px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          transition: "all 0.3s ease",
                          boxShadow: "0 0 10px rgba(0, 255, 0, 0.2)",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.boxShadow =
                            "0 0 15px rgba(0, 255, 0, 0.4)";
                          e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.boxShadow =
                            "0 0 10px rgba(0, 255, 0, 0.2)";
                          e.target.style.transform = "translateY(0)";
                        }}
                      >
                        Select Files
                      </button>
                      {editAttachments.length > 0 && (
                        <button
                          type="button"
                          onClick={clearAllEditAttachments}
                          disabled={updateChallengeMutation.isPending}
                          style={{
                            backgroundColor: "rgba(255, 107, 107, 0.1)",
                            color: "#ff6b6b",
                            border: "2px solid #ff6b6b",
                            padding: "10px 16px",
                            fontFamily: "'Roboto Mono', monospace",
                            fontSize: "14px",
                            cursor: "pointer",
                            borderRadius: "8px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                            boxShadow: "0 0 10px rgba(255, 107, 107, 0.2)",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.boxShadow =
                              "0 0 15px rgba(255, 107, 107, 0.4)";
                            e.target.style.transform = "translateY(-2px)";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.boxShadow =
                              "0 0 10px rgba(255, 107, 107, 0.2)";
                            e.target.style.transform = "translateY(0)";
                          }}
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Display attachments */}
                    {editAttachments.length > 0 && (
                      <div
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          border: "2px solid var(--terminal-green)",
                          padding: "15px",
                          borderRadius: "10px",
                          maxHeight: "350px",
                          overflowY: "auto",
                          marginBottom: "25px",
                          boxShadow: "0 0 20px rgba(0, 255, 0, 0.1)",
                        }}
                      >
                        <div
                          style={{
                            color: "var(--terminal-green)",
                            marginBottom: "12px",
                            fontSize: "14px",
                            fontWeight: "600",
                            textShadow: "0 0 5px rgba(0, 255, 0, 0.3)",
                          }}
                        >
                          Attachments ({editAttachments.length}):
                        </div>
                        {editAttachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "8px 12px",
                              marginBottom: "6px",
                              backgroundColor: attachment.isExisting
                                ? "rgba(0, 255, 0, 0.1)"
                                : "rgba(0, 255, 0, 0.05)",
                              border: "1px solid rgba(0, 255, 0, 0.2)",
                              borderRadius: "6px",
                              transition: "all 0.2s ease",
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor =
                                "rgba(0, 255, 0, 0.1)";
                              e.target.style.borderColor =
                                "rgba(0, 255, 0, 0.3)";
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor =
                                attachment.isExisting
                                  ? "rgba(0, 255, 0, 0.1)"
                                  : "rgba(0, 255, 0, 0.05)";
                              e.target.style.borderColor =
                                "rgba(0, 255, 0, 0.2)";
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <span
                                style={{
                                  color: "var(--terminal-white)",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                }}
                              >
                                {attachment.name}
                                {!attachment.isExisting &&
                                  attachment.size > 0 && (
                                    <span
                                      style={{
                                        color: "var(--text-muted)",
                                        fontSize: "12px",
                                        marginLeft: "8px",
                                      }}
                                    >
                                      ({formatFileSize(attachment.size)})
                                    </span>
                                  )}
                              </span>
                              {attachment.isExisting && (
                                <div style={{ marginTop: "4px" }}>
                                  <span
                                    style={{
                                      color: "var(--terminal-green)",
                                      fontSize: "12px",
                                      marginRight: "8px",
                                    }}
                                  >
                                    📎 Existing
                                  </span>
                                  {attachment.url && (
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: "var(--terminal-green)",
                                        fontSize: "12px",
                                        textDecoration: "none",
                                        borderBottom:
                                          "1px dotted var(--terminal-green)",
                                      }}
                                      onMouseOver={(e) => {
                                        e.target.style.color =
                                          "var(--terminal-white)";
                                      }}
                                      onMouseOut={(e) => {
                                        e.target.style.color =
                                          "var(--terminal-green)";
                                      }}
                                    >
                                      🔗 Download
                                    </a>
                                  )}
                                </div>
                              )}
                              {!attachment.isExisting &&
                                attachment.size > 0 && (
                                  <div style={{ marginTop: "4px" }}>
                                    <span
                                      style={{
                                        color: "var(--text-muted)",
                                        fontSize: "12px",
                                      }}
                                    >
                                      📄 New: {formatFileSize(attachment.size)}
                                    </span>
                                  </div>
                                )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                removeEditAttachment(attachment.id)
                              }
                              disabled={updateChallengeMutation.isPending}
                              style={{
                                backgroundColor: "rgba(255, 107, 107, 0.1)",
                                color: "#ff6b6b",
                                border: "1px solid #ff6b6b",
                                padding: "4px 8px",
                                fontFamily: "'Roboto Mono', monospace",
                                fontSize: "12px",
                                cursor: "pointer",
                                marginLeft: "10px",
                                borderRadius: "4px",
                                fontWeight: "600",
                                transition: "all 0.2s ease",
                              }}
                              onMouseOver={(e) => {
                                if (!updateChallengeMutation.isPending) {
                                  e.target.style.backgroundColor =
                                    "rgba(255, 107, 107, 0.2)";
                                  e.target.style.boxShadow =
                                    "0 0 8px rgba(255, 107, 107, 0.3)";
                                }
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor =
                                  "rgba(255, 107, 107, 0.1)";
                                e.target.style.boxShadow = "none";
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {editAttachments.length === 0 && (
                      <div
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.4)",
                          border: "2px dashed rgba(0, 255, 0, 0.3)",
                          padding: "20px",
                          borderRadius: "10px",
                          marginBottom: "25px",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "14px",
                            fontStyle: "italic",
                          }}
                        >
                          No files selected
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "auto" }}
                  >
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
                        opacity: updateChallengeMutation.isPending ? 0.5 : 1,
                        transition: "all 0.3s ease",
                        boxShadow: "0 0 15px rgba(0, 255, 0, 0.2)",
                      }}
                      disabled={updateChallengeMutation.isPending}
                      onMouseOver={(e) => {
                        if (!updateChallengeMutation.isPending) {
                          e.target.style.boxShadow =
                            "0 0 20px rgba(0, 255, 0, 0.4)";
                          e.target.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseOut={(e) => {
                        e.target.style.boxShadow =
                          "0 0 15px rgba(0, 255, 0, 0.2)";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      {updateChallengeMutation.isPending
                        ? "Updating..."
                        : "Update Challenge"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditChallenge(false);
                        setSelectedChallenge(null);
                        setEditAttachments([]);
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
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(255, 255, 255, 0.2)";
                        e.target.style.borderColor = "var(--terminal-white)";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(255, 255, 255, 0.1)";
                        e.target.style.borderColor = "var(--border-color)";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedChallenge && (
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
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "20px",
                }}
              >
                ⚠️
              </div>
              <h2
                style={{
                  color: "#ff6b6b",
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "15px",
                  textShadow: "0 0 10px rgba(255, 107, 107, 0.3)",
                }}
              >
                Delete Challenge
              </h2>
              <p
                style={{
                  color: "var(--terminal-white)",
                  fontSize: "16px",
                  marginBottom: "25px",
                  lineHeight: "1.5",
                }}
              >
                Are you sure you want to delete the challenge{" "}
                <strong style={{ color: "var(--terminal-green)" }}>
                  "{selectedChallenge.title}"
                </strong>
                ? This action cannot be undone.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={confirmDelete}
                  disabled={deleteChallengeMutation.isPending}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#ff6b6b",
                    color: "white",
                    border: "2px solid #ff6b6b",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                    opacity: deleteChallengeMutation.isPending ? 0.5 : 1,
                    transition: "all 0.3s ease",
                    boxShadow: "0 0 15px rgba(255, 107, 107, 0.2)",
                  }}
                  onMouseOver={(e) => {
                    if (!deleteChallengeMutation.isPending) {
                      e.target.style.boxShadow =
                        "0 0 20px rgba(255, 107, 107, 0.4)";
                      e.target.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseOut={(e) => {
                    e.target.style.boxShadow =
                      "0 0 15px rgba(255, 107, 107, 0.2)";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  {deleteChallengeMutation.isPending ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedChallenge(null);
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
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    e.target.style.borderColor = "var(--terminal-white)";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    e.target.style.borderColor = "var(--border-color)";
                    e.target.style.transform = "translateY(0)";
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

export default Admin_Challenges;
