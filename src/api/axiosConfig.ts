import axios from "axios";

// Vite remplacera cette variable au build par https://api.elix.cleanascode.fr
const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const API_KEY = import.meta.env.VITE_API_KEY || "";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (API_KEY) {
    config.headers = config.headers ?? {};
    config.headers["x-api-key"] = API_KEY;
  }

  return config;
});

// Intercepteur pour gérer les erreurs d'API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (globalThis.location.pathname === "/error") {
      return Promise.reject(error);
    }

    if (error.response) {
      const status = error.response.status;

      if (status === 404) {
        sessionStorage.setItem(
          "errorMessage",
          "La ressource demandée est introuvable",
        );

        globalThis.location.href = "/error";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
