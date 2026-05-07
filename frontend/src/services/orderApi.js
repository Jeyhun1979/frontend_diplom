import { api } from "./api";
import { ENDPOINTS } from "./config";

export const orderApi = {
  create: async (payload) => {
    const response = await api.post(ENDPOINTS.ORDER, payload);
    return response.data;
  },
};

