import { api } from "./api";
import { ENDPOINTS } from "./config";

export const subscribeApi = {
  subscribe: async (email) => {
    const response = await api.post(ENDPOINTS.SUBSCRIBE, null, { params: { email } });
    return response.data;
  },
};

