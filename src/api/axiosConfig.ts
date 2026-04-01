import axios from "axios";

// Vite remplacera cette variable au build par https://api.elix.cleanascode.fr
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_BASE_URL,
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

      if (status === 404 || status === 500 || status === 503) {
        const errorMessages: { [key: number]: string } = {
          404: "La ressource demandée est introuvable",
          500: "Erreur interne du serveur",
          503: "Le service est temporairement indisponible",
        };

        sessionStorage.setItem(
          "errorMessage",
          errorMessages[status] || "Une erreur est survenue",
        );

        globalThis.location.href = "/error";
      }
    } else if (error.request) {
      sessionStorage.setItem(
        "errorMessage",
        "Impossible de contacter le serveur. Vérifiez votre connexion internet.",
      );

      globalThis.location.href = "/error";
    }

    return Promise.reject(error);
  },
);

export default api;