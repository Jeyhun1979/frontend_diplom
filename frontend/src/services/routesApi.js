import { api } from "./api";
import { ENDPOINTS } from "./config";

export const routesApi = {
  search: async (params) => {
    const response = await api.get(ENDPOINTS.ROUTES, { params });
    return response.data;
  },

  last: async () => {
    const response = await api.get(ENDPOINTS.LAST_ROUTES);
    return response.data;
  },

  seats: async (routeId, params) => {
    const response = await api.get(`${ENDPOINTS.SEATS}/${routeId}/seats`, {
      params,
    });
    const data = response.data;
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => {
        const coach = item?.coach ?? null;
        const seats = item?.seats ?? null;
        if (!coach || !Array.isArray(seats)) return null;
        return { ...coach, seats };
      })
      .filter(Boolean);
  },
};

