import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import { CommunityEvent, Group, Member, MemberInput } from "./types";

export function useMembers(search = "", program = "") {
  return useQuery({
    queryKey: ["members", search, program],
    queryFn: async () => (await api.get<Member[]>("/members", { params: { search, program } })).data,
  });
}

export function useMember(id?: string) {
  return useQuery({
    queryKey: ["member", id],
    enabled: Boolean(id),
    queryFn: async () => (await api.get<Member>(`/members/${id}`)).data,
  });
}

export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => (await api.get<Group[]>("/groups")).data,
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => (await api.get<CommunityEvent[]>("/events")).data,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MemberInput) => api.post("/members", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemberInput }) => api.patch(`/members/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["member"] });
    },
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Group>) => api.post("/groups", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CommunityEvent>) => api.post("/events", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CommunityEvent> }) => api.patch(`/events/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useGenerateSeating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/events/${id}/seating/generate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}
