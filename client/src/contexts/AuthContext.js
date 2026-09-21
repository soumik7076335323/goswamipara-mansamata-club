import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import api, { setCsrfToken } from '../services/api';

const AuthContext = createContext(null);

function hasSessionHint() {
  return /(?:^|; )gmmc_csrf=/.test(document.cookie);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      // Anonymous visitors never had a session — skip the /me probe entirely
      // so the console stays clean (no expected 401s logged).
      if (!hasSessionHint()) {
        setChecking(false);
        return;
      }
      try {
        const { data } = await api.get('/api/auth/me');
        setUser(data.user);
        if (data.csrfToken) setCsrfToken(data.csrfToken);
      } catch {
        setUser(null);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    setUser(data.user);
    if (data.csrfToken) setCsrfToken(data.csrfToken);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, checking, login, logout, isAdmin: user?.role === 'admin' }),
    [user, checking, login, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
