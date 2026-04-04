import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../services/api";

const fetchChatHistory = async ({ pageParam = 1 }) => {
  const { data } = await api.get(`/chat/history?page=${pageParam}&per_page=20`);
  return data;
};

export const useChatHistory = () => {
  return useInfiniteQuery({
    queryKey: ["chatHistory"],
    queryFn: fetchChatHistory,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.pages) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    staleTime: 0, // Always check in background for consistency
  });
};
