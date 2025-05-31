import api from "../api";

export async function registerUser(data) {
  try {
    const response = await api.post("/api/users/register/", data);
    return response.data;
  } catch (err) {
    if (err.status == 400) {
      throw new Error("Username Already Exist");
    }
    throw new Error(err);
  }
}

export async function login(data) {
  try {
    const response = await api.post("/api/users/login/", data);
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
}

export async function getProfile(data) {
  try {
    const response = await api.get("/api/users/me/");
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
    throw new Error(err);
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
