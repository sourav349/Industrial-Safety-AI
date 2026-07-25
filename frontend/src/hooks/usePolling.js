import { useCallback, useEffect, useState } from "react";

export default function usePolling(fetcher, interval = 3000, initialValue = null) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, interval);
    return () => window.clearInterval(id);
  }, [refresh, interval]);

  return { data, loading, error, refresh };
}
