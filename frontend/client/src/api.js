import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = window.location.origin || "http://localhost:9999";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const Token = localStorage.getItem("Token");

    if (Token) {
      config.headers.Authorization = `Token ${Token}`;
    } else {
      config.headers.Authorization = ``;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const ignore = [
  "You have not solved any challenges yet.",
  "You haven't joined a team",
  "Your team haven't solved any challenges",
  "CTF NOT STARTED YET.",
];

const toastResponse = (response) => {
  for (const msg of ignore) {
    if (JSON.stringify(response?.data).includes(msg)) return;
  }

  if (response?.data?.error) {
    toast.error(JSON.stringify(response.data.error));
  }

  if (response?.data?.message) {
    toast.info(JSON.stringify(response.data.message));
  }

  if (response?.data?.success) {
    toast.success(JSON.stringify(response.data.success));
  }
};

api.interceptors.response.use(
  (response) => {
    console.log("Response received:", response);
    toastResponse(response);
    return response;
  },
  (error) => {
    const response = error.response;
    console.log("omg nih", response);
    if (response) {
      if (response.status === 401) {
        localStorage.removeItem("Token");
        window.location.href = "/login";
      }

      toastResponse(response);
    } else {
      console.error("Network or unknown error:", error);
      toast.error("Something went wrong. Please try again.");
    }

    return Promise.reject(error);
  }
);

export default api;
