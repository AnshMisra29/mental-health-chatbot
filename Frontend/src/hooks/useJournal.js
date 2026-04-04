import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

const fetchJournalEntries = async () => {
  const { data } = await api.get("/journal/entries");
  return data;
};

export const useJournalEntries = () => {
  return useQuery({
    queryKey: ["journalEntries"],
    queryFn: fetchJournalEntries,
    staleTime: 0, // Always check in background
  });
};

export const useSaveJournalEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title, content }) => {
      if (id) {
        const { data } = await api.put(`/journal/entries/${id}`, { title, content });
        return data;
      } else {
        const { data } = await api.post("/journal/entries", { title, content });
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
    },
  });
};

export const useDeleteJournalEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/journal/entries/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
    },
  });
};
