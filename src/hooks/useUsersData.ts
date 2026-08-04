import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, getPendingInvitations, deleteInvitation, AppRole, updateUserRole } from "@/services/userService";

export const userKeys = {
  all: ["users"] as const,
  list: () => [...userKeys.all, "list"] as const,
  invitations: () => [...userKeys.all, "invitations"] as const,
};

// Hook for fetching all users with React Query caching (5 min stale time)
export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: getAllUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 30,    // 30 minutes memory persistence
  });
}

// Hook for fetching pending invitations with caching
export function usePendingInvitations() {
  return useQuery({
    queryKey: userKeys.invitations(),
    queryFn: getPendingInvitations,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

// Helper mutation to invalidate user cache on role change or deletion
export function useInvalidateUserCache() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: userKeys.all });
  };
}
