import axios from "axios";

const ACCESS_TOKEN_KEY = "gmmc_access_token";

function readCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));

  return m ? decodeURIComponent(m[1]) : "";
}

function readAccessToken() {
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

let csrfToken = readCookie("gmmc_csrf");

export function setCsrfToken(token) {
  csrfToken = token || "";
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();

  // Always attach JWT when available.
  // This makes authentication work even when the
  // Vercel -> Render cookie is not sent by the browser.
  const accessToken = readAccessToken();

  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // CSRF protection for state-changing requests.
  if (!["get", "head", "options"].includes(method)) {
    const token = csrfToken || readCookie("gmmc_csrf");

    if (token) {
      config.headers = config.headers || {};
      config.headers["X-CSRF-Token"] = token;
    }
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,

  (error) => {
    const resp = error.response;

    const message =
      (resp && resp.data && (resp.data.error || resp.data.message)) ||
      (error.code === "ECONNABORTED" ? "Request timed out" : error.message) ||
      "Request failed";

    error.friendlyMessage = message;
    error.status = resp ? resp.status : 0;
    error.payload = resp ? resp.data : null;

    return Promise.reject(error);
  },
);

export default api;
