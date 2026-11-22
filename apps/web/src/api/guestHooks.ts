import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

export interface Guest {
  _id: string;
  firstName: string;
  surname: string;
  telephone?: string;
  email?: string;
  guestOf: string;
  comments?: string;
  archived?: boolean;
}

export interface GuestInput {
  firstName: string;
  surname: string;
  telephone?: string;
  email?: string;
  guestOf: string;
  comments?: string;
}

export function useGuests(memberId?: string, includeArchived = false) {
  return useQuery({
    queryKey: ["guests", memberId, includeArchived],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (memberId) params.memberId = memberId;
      if (includeArchived) params.includeArchived = true;
      return (await api.get<Guest[]>("/guests", { params })).data;
    },
  });
}

export function useGuest(id?: string) {
  return useQuery({
    queryKey: ["guest", id],
    enabled: Boolean(id),
    queryFn: async () => (await api.get<Guest>(`/guests/${id}`)).data,
  });
}

export function useCreateGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GuestInput) => api.post("/guests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
  });
}

export function useUpdateGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GuestInput> }) => api.patch(`/guests/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      queryClient.invalidateQueries({ queryKey: ["guest"] });
    },
  });
}

export function useDeleteGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/guests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
  });
}

export function useArchiveGuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/guests/${id}/archive`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
  });
}
