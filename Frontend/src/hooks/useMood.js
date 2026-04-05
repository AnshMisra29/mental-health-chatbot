import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

const fetchMoodLogs = async ({ page = 1, per_page = 50 }) => {
  const { data } = await api.get(`/mood/logs?page=${page}&per_page=${per_page}`);
  return data;
};

export const useMoodLogs = (page = 1, per_page = 50) => {
  return useQuery({
    queryKey: ["moodLogs", page, per_page],
    queryFn: () => fetchMoodLogs({ page, per_page }),
    staleTime: 0, // Always check in background
  });
};

export const useCreateMoodLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mood) => {
      const { data } = await api.post("/mood/logs", mood);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moodLogs"] });
    },
  });
};
