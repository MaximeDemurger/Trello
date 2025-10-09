import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBoardsWithStatsForUser, createBoard as createBoardInApi } from '@/lib/boards';
import { useAuth } from '@/providers/AuthProvider';

export const boardQueryKeys = {
  all: ['boards'] as const,
  lists: () => [...boardQueryKeys.all, 'list'] as const,
  list: (userId: string) => [...boardQueryKeys.lists(), userId] as const,
  details: () => [...boardQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...boardQueryKeys.details(), id] as const,
};

export const useBoards = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: boardQueryKeys.list(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const { boards, error } = await fetchBoardsWithStatsForUser(user.id);
      if (error) throw new Error(error);
      return boards || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      organizationId: string;
      title: string;
      description?: string;
      color?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { board, error } = await createBoardInApi({
        ...params,
        userId: user.id,
      });
      if (error) throw new Error(error);
      return board;
    },
    onSuccess: () => {
      // Invalidate and refetch boards
      queryClient.invalidateQueries({ queryKey: boardQueryKeys.lists() });
    },
  });
};

