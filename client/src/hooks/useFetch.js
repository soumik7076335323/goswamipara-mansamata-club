import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * Data-loading hook with loading/error/refetch.
 * const { data, loading, error, refetch } = useFetch('/api/events', { params });
 */
export function useFetch(url, { params, skip = false, deps = [] } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const seq = useRef(0);
  const paramsKey = JSON.stringify(params || {});

  const load = useCallback(async () => {
    if (skip) return;
    const mySeq = ++seq.current;
    setLoading(true);
    setError(null);
    try {
      const { data: d } = await api.get(url, { params: JSON.parse(paramsKey) });
      if (mySeq === seq.current) setData(d);
    } catch (err) {
      if (mySeq === seq.current) setError(err.friendlyMessage || 'Request failed');
    } finally {
      if (mySeq === seq.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, paramsKey, skip, ...deps]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load, setData };
}
