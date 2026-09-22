import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import api, { setCsrfToken } from "../services/api";

const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = "gmmc_access_token";

function getAccessToken() {
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function setAccessToken(token) {
  try {
    if (token) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {
    // Ignore sessionStorage errors.
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const token = getAccessToken();

      // If there is no stored JWT, there is no authenticated
      // session to restore.
      if (!token) {
        setChecking(false);
        return;
      }

      try {
        const { data } = await api.get("/api/auth/me");

        setUser(data.user);

        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
      } catch {
        // Invalid/expired token.
        setAccessToken("");
        setUser(null);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/api/auth/login", {
      email,
      password,
    });

    // Store the JWT for this browser session.
    if (data.token) {
      setAccessToken(data.token);
    }

    setUser(data.user);

    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }

    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setAccessToken("");
      setCsrfToken("");
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      checking,
      login,
      logout,
      isAdmin: user?.role === "admin",
    }),
    [user, checking, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}
