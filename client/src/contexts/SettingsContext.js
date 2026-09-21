import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import api from '../services/api';

const SettingsContext = createContext(null);

/** Loads public website settings once; refreshSettings() re-pulls after admin edits. */
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/settings');
      setSettings(data);
    } catch {
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({ settings, loading, refreshSettings: load }),
    [settings, loading, load]
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
