import { useEffect, useMemo, useRef, useState } from "react";
import { routesApi } from "../services/routesApi";

export function useFetchTickets(searchParams = null) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const inFlightRef = useRef(0);
  const paramsKey = useMemo(
    () => JSON.stringify(searchParams ?? {}),
    [searchParams],
  );

  useEffect(() => {
    const fetchTickets = async () => {
      const requestId = Date.now();
      inFlightRef.current = requestId;
      try {
        setLoading(true);
        const response = await routesApi.search(searchParams ?? {});
        if (inFlightRef.current !== requestId) return;
        setData(response);
        setError(null);
      } catch (err) {
        if (inFlightRef.current !== requestId) return;
        setError(err.message);
      } finally {
        if (inFlightRef.current !== requestId) return;
        setLoading(false);
      }
    };

    fetchTickets();
  }, [paramsKey]);

  return { data, loading, error };
}
