import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "../services/apiCTF";
import { toast } from "react-toastify";
import "../styles/global.css";

const Admin_Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState("username");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch all users
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAllUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter and sort users
  const filteredUsers =
    users?.filter((user) => {
      const matchesSearch =
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = filterRole === "all" || user.role === filterRole;

      return matchesSearch && matchesRole;
    }) || [];

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === "total_point") {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
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

  // Get user status badge (placeholder - you can implement actual status logic)
  const getUserStatusBadge = () => (
    <span className="badge badge-blue">Active</span>
  );

  // Get user role badge
  const getUserRoleBadge = (role) => (
    <span
      className={`badge ${role === "admin" ? "badge-purple" : "badge-blue"}`}
    >
      {role === "admin" ? "Admin" : "Player"}
    </span>
  );

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card">
            <div className="text-center">
              <div className="terminal-text">Loading users...</div>
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
                Error loading users: {error?.message}
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
                User Management
              </h1>
              <p className="text-muted">
                Monitor and manage user accounts and permissions
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-terminal-green">
                {sortedUsers.length}
              </div>
              <div className="text-muted">users found</div>
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
                placeholder="Username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="challenge-search-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="challenge-search-input"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="player">Players</option>
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
                <option value="username-asc">Username (A-Z)</option>
                <option value="username-desc">Username (Z-A)</option>
                <option value="email-asc">Email (A-Z)</option>
                <option value="email-desc">Email (Z-A)</option>
                <option value="id-asc">ID (Oldest First)</option>
                <option value="id-desc">ID (Newest First)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    User
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Email
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Role
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border-color interactive-row hover:bg-secondary-bg transition-colors duration-200"
                  >
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-tertiary-bg flex items-center justify-center mr-4 border-2 border-border-color">
                          <span className="text-lg font-bold text-terminal-green">
                            {user.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-lg">
                            {user.username}
                          </div>
                          <div className="text-sm text-muted">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        {getUserRoleBadge(user.role)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        {getUserStatusBadge()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted text-lg">No users found</div>
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
              {users?.length || 0}
            </div>
            <div className="text-muted">Total Users</div>
          </div>
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-accent-blue mb-2">
              {users?.filter((u) => u.role === "admin").length || 0}
            </div>
            <div className="text-muted">Admins</div>
          </div>
          <div className="card text-center hover:bg-secondary-bg transition-colors duration-200">
            <div className="text-3xl font-bold text-accent-purple mb-2">
              {users?.filter((u) => u.role === "player").length || 0}
            </div>
            <div className="text-muted">Players</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin_Users;
