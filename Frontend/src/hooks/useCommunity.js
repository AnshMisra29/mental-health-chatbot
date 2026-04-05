import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

const fetchCommunityPosts = async ({ pageParam = 1 }) => {
  const { data } = await api.get(`/community/posts?page=${pageParam}&per_page=10`);
  return data;
};

export const useCommunityPosts = () => {
  return useInfiniteQuery({
    queryKey: ["communityPosts"],
    queryFn: fetchCommunityPosts,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.pages) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    staleTime: 0, // Always check in background
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post) => {
      const { data } = await api.post("/community/posts", post);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/community/posts/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    },
  });
};
