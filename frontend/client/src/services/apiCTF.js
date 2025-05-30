import api from "../api";

export async function registerUser(data) {
  try {
    const response = api.post("/api/users/register/", data);
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
    const response = api.post("/api/users/login/", data);
    return (await response).data;
  } catch (err) {
    throw new Error(err);
  }
}
