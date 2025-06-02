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

api.interceptors.response.use(
  (response) => {
    // Middleware logic before passing the response
    // For example, you can log it or modify it
    console.log("Response received:", response);
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
      if (error.response.status === 401) {
        // Optionally handle unauthorized access
        localStorage.removeItem("Token");
        // Redirect to login page, for example
        window.location.href = "/login";
      }
    } else {
      console.error("API Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
