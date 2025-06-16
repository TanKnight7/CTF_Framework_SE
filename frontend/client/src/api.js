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

api.interceptors.response.use(
  (response) => {
    console.log("Response received:", response);
    if (response?.data?.error) {
      try {
        toast.error(JSON.stringify(response.data.error));
      } catch (e) {
        toast.error(response.data.error);
      }
    }

    if (response?.data?.message) {
      try {
        toast.info(JSON.stringify(response.data.message));
      } catch (e) {
        toast.info(response.data.message);
      }
    }

    if (response?.data?.success) {
      try {
        toast.success(JSON.stringify(response.data.success));
      } catch (e) {
        toast.success(response.data.success);
      }
    }
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

      if (response?.data?.error) {
        try {
          toast.error(JSON.stringify(response.data.error));
        } catch (e) {
          toast.error(response.data.error);
        }
      }

      if (response?.data?.message) {
        try {
          toast.info(JSON.stringify(response.data.message));
        } catch (e) {
          toast.info(response.data.message);
        }
      }
    } else {
      console.error("Network or unknown error:", error);
      toast.error("Something went wrong. Please try again.");
    }

    return Promise.reject(error);
  }
);

export default api;
