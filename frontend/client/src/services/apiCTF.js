import api from "../api";

export async function registerUser(data) {
  try {
    const response = await api.post("/api/users/register/", data);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function login(data) {
  try {
    const response = await api.post("/api/users/login/", data);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function getProfile(data) {
  try {
    const response = await api.get("/api/users/me/");
    return response.data;
  } catch (err) {
    return err.response?.data;
    // throw new Error(err);
  }
}

export async function getAllUsers(data) {
  try {
    const response = await api.get("/api/users/");
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
}

export async function getAllSubmissions(data) {
  try {
    const response = await api.get("/api/logs/submissions/");
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
}

export async function getChallengeSolvedByMe(data) {
  try {
    const response = await api.get("/api/challenges/solved/me/");
    return response.data;
  } catch (err) {
    return err.response?.data;
    // throw new Error(err);
  }
}

export async function getLeaderboard(data) {
  try {
    const response = await api.get("/api/leaderboard/");
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
}

export async function createTeam(data) {
  try {
    const response = await api.post("/api/teams/create/", data);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function joinTeam(data) {
  const isValidToken = /^[a-zA-Z0-9-_]+$/.test(data.teamToken);

  if (!isValidToken) {
    return { error: "Invalid team ID or token format." };
  }

  try {
    const response = await api.post(`/api/teams/join/${data.teamToken}/`);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function getTeamDetails() {
  try {
    const response = await api.get(`/api/teams/me/`);
    const data = response.data;

    if (data.members && Array.isArray(data.members)) {
      data.members.sort((a, b) => b.total_point - a.total_point); // Descending order
    }

    if (data.solves && Array.isArray(data.solves)) {
      data.solves.sort((a, b) => new Date(a.solved_at) - new Date(b.solved_at));
    }

    return data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function getCategories() {
  try {
    const response = await api.get(`/api/challenges/categories/`);

    const updatedResponse = response?.data?.map((category) => {
      const lower = category.name.toLowerCase();
      let icon = "fa-question";
      let color = "#607d8b"; // grey
      if (lower.includes("web")) {
        icon = "fa-globe";
        color = "#00bcd4";
      }
      if (lower.includes("crypto")) {
        icon = "fa-lock";
        color = "#9c27b0";
      }
      if (lower.includes("reverse")) {
        icon = "fa-cogs";
        color = "#ff9800";
      }
      if (lower.includes("forensics")) {
        icon = "fa-search";
        color = "#4caf50";
      }
      if (lower.includes("pwn") || lower.includes("binary")) {
        icon = "fa-bug";
        color = "#f44336";
      }
      return { ...category, icon, color };
    });
    return updatedResponse;
  } catch (err) {
    return err.response?.data;
  }
}

export async function getChallenges() {
  try {
    const response = await api.get(`/api/challenges/`);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function submitFlag(data) {
  try {
    const response = await api.post(
      `/api/challenges/${data.challenge_id}/submit/`,
      {
        flag: data.flag,
      }
    );
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function getSolved() {
  try {
    const response = await api.get(`/api/challenges/solved/team/`);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function submitWriteup(data) {
  try {
    const response = await api.post("/api/writeups/submit/", data);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function getWriteups() {
  try {
    const response = await api.get(`/api/writeups/`);
    const modifiedData = response.data.map((writeup) => {
      return {
        ...writeup,
        author: writeup.team ? writeup.team : writeup.user,
      };
    });
    return modifiedData;
  } catch (err) {
    return err.response?.data;
  }
}

export async function updateProfile(data) {
  try {
    const response = await api.put(`/api/users/${data.id}/`, data);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function createCategory(data) {
  try {
    const response = await api.post("/api/challenges/categories/create/", data);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function createChallannge(data) {
  try {
    const response = await api.post("/api/challenges/create/", data);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function getChallengeDetail(challengeId) {
  try {
    const response = await api.get(`/api/challenges/${challengeId}/`);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function updateChallenge(challengeId, data) {
  try {
    const response = await api.put(
      `/api/challenges/${challengeId}/edit/`,
      data
    );
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function deleteChallenge(challengeId) {
  try {
    const response = await api.delete(`/api/challenges/${challengeId}/delete/`);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function deleteWriteup(writeupId) {
  try {
    const response = await api.delete(`/api/writeups/${writeupId}/`);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

// Ticket API functions
export async function createTicket(data) {
  try {
    const response = await api.post("/api/tickets/create/", data);
    return response.data?.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function getAllTickets() {
  try {
    const response = await api.get("/api/tickets/");
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function getTicket(ticketId) {
  try {
    const response = await api.get(`/api/tickets/${ticketId}/`);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function updateTicket(ticketId, data) {
  try {
    const response = await api.put(`/api/tickets/${ticketId}/`, data);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function closeTicket(ticketId) {
  try {
    const response = await api.put(`/api/tickets/${ticketId}/close/`);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function deleteTicket(ticketId) {
  try {
    const response = await api.delete(`/api/tickets/${ticketId}/`);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function createMessage(ticketId, data) {
  try {
    const response = await api.post(
      `/api/tickets/${ticketId}/messages/create/`,
      data
    );
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function getAllMessages(ticketId) {
  try {
    const response = await api.get(`/api/tickets/${ticketId}/messages/`);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function updateMessage(ticketId, messageId, data) {
  try {
    const response = await api.put(
      `/api/tickets/${ticketId}/messages/${messageId}/`,
      data
    );
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function deleteMessage(ticketId, messageId) {
  try {
    const response = await api.delete(
      `/api/tickets/${ticketId}/messages/${messageId}/`
    );
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function getAnnouncements() {
  try {
    const response = await fetch("/api/announcements/");
    return await response.json();
  } catch (err) {
    return err.response?.data;
  }
}

export async function createAnnouncement(data) {
  try {
    const response = await api.post("/api/announcements/create/", data);
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function updateAnnouncement(announcementId, data) {
  try {
    const response = await api.put(
      `/api/announcements/${announcementId}/edit/`,
      data
    );
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function deleteAnnouncement(announcementId) {
  try {
    const response = await api.delete(
      `/api/announcements/${announcementId}/delete/`
    );
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}

export async function submitChallengeReview(challengeId, reviewData) {
  try {
    const response = await api.post(
      `/api/challenges/${challengeId}/review/`,
      reviewData
    );
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
}
