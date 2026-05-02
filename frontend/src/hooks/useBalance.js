import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export const useBalance = (accountId) => {
  return useQuery({
    queryKey: ["balance", accountId],
    queryFn: async () => {
      const res = await api.get(`/accounts/${accountId}/balance`);
      return res.data.data;
    },
    enabled: !!accountId
  });
};