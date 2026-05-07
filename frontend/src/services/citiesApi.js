import { api } from "./api";
import { ENDPOINTS } from "./config";

export const citiesApi = {
  search: async (name) => {
    const response = await api.get(ENDPOINTS.CITIES, { params: { name } });
    return response.data;
  },
};

