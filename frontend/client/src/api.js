import axios from "axios";

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

export default api;
